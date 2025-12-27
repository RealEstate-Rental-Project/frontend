export interface User {
    id?: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    description?: string;
    wallet: string;
    role?: string;
    targetRent?: number;
    minTotalRooms?: number;
    targetSqft?: number;
    searchLatitude?: number;
    searchLongitude?: number;
    preferredPropertyType?: string;
    preferredRentalType?: string;
}
