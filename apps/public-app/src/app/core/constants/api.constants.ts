export const API_CONSTANTS = {
    GATEWAY_URL: 'http://localhost:8880',
    ENDPOINTS: {
        AUTH: {
            NONCE: '/api/auth/metamask/nonce',
            LOGIN: '/api/auth/metamask/login',
            REFRESH: '/api/auth/metamask/refresh'
        },
        USERS: {
            BASE: '/api/users',
            BY_WALLET: (wallet: string) => `/api/users/wallet/${wallet}`
        },
        PROPERTIES: {
            BASE: '/api/property-microservice/properties',
            SEARCH: '/api/property-microservice/properties/search',
            FEATURED: '/api/property-microservice/properties/featured',
            MY_PROPERTIES: '/api/property-microservice/properties/my-properties',
            BY_ID: (id: number) => `/api/property-microservice/properties/${id}`
        },
        ROOMS: {
            BY_PROPERTY: (propertyId: number) => `/api/property-microservice/rooms/property/${propertyId}`
        },
        ROOM_IMAGES: {
            BY_ID: (id: number) => `/api/property-microservice/properties/room-images/${id}`,
            BY_ROOM: (roomId: number) => `/api/property-microservice/properties/room-images/room/${roomId}`
        }
    }
};
