import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { StorageUtils } from '../../../features/auth/utils/storage.utils';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    isLoggedIn = false;
    walletAddress: string | null = null;

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit(): void {
        this.checkLoginStatus();
    }

    checkLoginStatus() {
        const token = StorageUtils.getAccessToken();
        this.walletAddress = StorageUtils.getWalletAddress();
        this.isLoggedIn = !!token;
    }

    logout() {
        this.authService.logout();
        this.isLoggedIn = false;
        this.walletAddress = null;
    }
}
