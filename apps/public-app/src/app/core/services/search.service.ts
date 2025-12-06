import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Property } from '../models/property.model';

export interface SearchCriteria {
    location?: string;
    type?: 'LONG_TERM' | 'SHORT_TERM';
    minPrice?: number;
    maxPrice?: number;
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
