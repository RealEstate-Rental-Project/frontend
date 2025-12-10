import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { RentalRequestDTO } from '../models/rental.model';
import { API_CONSTANTS } from '../constants/api.constants';

@Injectable({
    providedIn: 'root'
})
export class RentalService {

    constructor(private http: HttpClient) { }

    createRentalRequest(dto: RentalRequestDTO): Observable<any> {
        console.log('Creating rental request:', dto);
        // Simulate API call
        return of({ success: true, message: 'Reservation request sent successfully!', data: dto }).pipe(
            delay(1000), // Simulate network latency
            tap(() => console.log('Rental request simulated success'))
        );

        // Real implementation would be:
        // return this.http.post(`${API_CONSTANTS.GATEWAY_URL}/api/rentals`, dto);
    }
}
