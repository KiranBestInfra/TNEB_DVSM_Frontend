import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_BASE_URL = import.meta.env.VITE_API_ADMIN_BASE_URL;
const DEMO_BASE_URL = import.meta.env.VITE_API_DEMO_BASE_URL;
const CONSUMER_BASE_URL = import.meta.env.VITE_API_CONSUMER_BASE_URL;

export const API_TIMEOUT = 60000;
export const API_HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export const baseURL = () => {
    const accessToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessTokenDuplicate='))
        ?.split('=')[1];
    
    if (accessToken) {
        try {
            const decoded = jwtDecode(accessToken);
            let userRole =
                decoded.role || decoded.Role || decoded.user_role || 'User';

            if (
                userRole === 'Super Admin' ||
                userRole === 'Admin'
            ) {
                return `${API_BASE_URL}${ADMIN_BASE_URL}`;
            } else if (userRole === 'User') {
                return `${API_BASE_URL}${CONSUMER_BASE_URL}`;
            } 
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    return `${API_BASE_URL}`;
};
