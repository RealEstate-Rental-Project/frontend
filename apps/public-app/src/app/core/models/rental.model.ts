export interface RentalRequestDTO {
    propertyId: number;
    tenantWallet: string; // Récupéré via AuthService/StorageUtils
    startDate: string; // ISO Date
    endDate: string;   // ISO Date
    totalPrice: number; // Calculé
}

export enum RentalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED'
}
