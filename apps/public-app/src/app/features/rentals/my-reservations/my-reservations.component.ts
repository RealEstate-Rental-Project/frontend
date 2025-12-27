import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RentalService } from '../../../core/services/rental.service';
import { RentalRequest, RentalStatus } from '../../../core/models/rental.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
    selector: 'app-my-reservations',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-reservations.component.html',
    styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit {
    reservations$: Observable<RentalRequest[]> = of([]);
    loading = true;
    error: string | null = null;

    constructor(private rentalService: RentalService) { }

    ngOnInit(): void {
        this.loadReservations();
    }

    loadReservations() {
        this.loading = true;
        this.reservations$ = this.rentalService.getMyRentalRequests().pipe(
            map(requests => {
                this.loading = false;
                // Sort by most recent
                return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }),
            catchError(err => {
                console.error('Error loading reservations', err);
                this.loading = false;
                this.error = 'Failed to load reservations. Please try again later.';
                return of([]);
            })
        );
    }

    getStatusClass(status: RentalStatus): string {
        switch (status) {
            case RentalStatus.ACCEPTED:
                return 'status-accepted';
            case RentalStatus.PENDING:
                return 'status-pending';
            case RentalStatus.REJECTED:
                return 'status-rejected';
            case RentalStatus.EXPIRED:
                return 'status-expired';
            case RentalStatus.CANCELLED:
                return 'status-cancelled';
            default:
                return '';
        }
    }
}
