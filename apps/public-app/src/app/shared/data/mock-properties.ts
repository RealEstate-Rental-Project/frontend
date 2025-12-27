import { Property, PropertyType } from '../../core/models/property.model';

export const MOCK_PROPERTIES: Property[] = [
    {
        idProperty: 1,
        onChainId: 101,
        title: 'Villa Dar Al-Hambra - Oasis',
        country: 'Morocco',
        city: 'Marrakech',
        address: 'Km 12, Route de l\'Ourika, Marrakech',
        longitude: -7.981084,
        latitude: 31.629472,
        description: 'Experience the ultimate luxury in this stunning villa located just minutes from the vibrant center of Marrakech. Nestled in a lush garden with a private pool, Villa Dar Al-Hambra offers a perfect blend of traditional Moroccan architecture and modern comfort. Features include a spacious living room with fireplace, a fully equipped gourmet kitchen, and a rooftop terrace with breathtaking views of the Atlas Mountains. Ideal for families or groups seeking privacy and exclusivity.',
        sqM: 450,
        typeOfProperty: PropertyType.VILLA,
        typeOfRental: 'DAILY',
        rentAmount: 4500,
        securityDeposit: 1000,
        ownerEthAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        ownerId: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-20'),
        isActive: true,
        isAvailable: true,
        rating: 4.95,
        nombreEtoiles: 5,
        rooms: [
            {
                idRoom: 101,
                name: 'Grand Salon',
                orderIndex: 1,
                roomImages: [
                    {
                        idImage: 1,
                        url: 'https://images.unsplash.com/photo-1541123356219-284ebe98ae3b?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    },
                    {
                        idImage: 2,
                        url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 2,
                        uploadedAt: new Date()
                    }
                ]
            },
            {
                idRoom: 102,
                name: 'Master Bedroom',
                orderIndex: 2,
                roomImages: [
                    {
                        idImage: 3,
                        url: 'https://images.unsplash.com/photo-1616594039964-40891a909d99?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    },
                    {
                        idImage: 4,
                        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 2,
                        uploadedAt: new Date()
                    }
                ]
            },
            {
                idRoom: 103,
                name: 'Gourmet Kitchen',
                orderIndex: 3,
                roomImages: [
                    {
                        idImage: 5,
                        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    }
                ]
            },
            {
                idRoom: 104,
                name: 'Garden & Pool',
                orderIndex: 4,
                roomImages: [
                    {
                        idImage: 6,
                        url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    },
                    {
                        idImage: 7,
                        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 2,
                        uploadedAt: new Date()
                    }
                ]
            }
        ]
    },
    {
        idProperty: 2,
        onChainId: 102,
        title: 'Modern Apartment in Casablanca',
        country: 'Morocco',
        city: 'Casablanca',
        address: 'Maarif, Casablanca',
        longitude: -7.981084,
        latitude: 31.629472,
        description: 'A sleek and modern apartment located in the heart of the Maarif district. Perfect for business travelers or couples, this apartment features a contemporary design, high-end appliances, and easy access to the city\'s best shops and restaurants.',
        sqM: 85,
        typeOfProperty: PropertyType.APARTMENT,
        typeOfRental: 'MONTHLY',
        rentAmount: 1200,
        securityDeposit: 1200,
        ownerEthAddress: '0x456...',
        ownerId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isAvailable: true,
        rating: 4.5,
        nombreEtoiles: 4,
        rooms: [
            {
                idRoom: 201,
                name: 'Living Area',
                orderIndex: 1,
                roomImages: [
                    {
                        idImage: 8,
                        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    }
                ]
            },
            {
                idRoom: 202,
                name: 'Bedroom',
                orderIndex: 2,
                roomImages: [
                    {
                        idImage: 9,
                        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    }
                ]
            }
        ]
    },
    {
        idProperty: 3,
        onChainId: 103,
        title: 'Seaside Condo in Miami',
        country: 'USA',
        city: 'Miami',
        address: '789 Ocean Blvd',
        longitude: -7.981084,
        latitude: 31.629472,
        description: 'Wake up to the sound of the waves in this beautiful seaside condo. With direct beach access and stunning ocean views, this is the perfect vacation getaway. The condo features a bright and airy open plan living area, a private balcony, and resort-style amenities.',
        sqM: 120,
        typeOfProperty: PropertyType.APARTMENT,
        typeOfRental: 'DAILY',
        rentAmount: 4000,
        securityDeposit: 1000,
        ownerEthAddress: '0x789...',
        ownerId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isAvailable: true,
        rating: 4.7,
        nombreEtoiles: 4,
        rooms: [
            {
                idRoom: 301,
                name: 'Living Room',
                orderIndex: 1,
                roomImages: [
                    {
                        idImage: 10,
                        url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    }
                ]
            }
        ]
    },
    {
        idProperty: 4,
        onChainId: 104,
        title: 'Modern Apartment in Casablanca',
        country: 'Morocco',
        city: 'Casablanca',
        address: 'Maarif, Casablanca',
        longitude: -7.981084,
        latitude: 31.629472,
        description: 'A sleek and modern apartment located in the heart of the Maarif district. Perfect for business travelers or couples, this apartment features a contemporary design, high-end appliances, and easy access to the city\'s best shops and restaurants.',
        sqM: 90,
        typeOfProperty: PropertyType.APARTMENT,
        typeOfRental: 'DAILY',
        rentAmount: 4000,
        securityDeposit: 1000,
        ownerEthAddress: '0x789...',
        ownerId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isAvailable: true,
        rating: 4.7,
        nombreEtoiles: 4,
        rooms: [
            {
                idRoom: 301,
                name: 'Living Room',
                orderIndex: 1,
                roomImages: [
                    {
                        idImage: 10,
                        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop',
                        orderIndex: 1,
                        uploadedAt: new Date()
                    }
                ]
            }
        ]
    }
];
