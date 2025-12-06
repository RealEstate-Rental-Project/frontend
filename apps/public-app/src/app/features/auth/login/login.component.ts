import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MetamaskService } from '../services/metamask.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    step: 'connect' | 'register' = 'connect';
    loading = false;
    error: string | null = null;
    walletAddress: string | null = null;
    registerForm: FormGroup;

    constructor(
        private metamaskService: MetamaskService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            walletAddress: [{ value: '', disabled: true }, Validators.required]
        });
    }

    async connectAndLogin() {
        this.loading = true;
        this.error = null;
        try {
            // A. Connect Wallet
            const address = await this.metamaskService.connectWallet();
            this.walletAddress = address;

            // B. Get Nonce
            let nonce: string;
            try {
                nonce = await this.authService.getNonce(address);
            } catch (e: any) {
                if (e.response?.status === 404) {
                    // User not found, switch to register
                    this.switchToRegister(address);
                    return;
                }
                throw e;
            }

            // D. Sign Message
            const signature = await this.metamaskService.signMessage(
                `Sign this message to authenticate: ${nonce}`
            );

            // E. Login
            await this.authService.login(address, signature);

            // F. Success
            this.router.navigate(['/dashboard']); // Redirect to dashboard or home
        } catch (err: any) {
            console.error(err);
            if (err.code === 4001) {
                this.error = 'User rejected the request.';
            } else {
                this.error = err.message || 'An unexpected error occurred.';
            }
        } finally {
            this.loading = false;
        }
    }

    switchToRegister(walletAddress: string) {
        this.step = 'register';
        this.registerForm.patchValue({ walletAddress });
        this.loading = false;
    }

    async onRegister() {
        if (this.registerForm.invalid) return;

        this.loading = true;
        this.error = null;

        try {
            const userData = this.registerForm.getRawValue();
            await this.authService.register(userData);

            // After register, try to login automatically or ask user to sign again
            // For simplicity, let's ask to sign again to verify ownership one last time or just redirect
            // Assuming register returns tokens or we just redirect to login flow

            // Let's try to login immediately if the backend supports it, or reset to connect step
            this.step = 'connect';
            this.error = 'Registration successful! Please sign to log in.';
            // Optionally auto-trigger login flow here
        } catch (err: any) {
            this.error = err.message || 'Registration failed.';
        } finally {
            this.loading = false;
        }
    }
}
