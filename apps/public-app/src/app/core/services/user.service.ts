import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constants';
import { User } from '../models/user.model';
import { StorageUtils } from '../../features/auth/utils/storage.utils';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) { }

    async getUserByWallet(wallet: string): Promise<User> {
        try {
            const token = StorageUtils.getAccessToken();
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

            // Try to fetch from backend
            return await lastValueFrom(this.http.get<User>(
                `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.USERS.BY_WALLET(wallet)}`,
                { headers }
            ));
        } catch (error) {
            console.warn('Failed to fetch user from backend, returning mock data for development.', error);
            // Return mock data if backend fails (for development)
            return {
                username: 'crypto_enthusiast',
                firstName: 'Alex',
                lastName: 'Mercer',
                email: 'alex.mercer@example.com',
                description: 'Early adopter of Web3 technologies. Looking for a modern apartment in the city center.',
                walletAddress: wallet,
                role: 'ROLE_USER'
            };
        }
    }

    async updateUser(user: User): Promise<User> {
        // Implementation for update would go here
        return user;
    }
}
