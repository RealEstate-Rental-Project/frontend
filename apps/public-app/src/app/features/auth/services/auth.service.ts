import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { StorageUtils } from '../utils/storage.utils';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private api: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor(private router: Router) {
        this.api = axios.create({
            baseURL: '/api', // Adjust base URL as needed
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request Interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = StorageUtils.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        return new Promise((resolve) => {
                            this.refreshSubscribers.push((token: string) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                resolve(this.api(originalRequest));
                            });
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshToken = StorageUtils.getRefreshToken();
                        if (!refreshToken) {
                            throw new Error('No refresh token');
                        }

                        const response = await axios.post('/api/auth/refresh-token', { refreshToken });
                        const { accessToken, refreshToken: newRefreshToken } = response.data;

                        StorageUtils.setAccessToken(accessToken);
                        if (newRefreshToken) {
                            StorageUtils.setRefreshToken(newRefreshToken);
                        }

                        this.onRefreshed(accessToken);
                        this.isRefreshing = false;

                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return this.api(originalRequest);
                    } catch (refreshError) {
                        this.isRefreshing = false;
                        this.logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private onRefreshed(token: string) {
        this.refreshSubscribers.forEach((callback) => callback(token));
        this.refreshSubscribers = [];
    }

    logout() {
        StorageUtils.clear();
        this.router.navigate(['/login']);
    }

    async getNonce(walletAddress: string): Promise<string> {
        const response = await this.api.get(`/auth/nonce/${walletAddress}`);
        return response.data.nonce;
    }

    async login(walletAddress: string, signature: string): Promise<any> {
        const response = await this.api.post('/auth/login', { walletAddress, signature });
        const { accessToken, refreshToken } = response.data;
        StorageUtils.setAccessToken(accessToken);
        StorageUtils.setRefreshToken(refreshToken);
        StorageUtils.setWalletAddress(walletAddress);
        return response.data;
    }

    async register(userData: any): Promise<any> {
        const response = await this.api.post('/auth/register', userData);
        return response.data;
    }
}
