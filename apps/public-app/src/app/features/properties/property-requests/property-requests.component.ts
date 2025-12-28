import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalService } from '../../../core/services/rental.service';
import { ToastService } from '../../../core/services/toast.service';
import { RentalRequest, RentalStatus } from '../../../core/models/rental.model';

@Component({
  selector: 'app-property-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-requests.component.html',
  styleUrls: ['./property-requests.component.scss']
})
export class PropertyRequestsComponent implements OnInit {
  @Input() propertyId!: number;
  @Output() close = new EventEmitter<void>();

  requests: RentalRequest[] = [];
  loading = true;
  processingId: number | null = null;

  constructor(
    private rentalService: RentalService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.rentalService.getRequestsByPropertyId(this.propertyId).subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading requests', err);
        this.toastService.show('Failed to load rental requests', 'error');
        this.loading = false;
      }
    });
  }

  updateStatus(request: RentalRequest, status: 'ACCEPTED' | 'REJECTED') {
    const action = status === 'ACCEPTED' ? 'accept' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this tenant?`)) return;

    this.processingId = request.idRequest;
    this.rentalService.updateRequestStatus(request.idRequest, status).subscribe({
      next: () => {
        this.toastService.show(`Request ${action}ed successfully!`, 'success');
        request.status = status === 'ACCEPTED' ? RentalStatus.ACCEPTED : RentalStatus.REJECTED;
        this.processingId = null;
      },
      error: (err) => {
        console.error(`Error ${action}ing request`, err);
        this.toastService.show(`Failed to ${action} request`, 'error');
        this.processingId = null;
      }
    });
  }
}
