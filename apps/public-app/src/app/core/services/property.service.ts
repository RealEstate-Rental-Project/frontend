import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Property } from '../models/property.model';

@Injectable({
    providedIn: 'root'
})
export class PropertyService {

    constructor() { }

    getFeaturedProperties(): Observable<Property[]> {
        // Mock Data
        const properties: Property[] = [
            {
                idProperty: 1,
                onChainId: 101,
                title: 'Luxury Villa in Beverly Hills',
                country: 'USA',
                city: 'Los Angeles',
                address: '123 Palm Drive',
                description: 'A stunning 5-bedroom villa with pool and ocean view.',
                typeOfRental: 'SHORT_TERM',
                rentPerMonth: 15000,
                securityDeposit: 5000,
                isAvailable: true,
                isActive: true,
                ownerId: 1,
                ownerEthAddress: '0x123...',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                idProperty: 2,
                onChainId: 102,
                title: 'Modern Apartment in Paris',
                country: 'France',
                city: 'Paris',
                address: '45 Champs-Élysées',
                description: 'Chic 2-bedroom apartment in the heart of Paris.',
                typeOfRental: 'LONG_TERM',
                rentPerMonth: 3500,
                securityDeposit: 7000,
                isAvailable: true,
                isActive: true,
                ownerId: 2,
                ownerEthAddress: '0x456...',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                idProperty: 3,
                onChainId: 103,
                title: 'Seaside Condo in Miami',
                country: 'USA',
                city: 'Miami',
                address: '789 Ocean Blvd',
                description: 'Beautiful condo with direct beach access.',
                typeOfRental: 'SHORT_TERM',
                rentPerMonth: 6000,
                securityDeposit: 2000,
                isAvailable: true,
                isActive: true,
                ownerId: 3,
                ownerEthAddress: '0x789...',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        return of(properties);
    }
}
