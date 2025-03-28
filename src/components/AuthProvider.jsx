import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateUserFromToken = () => {
        const accessToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('accessTokenDuplicate='))
            ?.split('=')[1];

        if (accessToken) {
            try {
                const decoded = jwtDecode(accessToken);
                setUser({
                    id: decoded.userId, 
                    ...decoded,
                    role: (
                        decoded.role ||
                        decoded.Role ||
                        decoded.user_role ||
                        ''
                    ).toLowerCase(),
                });
            } catch (error) {
                console.error('Error decoding token:', error);
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        updateUserFromToken();
    }, []);

    const logout = () => {
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role?.includes('admin') || false;
    };

    const isUser = () => {
        return user?.role?.includes('user') || false;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                logout,
                isAdmin,
                isUser,
                updateUserFromToken,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
