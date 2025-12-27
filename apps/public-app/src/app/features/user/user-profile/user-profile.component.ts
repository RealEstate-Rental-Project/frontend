import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { StorageUtils } from '../../auth/utils/storage.utils';
import { User } from '../../../core/models/user.model';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    user: User | null = null;
    loading = true;

    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    async ngOnInit() {
        const wallet = StorageUtils.getwallet();
        if (wallet) {
            this.user = await this.userService.getUserByWallet(wallet);
        } else {
            // Redirect to login if no wallet found
            this.router.navigate(['/auth/login']);
        }
        this.loading = false;
    }

    get avatarUrl(): string {
        // Generate a consistent avatar based on wallet address or use placeholder
        return `https://ui-avatars.com/api/?name=${this.user?.firstName}+${this.user?.lastName}&background=0D8ABC&color=fff&size=128`;
    }

    propertyTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'STUDIO'];
    rentalTypes = ['MONTHLY', 'DAILY'];
    isSaving = false;
    saveMessage = '';

    isEditingProfile = false;
    isSavingProfile = false;
    profileSaveMessage = '';

    toggleEditProfile() {
        this.isEditingProfile = !this.isEditingProfile;
        this.profileSaveMessage = '';
    }

    async saveProfile() {
        if (!this.user) return;

        this.isSavingProfile = true;
        this.profileSaveMessage = '';

        try {
            const updatedUser = await this.userService.updateUser(this.user);
            this.user = updatedUser;
            this.profileSaveMessage = 'Profile updated successfully!';
            this.isEditingProfile = false;
            setTimeout(() => this.profileSaveMessage = '', 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            this.profileSaveMessage = 'Failed to update profile.';
        } finally {
            this.isSavingProfile = false;
        }
    }

    async savePreferences() {
        if (!this.user) return;

        this.isSaving = true;
        this.saveMessage = '';

        try {
            const updatedUser = await this.userService.updateUser(this.user);
            this.user = updatedUser;
            this.saveMessage = 'Preferences saved successfully!';
            setTimeout(() => this.saveMessage = '', 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            this.saveMessage = 'Failed to save preferences.';
        } finally {
            this.isSaving = false;
        }
    }
}
