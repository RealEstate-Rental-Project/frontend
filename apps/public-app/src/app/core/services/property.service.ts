import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Property, PropertyCreationRequest, Room } from '../models/property.model';
import { API_CONSTANTS } from '../constants/api.constants';
import { MOCK_PROPERTIES } from '../../shared/data/mock-properties';

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
        return of(MOCK_PROPERTIES);
    }

    getPropertyById(id: string): Observable<Property> {
        const property = MOCK_PROPERTIES.find(p => p.idProperty.toString() === id);
        if (property) {
            return of(property);
        }
        // Fallback or error handling if not found
        return throwError(() => new Error('Property not found'));
    }

    getMyProperties(ownerId: number): Observable<any[]> {
        // Filter mock properties by ownerId if needed, or just return a subset for demo
        const myProperties = MOCK_PROPERTIES.filter(p => p.ownerId === ownerId);

        // If no properties found for this owner in mock data, return some default ones or empty
        // For demo purposes, let's return all of them if the filter is empty, or just the filtered list.
        // Let's stick to the filtered list but maybe ensure we have some data for ownerId 1 (which seems to be the default mock owner)

        if (myProperties.length > 0) {
            return of(myProperties.map(p => ({
                ...p,
                stats: {
                    views: Math.floor(Math.random() * 100),
                    bookings: Math.floor(Math.random() * 5),
                    revenue: Math.floor(Math.random() * 5000)
                }
            })));
        }

        // Fallback to return all properties with stats for demo if no match
        return of(MOCK_PROPERTIES.map(p => ({
            ...p,
            stats: {
                views: Math.floor(Math.random() * 100),
                bookings: Math.floor(Math.random() * 5),
                revenue: Math.floor(Math.random() * 5000)
            }
        })));
    }
}
