export interface User {
    id: number;
    username: string; // Kita pakai username, bukan email
    email_verified_at?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};