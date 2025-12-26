import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Property } from '../models/property.model';

export interface SearchCriteria {
    city?: string;
    minRentAmount?: number;
    maxRentAmount?: number;
    typeOfRental?: 'MONTHLY' | 'DAILY';
    latitude?: number;
    longitude?: number;
    radiusInKm?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor() { }

    searchProperties(criteria: SearchCriteria): Observable<Property[]> {
        console.log('Searching with criteria:', criteria);
        // Return empty array or mock results for now
        return of([]);
    }
}
