import { Injectable } from '@angular/core';
import axios from 'axios';
import { API_CONSTANTS } from '../constants/api.constants';
import { User } from '../models/user.model';
import { StorageUtils } from '../../features/auth/utils/storage.utils';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor() { }

    async getUserByWallet(wallet: string): Promise<User> {
        try {
            // Try to fetch from backend
            const response = await axios.get(
                `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.USERS.BY_WALLET(wallet)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${StorageUtils.getAccessToken()}`
                    }
                }
            );
            return response.data;
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
