import { Injectable } from '@angular/core';
import { BrowserProvider } from 'ethers';

@Injectable({
    providedIn: 'root'
})
export class MetamaskService {
    private provider: BrowserProvider | null = null;

    constructor() {
        if ((window as any).ethereum) {
            this.provider = new BrowserProvider((window as any).ethereum);
        }
    }

    async connectWallet(): Promise<string> {
        if (!this.provider) {
            throw new Error('MetaMask is not installed!');
        }

        // Request account access
        const accounts = await this.provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        return accounts[0];
    }

    async signMessage(message: string): Promise<string> {
        if (!this.provider) {
            throw new Error('MetaMask is not installed!');
        }
        const signer = await this.provider.getSigner();
        return await signer.signMessage(message);
    }
}
