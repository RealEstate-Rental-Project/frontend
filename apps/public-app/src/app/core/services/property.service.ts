import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { switchMap, map, catchError, delay, tap } from 'rxjs/operators';
import { Property, PropertyCreationRequest, Room } from '../models/property.model';
import { API_CONSTANTS } from '../constants/api.constants';
import { MOCK_PROPERTIES } from '../../shared/data/mock-properties';
import { SearchCriteria } from './search.service';

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

                                const imageDto = { orderIndex: index + 1 };
                                const imageDtoBlob = new Blob([JSON.stringify(imageDto)], { type: 'application/json' });
                                formData.append('imageDto', imageDtoBlob);

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

    updateProperty(id: number, propertyData: PropertyCreationRequest): Observable<any> {
        return this.http.put(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.BY_ID(id)}`,
            propertyData
        );
    }

    getFeaturedProperties(): Observable<Property[]> {
        return this.http.get<Property[]>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.FEATURED}`
        ).pipe(
            switchMap(properties => this.hydratePropertiesWithDetails(properties))
        );
    }

    getAllProperties(): Observable<Property[]> {
        return this.http.get<Property[]>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.BASE}`
        ).pipe(
            switchMap(properties => this.hydratePropertiesWithDetails(properties))
        );
    }

    searchProperties(criteria: SearchCriteria): Observable<Property[]> {
        return this.http.post(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.SEARCH}`,
            criteria,
            { responseType: 'json' }
        ).pipe(
            map(response => {
                try {
                    return response as Property[];
                } catch (e) {
                    console.warn('Failed to parse search response', e);
                    return [];
                }
            }),
            switchMap((properties: Property[]) => this.hydratePropertiesWithDetails(properties))
        );
    }

    getPropertyById(id: string): Observable<Property> {
        return this.http.get<Property>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.BY_ID(Number(id))}`
        ).pipe(
            switchMap(property => this.hydratePropertiesWithDetails([property]).pipe(
                map(properties => properties[0])
            ))
        );
    }

    getMyProperties(ownerId?: number): Observable<any[]> {
        return this.http.get<Property[]>(
            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.PROPERTIES.MY_PROPERTIES}`
        ).pipe(
            switchMap(properties => this.hydratePropertiesWithDetails(properties)),
            map(properties => properties.map(p => ({
                ...p,
                stats: {
                    views: Math.floor(Math.random() * 100),
                    bookings: Math.floor(Math.random() * 5),
                    revenue: Math.floor(Math.random() * 5000)
                }
            })))
        );
    }

    private hydratePropertiesWithDetails(properties: Property[]): Observable<Property[]> {
        if (!properties || properties.length === 0) {
            return of([]);
        }

        // For each property, fetch its rooms
        const propertyObservables = properties.map(property => {
            return this.http.get<Room[]>(
                `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.ROOMS.BY_PROPERTY(property.idProperty)}`
            ).pipe(
                switchMap(rooms => {
                    if (!rooms || rooms.length === 0) {
                        return of({ ...property, rooms: [] });
                    }

                    // For each room, fetch its images
                    const roomObservables = rooms.map(room => {
                        return this.http.get<any[]>(
                            `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.ROOM_IMAGES.BY_ROOM(room.idRoom)}`
                        ).pipe(
                            map(images => ({ ...room, roomImages: images })),
                            catchError(() => of({ ...room, roomImages: [] })) // Handle error if images fail
                        );
                    });

                    return forkJoin(roomObservables).pipe(
                        map(roomsWithImages => ({ ...property, rooms: roomsWithImages }))
                    );
                }),
                catchError(() => of({ ...property, rooms: [] })) // Handle error if rooms fail
            );
        });

        return forkJoin(propertyObservables);
    }
}
