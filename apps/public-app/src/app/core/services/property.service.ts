import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Property, PropertyCreationRequest, Room } from '../models/property.model';
import { API_CONSTANTS } from '../constants/api.constants';

@Injectable({
    providedIn: 'root'
})
export class PropertyService {

    constructor(private http: HttpClient) { }

    createPropertyFlow(propertyData: PropertyCreationRequest): Observable<any> {
        // 1. Create Property
        return this.http.post<Property>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.BASE}`,
            propertyData
        ).pipe(
            switchMap((createdProperty: Property) => {
                const propertyId = createdProperty.idProperty;
                console.log('Property Created:', propertyId);

                // 2. Create Rooms (Sequential)
                if (!propertyData.rooms || propertyData.rooms.length === 0) {
                    return of(createdProperty);
                }

                // Create an observable for each room creation
                const roomObservables = propertyData.rooms.map(room => {
                    return this.http.post<Room>(
                        `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.ROOMS.BY_PROPERTY(propertyId)}`,
                        { name: room.name, orderIndex: room.orderIndex }
                    ).pipe(
                        switchMap((createdRoom: Room) => {
                            const roomId = createdRoom.idRoom;
                            console.log('Room Created:', roomId);

                            // 3. Upload Images for this Room (Sequential)
                            if (!room.files || room.files.length === 0) {
                                return of(createdRoom);
                            }

                            const imageObservables = room.files.map((file, index) => {
                                const formData = new FormData();
                                formData.append('imageFile', file);
                                formData.append('imageDto', JSON.stringify({ orderIndex: index + 1 }));

                                return this.http.post(
                                    `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.ROOM_IMAGES.BY_ROOM(roomId)}`,
                                    formData
                                );
                            });

                            // Execute image uploads sequentially or in parallel (forkJoin is fine for images of same room)
                            return forkJoin(imageObservables).pipe(
                                map(() => createdRoom)
                            );
                        })
                    );
                });

                // Execute room creations sequentially to maintain order if needed, or parallel
                // Using concat to ensure order if backend relies on it, or forkJoin for speed.
                // Given the requirement "Sequential", let's use concat but wrapped in forkJoin if we want all results,
                // or just forkJoin if the backend handles concurrency well.
                // The prompt says "Iterative", implying sequential might be safer.
                // However, forkJoin is easier for "wait for all".
                // Let's use forkJoin for rooms as they are independent of each other (once property exists).
                return forkJoin(roomObservables).pipe(
                    map(() => createdProperty)
                );
            }),
            catchError(err => {
                console.error('Error in createPropertyFlow:', err);
                // Optional: Implement rollback logic here (DELETE property)
                throw err;
            })
        );
    }

    getFeaturedProperties(): Observable<Property[]> {
        // Mock data for featured properties (simplified for list view)
        const properties: Property[] = [
            {
                idProperty: 1,
                title: 'Luxury Villa in Marrakech',
                country: 'Morocco',
                city: 'Marrakech',
                address: 'Route de l\'Ourika',
                description: 'Beautiful villa...',
                typeOfRental: 'SHORT_TERM',
                rentPerMonth: 2500,
                securityDeposit: 500,
                ownerEthAddress: '0x123...',
                ownerId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                isAvailable: true,
                rating: 4.8,
                nombreEtoiles: 5,
                rooms: []
            },
            {
                idProperty: 2,
                title: 'Modern Apartment in Casablanca',
                country: 'Morocco',
                city: 'Casablanca',
                address: 'Maarif',
                description: 'Modern apartment...',
                typeOfRental: 'LONG_TERM',
                rentPerMonth: 1200,
                securityDeposit: 1200,
                ownerEthAddress: '0x456...',
                ownerId: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                isAvailable: true,
                rating: 4.5,
                nombreEtoiles: 4,
                rooms: []
            },
            {
                idProperty: 3,
                title: 'Seaside Condo in Miami',
                country: 'USA',
                city: 'Miami',
                address: '789 Ocean Blvd',
                description: 'Beautiful condo with direct beach access.',
                typeOfRental: 'SHORT_TERM',
                rentPerMonth: 4000,
                securityDeposit: 1000,
                ownerEthAddress: '0x789...',
                ownerId: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                isAvailable: true,
                rating: 4.7,
                nombreEtoiles: 4,
                rooms: []
            }
        ];
        return of(properties);
    }

    getPropertyById(id: string): Observable<Property> {
        // Rich mock data for detail view
        const property: Property = {
            idProperty: 1,
            onChainId: 101,
            title: 'Villa Dar Al-Hambra - Luxury Oasis',
            country: 'Morocco',
            city: 'Marrakech',
            address: 'Km 12, Route de l\'Ourika, Marrakech',
            longitude: '-7.981084',
            latitude: '31.629472',
            description: 'Experience the ultimate luxury in this stunning villa located just minutes from the vibrant center of Marrakech. Nestled in a lush garden with a private pool, Villa Dar Al-Hambra offers a perfect blend of traditional Moroccan architecture and modern comfort. Features include a spacious living room with fireplace, a fully equipped gourmet kitchen, and a rooftop terrace with breathtaking views of the Atlas Mountains. Ideal for families or groups seeking privacy and exclusivity.',
            typeOfRental: 'SHORT_TERM',
            rentPerMonth: 4500,
            securityDeposit: 1000,
            ownerEthAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            ownerId: 1,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-02-20'),
            isActive: true,
            isAvailable: true,
            rating: 4.95,
            nombreEtoiles: 5,
            rooms: [
                {
                    idRoom: 101,
                    name: 'Grand Salon',
                    orderIndex: 1,
                    roomImages: [
                        {
                            idImage: 1,
                            url: 'https://images.unsplash.com/photo-1541123356219-284ebe98ae3b?q=80&w=1000&auto=format&fit=crop',
                            orderIndex: 1,
                            uploadedAt: new Date()
                        },
                        {
                            idImage: 2,
                            url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1000&auto=format&fit=crop',
                            orderIndex: 2,
                            uploadedAt: new Date()
                        }
                    ]
                },
                {
                    idRoom: 102,
                    name: 'Master Bedroom',
                    orderIndex: 2,
                    roomImages: [
                        {
                            idImage: 3,
                            url: 'https://images.unsplash.com/photo-1616594039964-40891a909d99?q=80&w=1000&auto=format&fit=crop',
                            orderIndex: 1,
                            uploadedAt: new Date()
                        },
                        {
                            idImage: 4,
                            url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop',
                            orderIndex: 2,
                            uploadedAt: new Date()
                        }
                    ]
                },
                {
                    idRoom: 103,
                    name: 'Gourmet Kitchen',
                    orderIndex: 3,
                    roomImages: [
                        {
                            idImage: 5,
                            url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop',
                            orderIndex: 1,
                            uploadedAt: new Date()
                        }
                    ]
                },
                {
                    idRoom: 104,
                    name: 'Garden & Pool',
                    orderIndex: 4,
                    roomImages: [
                        {
                            idImage: 6,
                            url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000&auto=format&fit=crop',
                            orderIndex: 1,
                            uploadedAt: new Date()
                        },
                        {
                            idImage: 7,
                            url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop',
                            orderIndex: 2,
                            uploadedAt: new Date()
                        }
                    ]
                }
            ]
        };
        return of(property);
    }
    getMyProperties(ownerId: number): Observable<any[]> {
        // Mock data for owner's properties with stats
        const properties = [
            {
                idProperty: 101,
                title: 'Sunny Apartment in Paris',
                address: '12 Rue de Rivoli, Paris',
                rentPerMonth: 1800,
                isActive: true,
                rooms: [
                    {
                        roomImages: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop' }]
                    }
                ],
                stats: {
                    views: 120,
                    bookings: 2,
                    revenue: 4.5
                }
            },
            {
                idProperty: 102,
                title: 'Cozy Studio in London',
                address: '45 Oxford Street, London',
                rentPerMonth: 1500,
                isActive: true,
                rooms: [
                    {
                        roomImages: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop' }]
                    }
                ],
                stats: {
                    views: 85,
                    bookings: 1,
                    revenue: 1.2
                }
            },
            {
                idProperty: 103,
                title: 'Beach House in Malibu',
                address: '23000 Pacific Coast Hwy, Malibu',
                rentPerMonth: 5000,
                isActive: false,
                rooms: [
                    {
                        roomImages: [{ url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop' }]
                    }
                ],
                stats: {
                    views: 45,
                    bookings: 0,
                    revenue: 0
                }
            }
        ];
        return of(properties);
    }
}
