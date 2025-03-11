import { apiClient } from '../client';

class AuthService {
    async login(credentials) {
        const response = await apiClient.post('/auth/login', credentials);
        return response;
    }

    async logout() {
        await apiClient.post('/auth/logout');
    }

    async refreshToken() {
        const response = await apiClient.post('/auth/refresh');
        return response;
    }

    async forgotPassword(email) {
        return apiClient.post('/auth/forgot-password', { email });
    }

    async resetPassword(token, newPassword) {
        return apiClient.post('/auth/reset-password', {
            token,
            newPassword,
        });
    }

    isAuthenticated(token) {
        return !!token;
    }
}

export const authService = new AuthService();
