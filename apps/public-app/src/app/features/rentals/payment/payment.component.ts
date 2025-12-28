import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../../core/services/rental.service';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { ToastService } from '../../../core/services/toast.service';
import { RentalRequest } from '../../../core/models/rental.model';
import { parseEther } from 'ethers';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  request: RentalRequest | null = null;
  loading = true;
  processing = false;

  durationMonths = 1;
  additionalDays = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rentalService: RentalService,
    private blockchainService: BlockchainService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    // In a real app, we would fetch the request by ID. 
    // For now, we'll fetch all requests and find the one matching the ID in the route.
    // Or better, add a getRequestById method to the service.
    // Since I don't have getRequestById, I'll use getMyRentalRequests and filter.
    const requestId = Number(this.route.snapshot.paramMap.get('id'));

    this.rentalService.getMyRentalRequests().subscribe({
      next: (requests) => {
        this.request = requests.find(r => r.idRequest === requestId) || null;
        this.loading = false;
        if (!this.request) {
          this.toastService.show('Request not found', 'error');
          this.router.navigate(['/rentals/my-reservations']);
        }
      },
      error: (err) => {
        console.error('Error loading request', err);
        this.loading = false;
      }
    });
  }

  get totalAmount(): number {
    if (!this.request) return 0;
    // Initial payment is usually 1st month rent + security deposit
    // The prompt says: (Loyer * 1) + Caution
    return this.request.property.rentAmount + this.request.property.securityDeposit;
  }

  async processPayment() {
    if (!this.request) return;

    this.processing = true;
    try {
      this.toastService.show('Please confirm transaction in MetaMask...', 'info');

      const totalEth = this.totalAmount.toString();
      const totalWei = parseEther(totalEth).toString();

      // 1. Blockchain Transaction
      const result = await this.blockchainService.reserveProperty(
        this.request.property.onChainId, // Use onChainId
        this.durationMonths,
        this.additionalDays,
        totalWei
      );

      console.log('Blockchain transaction successful:', result);
      this.toastService.show('Payment successful! Creating contract...', 'success');

      // 2. Calculate End Date
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + this.durationMonths);
      endDate.setDate(endDate.getDate() + this.additionalDays);

      // 3. Create Contract in Backend
      const contractData = {
        rentalRequestId: this.request.idRequest,
        agreementIdOnChain: result.agreementId,
        propertyId: this.request.propertyId,
        ownerId: this.request.property.ownerId, // Assuming property object has ownerId
        securityDeposit: this.request.property.securityDeposit,
        rentAmount: this.request.property.rentAmount,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        initialPaymentAmount: this.request.property.rentAmount, // Initial rent paid
        initialTxHash: result.receipt.hash
      };

      this.rentalService.createContract(contractData).subscribe({
        next: () => {
          this.toastService.show('Contract signed successfully!', 'success');
          this.router.navigate(['/rentals/my-contracts']); // Assuming this route exists or will exist
        },
        error: (err) => {
          console.error('Error creating contract', err);
          this.toastService.show('CRITICAL: Payment made but contract creation failed. Contact support.', 'error');
          this.processing = false;
        }
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.code === 'ACTION_REJECTED') {
        this.toastService.show('Transaction rejected by user.', 'error');
      } else {
        this.toastService.show('Payment failed.', 'error');
      }
      this.processing = false;
    }
  }
}
