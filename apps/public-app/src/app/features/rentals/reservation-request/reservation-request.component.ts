import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Property } from '../../../core/models/property.model';
import { RentalService } from '../../../core/services/rental.service';
import { RentalRequestDTO } from '../../../core/models/rental.model';

@Component({
  selector: 'app-reservation-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-request.component.html',
  styleUrls: ['./reservation-request.component.scss'],
})
export class ReservationRequestComponent implements OnInit {
  @Input() property!: Property;
  @Input() isOwner = false;
  @Output() close = new EventEmitter<void>();

  reservationForm: FormGroup;
  durationDays = 0;
  proratedRent = 0;
  totalPrice = 0;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private rentalService: RentalService) {
    this.reservationForm = this.fb.group(
      {
        startDate: ['', [Validators.required, this.futureDateValidator]],
        endDate: ['', [Validators.required]],
      },
      { validators: this.dateRangeValidator }
    );
  }

  ngOnInit(): void {
    this.reservationForm.valueChanges.subscribe(() => {
      this.calculatePrice();
    });
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (endDate <= startDate) {
        return { invalidRange: true };
      }
    }
    return null;
  }

  calculatePrice(): void {
    if (this.reservationForm.invalid) {
      this.durationDays = 0;
      this.proratedRent = 0;
      this.totalPrice = 0;
      return;
    }

    const start = new Date(this.reservationForm.get('startDate')?.value);
    const end = new Date(this.reservationForm.get('endDate')?.value);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    this.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (this.durationDays > 0) {
      const dailyRate = this.property.rentAmount / 30;
      this.proratedRent = dailyRate * this.durationDays;
      this.totalPrice = this.proratedRent + this.property.securityDeposit;
    }
  }

  onSubmit(): void {
    if (this.isOwner) {
      this.errorMessage =
        'You cannot send a reservation request for your own property.';
      return;
    }

    if (this.reservationForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const dto: RentalRequestDTO = {
      propertyId: this.property.idProperty,
      startDate: new Date(
        this.reservationForm.get('startDate')?.value
      ).toISOString(),
      endDate: new Date(
        this.reservationForm.get('endDate')?.value
      ).toISOString(),
    };

    this.rentalService.createRentalRequest(dto).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Reservation request sent successfully!';
        setTimeout(() => {
          this.close.emit();
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          'Failed to send reservation request. Please try again.';
        console.error(err);
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
