import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom, BehaviorSubject } from 'rxjs';
import { API_CONSTANTS } from '../../../core/constants/api.constants';
import { StorageUtils } from '../utils/storage.utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    !!StorageUtils.getAccessToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {}

  logout() {
    StorageUtils.clear();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  async getNonce(walletAddress: string): Promise<string> {
    const response = await lastValueFrom(
      this.http.get<{ nonce: string }>(
        `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.AUTH.NONCE}`,
        {
          params: { wallet: walletAddress },
        }
      )
    );
    return response.nonce;
  }

  async login(walletAddress: string, signature: string): Promise<any> {
    const response = await lastValueFrom(
      this.http.post<any>(
        `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.AUTH.LOGIN}`,
        { wallet: walletAddress, signature },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const { access_token, refresh_token } = response;
    StorageUtils.setAccessToken(access_token);
    StorageUtils.setRefreshToken(refresh_token);
    StorageUtils.setWalletAddress(walletAddress);
    this.isAuthenticatedSubject.next(true);
    return response;
  }

  async register(userData: any): Promise<any> {
    const response = await lastValueFrom(
      this.http.post<any>(
        `${API_CONSTANTS.GATEWAY_URL}${API_CONSTANTS.ENDPOINTS.USERS.BASE}`,
        userData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    return response;
  }
}
