export interface User {
    id?: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    description?: string;
    walletAddress: string;
    role?: string;
}
