export enum TypeOfRental {
    MONTHLY = 'MONTHLY',
    DAILY = 'DAILY'
}

export enum PropertyType {
    APARTMENT="APARTMENT",
    HOUSE="HOUSE",
    VILLA="VILLA",
    STUDIO="STUDIO"
}

export interface RoomCreationRequest {
    name: string;
    orderIndex: number;
    imageIndexes: number[]; // Pointe vers les index de la liste globale de fichiers
    files?: File[]; // For frontend use
    existingImages?: RoomImage[]; // For edit mode
}

export interface PropertyCreationRequest {
    title: string;
    country: string;
    city: string;
    address: string;
    longitude: number;
    latitude: number;
    description: string;
    sqM: number;
    typeOfProperty: PropertyType;
    typeOfRental: TypeOfRental;
    rentAmount: number;
    securityDeposit: number;
    onChainId?: number;
    rooms: RoomCreationRequest[];
}

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
    longitude?: number;
    latitude?: number;
    description: string;
    sqM: number;
    typeOfProperty: PropertyType;
    typeOfRental: 'MONTHLY' | 'DAILY';
    rentAmount: number;
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
