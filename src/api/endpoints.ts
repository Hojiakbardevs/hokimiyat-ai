// Centralized endpoint constant map to avoid scattering string literals.
// Adjust here if backend paths change.

export const API = {
    AUTH_TOKEN: "/auth/token/",
    AUTH_REFRESH: "/auth/token/refresh/",
    ACCOUNTS_LOGIN: "/accounts/login/",
    ACCOUNTS_REGISTER: "/accounts/register/",
    ACCOUNTS_USERS: "/accounts/users/",
    DOCUMENTS: "/documents/",
    CHAT: "/chat/",
} as const;

export type ApiEndpointKey = keyof typeof API;