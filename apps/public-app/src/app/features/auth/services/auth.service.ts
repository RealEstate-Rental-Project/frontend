import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { StorageUtils } from '../utils/storage.utils';
import { Router } from '@angular/router';
import { API_CONSTANTS } from '../../../core/constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(private router: Router) {
    this.api = axios.create({
      baseURL: API_CONSTANTS.GATEWAY_URL,
      headers: {
        'Content-Type': 'application/json',
      },
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

            const response = await axios.post(
              API_CONSTANTS.GATEWAY_URL + API_CONSTANTS.ENDPOINTS.AUTH.REFRESH,
              { refreshToken }
            );
            const { accessToken, refreshToken: newRefreshToken } =
              response.data;

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
    this.router.navigate(['/auth/login']);
  }

  async getNonce(walletAddress: string): Promise<string> {
    // Use axios directly to bypass interceptors
    const response = await axios.get(
      `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.AUTH.NONCE}`,
      {
        params: { wallet: walletAddress },
        withCredentials: true,
      }
    );
    return response.data.nonce;
  }

  async login(walletAddress: string, signature: string): Promise<any> {
    // Use axios directly to bypass interceptors
    const response = await axios.post(
      `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.AUTH.LOGIN}`,
      { wallet: walletAddress, signature },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    );
    const { accessToken, refreshToken } = response.data;
    StorageUtils.setAccessToken(accessToken);
    StorageUtils.setRefreshToken(refreshToken);
    StorageUtils.setWalletAddress(walletAddress);
    return response.data;
  }

  async register(userData: any): Promise<any> {
    // Use axios directly to bypass interceptors
    const response = await axios.post(
      `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.USERS.BASE}`,
      userData,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
      }
    );
    return response.data;
  }
}
