export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      USER: "/auth/user",
      GOOGLE: "/auth/google",
    },
    ESSAYS: {
      BASE: "/essays",
      HTML: "/essays/html",
      BY_ID: (id: string) => `/essays/${id}`,
      RENDER: (id: string) => `/essays/${id}/render`,
    },
    IMAGES: {
      SEARCH: "/images/search",
    },
    CREDITS: {
      BASE: "/credits",
      PURCHASE: "/credits/purchase",
      PAYMENT: "/credits/payment-intent",
    },
    SECTIONS: {
      DIVIDE: "/sections/divide",
    },
  },
} as const;

export const createApiUrl = (endpoint: string) =>
  `${API_CONFIG.BASE_URL}${endpoint}`;

// Helper function for common API requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
