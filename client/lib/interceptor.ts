
/**
 * Endpoints that should NOT trigger a background user refresh to avoid
 * circular calls and unnecessary requests.
 */
const SKIP_USER_REFRESH_PATTERNS = [
    "/auth/",
    "/users/me",
];



export const handleAutoLogout = (reason: string = "Session expired") => {
    console.warn(`Auto-logout triggered: ${reason}`);

    if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/home"
    ) {
        window.location.href = "/home";
    }
};

/**
 * Enhanced fetch wrapper with automatic token refresh and logout.
 * The server uses httpOnly cookies for accessToken and refreshToken.
 * credentials: "include" is required on every request so the browser sends them.
 */
export const authFetch = async <T = unknown>(
    url: string,
    options: RequestInit = {},
): Promise<T> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    };

    // Only set Content-Type for JSON requests (not FormData)
    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }
    try {
        // credentials: "include" ensures the browser sends httpOnly cookies
        let response = await fetch(fullUrl, {
            ...options,
            headers,
            credentials: "include",
        });

        // On 401, attempt a silent token refresh and retry once
        if (response.status === 401 && !url.includes("/auth/refresh")) {
            try {
                const refreshSuccess = await refreshTokens();
                if (refreshSuccess) {
                    response = await fetch(fullUrl, {
                        ...options,
                        headers,
                        credentials: "include",
                    });
                } else {
                    handleAutoLogout("Refresh token expired");
                    throw new Error("Authentication failed");
                }
            } catch (error) {
                handleAutoLogout("Token refresh failed");
                throw error;
            }
        }

        const data = response.json() as Promise<T>;
        return data;
    } catch (error: any) {
        if (
            error?.message === "Token refresh failed" ||
            error?.message === "Refresh token expired"
        ) {
            handleAutoLogout("Token refresh failed");
            throw new Error("Authentication failed");
        }
        throw error;
    }
};

/**
 * Refreshes tokens by calling POST /auth/refresh.
 * The server reads the httpOnly refreshToken cookie (sent via credentials:include)
 * and sets new httpOnly accessToken + refreshToken cookies in the response.
 */
const refreshTokens = async () => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (response.status === 401) {
            throw new Error("Refresh token expired");
        }

        if (response.ok) {
            console.log("Tokens refreshed successfully");
            return true;
        }

        // throw new Error(`Refresh failed with status: ${response.status}`);
    } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
    }
};
