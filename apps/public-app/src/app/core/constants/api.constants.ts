import { environment } from '../../../environments/environment';

// Test conversion rate between Moroccan Dirham (MAD) and ETH.
// This is intentionally very high so that realistic MAD prices
// correspond to very small ETH amounts when testing with limited
// Sepolia ETH balances.
export const MAD_PER_ETH_TEST = 2_000_000; // 1 ETH = 2,000,000 MAD (test only)

export const API_CONSTANTS = {
    GATEWAY_URL: environment.gatewayUrl,
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
            HEATMAP: '/api/property-microservice/properties/heatmap',
            PREDICT_PRICE: (id: number) => `/api/property-microservice/properties/${id}/predict-price`,
            RECOMMENDATIONS: '/api/property-microservice/properties/recommendations',
            BY_ID: (id: number) => `/api/property-microservice/properties/${id}`
        },
        ROOMS: {
            BY_PROPERTY: (propertyId: number) => `/api/property-microservice/rooms/property/${propertyId}`
        },
        ROOM_IMAGES: {
            BY_ID: (id: number) => `/api/property-microservice/properties/room-images/${id}`,
            BY_ROOM: (roomId: number) => `/api/property-microservice/properties/room-images/room/${roomId}`
        },
        RENTAL_AGREEMENT: {
            BASE: '/api/rentalAgreement-microservice/rental-requests',
            BY_TENANT: (tenantId: number) => `/api/rentalAgreement-microservice/rental-requests/tenant/${tenantId}`,
            BY_PROPERTY: (propertyId: number) => `/api/rentalAgreement-microservice/rental-requests/property/${propertyId}`,
            UPDATE_STATUS: (requestId: number) => `/api/rentalAgreement-microservice/rental-requests/${requestId}/status`,
            SCORE: (userId: number) => `/api/rentalAgreement-microservice/ai-models/consult-score/${userId}`
        },
        RENTAL_CONTRACTS: {
            BASE: '/api/rentalAgreement-microservice/rental-contracts',
            USER_ME: '/api/rentalAgreement-microservice/rental-contracts/user/me',
            KEY_DELIVERY: (id: number) => `/api/rentalAgreement-microservice/rental-contracts/${id}/key-delivery`
        },
        NOTIFICATIONS: {
            BASE: '/api/notifications',
            SOCKET: '/ws-notifications'
        }
    }
};
