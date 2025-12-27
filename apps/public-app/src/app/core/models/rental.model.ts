export interface RentalRequestDTO {
    propertyId: number;
    startDate: string; // ISO Date
    endDate: string;   // ISO Date
}

export enum RentalStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED'
}

export interface RentalRequest {
    idRequest: number;
    createdAt: string;
    status: RentalStatus;
    tenantId: number;
    propertyId: number;
    startDate: string;
    endDate: string;
    totalPrice?: number;
    // Optional: Property details if hydrated
    property?: any;
}
