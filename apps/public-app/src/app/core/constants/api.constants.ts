export const API_CONSTANTS = {
    GATEWAY_URL: 'http://localhost:8080',
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
            BASE: '/api/properties',
            BY_ID: (id: number) => `/api/properties/${id}`
        },
        ROOMS: {
            BY_PROPERTY: (propertyId: number) => `/api/rooms/property/${propertyId}`
        },
        ROOM_IMAGES: {
            BY_ROOM: (roomId: number) => `/api/room-images/room/${roomId}`
        }
    }
};
