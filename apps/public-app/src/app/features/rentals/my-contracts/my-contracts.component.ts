import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RentalService } from '../../../core/services/rental.service';
import { BlockchainService } from '../../../core/services/blockchain.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-my-contracts',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-contracts.component.html',
    styleUrls: ['./my-contracts.component.scss']
})
export class MyContractsComponent implements OnInit {
    contracts: any[] = [];
    loading = true;
    processingId: number | null = null;

    constructor(
        private rentalService: RentalService,
        private blockchainService: BlockchainService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadContracts();
    }

    loadContracts() {
        this.loading = true;
        this.rentalService.getMyContracts().subscribe({
            next: (data) => {
                this.contracts = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load contracts', err);
                this.toastService.show('Failed to load contracts', 'error');
                this.loading = false;
            }
        });
    }

    async confirmKeyDelivery(contract: any) {
        if (!contract.agreementIdOnChain) {
            this.toastService.show('Invalid contract data: Missing blockchain ID', 'error');
            return;
        }

        this.processingId = contract.idContract;
        this.toastService.show('Initiating blockchain transaction... Please confirm in MetaMask.', 'info');

        try {
            // 1. Blockchain Call
            const receipt = await this.blockchainService.activateAgreement(contract.agreementIdOnChain);
            console.log('Transaction confirmed:', receipt);
            this.toastService.show('Transaction confirmed on blockchain. Syncing...', 'info');

            // 2. Backend Sync
            this.rentalService.confirmKeyDelivery(contract.idContract).subscribe({
                next: () => {
                    this.toastService.show('Contract activated! Rent transferred to owner.', 'success');
                    this.processingId = null;
                    this.loadContracts(); // Refresh list
                },
                error: (err) => {
                    console.error('Backend sync failed', err);
                    this.toastService.show('Blockchain transaction succeeded but backend sync failed. Please contact support.', 'warning');
                    this.processingId = null;
                }
            });

        } catch (error: any) {
            console.error('Activation failed', error);
            this.toastService.show('Activation failed: ' + (error.message || 'Unknown error'), 'error');
            this.processingId = null;
        }
    }

    getStatusClass(state: string): string {
        switch (state) {
            case 'ACTIVE': return 'active';
            case 'COMPLETED': return 'completed';
            case 'PENDING_RESERVATION': return 'pending';
            case 'CANCELLED': return 'cancelled';
            default: return 'default';
        }
    }
}
