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
        }
    }
};
