import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MetamaskService } from '../services/metamask.service';
import { AuthService } from '../services/auth.service';
import { RegisterComponent } from '../register/register.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RegisterComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loading = false;
    error: string | null = null;
    walletAddress: string | null = null;
    showRegisterForm = false;

    constructor(
        private metamaskService: MetamaskService,
        private authService: AuthService,
        private router: Router
    ) { }

    async connectAndLogin() {
        this.loading = true;
        this.error = null;
        try {
            // 1. Connect Wallet
            const address = await this.metamaskService.connectWallet();
            this.walletAddress = address;

            // 2. Get Nonce
            let nonce: string;
            try {
                nonce = await this.authService.getNonce(address);
            } catch (e: any) {
                if (e.status === 404 || e.error?.error === 'USER_NOT_FOUND') {
                    // User not found, switch to register
                    this.showRegisterForm = true;
                    return;
                }
                throw e;
            }

            // 3. Sign Message
            const signature = await this.metamaskService.signMessage(
                `Sign this message to authenticate: ${nonce}`
            );

            // 4. Login
            await this.authService.login(address, signature);

            // 5. Success
            this.router.navigate(['/']);
        } catch (err: any) {
            console.error(err);
            if (err.status === 404 || err.error?.error === 'USER_NOT_FOUND') {
                this.showRegisterForm = true;
                return;
            }
            if (err.code === 4001) {
                this.error = 'User rejected the request.';
            } else {
                this.error = err.message || 'An unexpected error occurred.';
            }
        } finally {
            this.loading = false;
        }
    }

    onRegisterSuccess() {
        this.showRegisterForm = false;
        // Retry login automatically
        this.connectAndLogin();
    }
}
