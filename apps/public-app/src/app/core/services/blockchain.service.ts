import { Injectable } from '@angular/core';
import { BrowserProvider, Contract, parseEther, TransactionReceipt, LogDescription } from 'ethers';
import RealEstateRental from '../../contracts/RealEstateRental.json';
import ContractAddress from '../../contracts/contract-address.json';

@Injectable({
    providedIn: 'root'
})
export class BlockchainService {
    private provider: BrowserProvider | null = null;
    private contract: Contract | null = null;
    private contractAddress = ContractAddress.RealEstateRental;

    constructor() {
        if ((window as any).ethereum) {
            this.provider = new BrowserProvider((window as any).ethereum);
        }
    }

    async connectWallet(): Promise<string> {
        if (!this.provider) {
            throw new Error('MetaMask is not installed!');
        }
        const accounts = await this.provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        return accounts[0];
    }

    async getContract(): Promise<Contract> {
        if (!this.provider) {
            throw new Error('MetaMask is not installed!');
        }
        const signer = await this.provider.getSigner();
        if (!this.contract) {
            this.contract = new Contract(this.contractAddress, RealEstateRental.abi, signer);
        }
        return this.contract;
    }

    async listProperty(
        propertyAddress: string,
        description: string,
        rentBaseAmount: string,
        securityDeposit: string,
        unit: number // 0 for MONTHLY, 1 for DAILY
    ): Promise<{ receipt: TransactionReceipt, propertyId: number }> {
        const contract = await this.getContract();

        // Convert ETH to Wei
        const rentWei = parseEther(rentBaseAmount);
        const depositWei = parseEther(securityDeposit);

        // Call smart contract
        const tx = await contract['listProperty'](
            propertyAddress,
            description,
            rentWei,
            depositWei,
            unit
        );

        const receipt = await tx.wait();

        // Find PropertyListed event
        // Event signature: event PropertyListed(uint256 indexed propertyId, address indexed owner, uint256 rentBaseAmount);
        let propertyId = -1;

        for (const log of receipt.logs) {
            try {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog && parsedLog.name === 'PropertyListed') {
                    propertyId = Number(parsedLog.args[0]);
                    break;
                }
            } catch (e) {
                // Ignore logs that don't match the event
            }
        }

        if (propertyId === -1) {
            throw new Error('PropertyListed event not found in transaction receipt');
        }

        return { receipt, propertyId };
    }
}
