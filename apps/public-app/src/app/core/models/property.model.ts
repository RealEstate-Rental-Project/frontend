export interface Property {
    idProperty: number;
    onChainId: number;
    title: string;
    country: string;
    city: string;
    address: string;
    description: string;
    typeOfRental: 'LONG_TERM' | 'SHORT_TERM';
    rentPerMonth: number;
    securityDeposit: number;
    isAvailable: boolean;
    isActive: boolean;
    ownerId: number;
    ownerEthAddress: string;
    createdAt: Date;
    updatedAt: Date;
}
