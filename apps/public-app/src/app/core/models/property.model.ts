export interface RoomImage {
    idImage: number;
    url: string;
    s3Key?: string;
    orderIndex: number;
    uploadedAt: Date;
}

export interface Room {
    idRoom: number;
    name: string;
    orderIndex: number;
    roomImages: RoomImage[];
}

export interface Property {
    idProperty: number;
    onChainId?: number;
    title: string;
    country: string;
    city: string;
    address: string;
    longitude?: string;
    latitude?: string;
    description: string;
    typeOfRental: 'LONG_TERM' | 'SHORT_TERM';
    rentPerMonth: number;
    securityDeposit: number;
    ownerEthAddress: string;
    ownerId: number;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isAvailable: boolean;
    rating: number;
    nombreEtoiles: number;
    rooms: Room[];
}
