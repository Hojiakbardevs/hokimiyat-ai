// Centralized endpoint constant map to avoid scattering string literals.
// Adjust here if backend paths change.

export const API = {
    AUTH_TOKEN: "/auth/token/",
    AUTH_REFRESH: "/auth/token/refresh/",
    AUTH_REGISTER: "/auth/register/",
    ACCOUNTS_LOGIN: "/accounts/login/",
    ACCOUNTS_REGISTER: "/accounts/register/",
    ACCOUNTS_USERS: "/accounts/users/",
    USERS_ME: "/accounts/me/",
    USERS: "/accounts/users/",
    DOCUMENTS: "/documents/",
    CHAT: "/chat/",
    CHAT_CONVERSATIONS: "/chat/conversations/",
} as const;

export type ApiEndpointKey = keyof typeof API;