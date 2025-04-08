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

                let region = null;

                // Try to extract region from different possible fields
                if (decoded.region) {
                    region = decoded.region;
                } else if (decoded.userRegion) {
                    region = decoded.userRegion;
                } else if (decoded.tiruvannamalai) {
                    region = 'tiruvannamalai';
                } else if (decoded.chennai) {
                    region = 'chennai';
                } else if (decoded.kancheepuram) {
                    region = 'kancheepuram';
                }

                // Try to extract region from userId if it exists (format: region_sometype)
                if (!region && decoded.userId && decoded.userId.includes('_')) {
                    const possibleRegion = decoded.userId.split('_')[0];
                    // Add validation for known regions if needed
                    region = possibleRegion;
                }

                // If we still don't have a region, check for specific flags in the token
                if (!region) {
                    // Look for any other region indicators that might be in the token
                    const tokenStr = JSON.stringify(decoded).toLowerCase();
                    const possibleRegions = [
                        'chennai', 'coimbatore', 'erode', 'kancheepuram', 'karur',
                        'madurai', 'thanjavur', 'thiruvallur', 'tirunelveli',
                        'tiruvannamalai', 'trichy', 'vellore', 'villupuram'
                    ];

                    for (const r of possibleRegions) {
                        if (tokenStr.includes(r)) {
                            region = r;
                            break;
                        }
                    }
                }

                // Standardize region to lowercase if we found one
                if (region) {
                    region = region.toLowerCase();
                }

                // If we still don't have a region, we'll log the issue but continue without setting one
                if (!region) {
                    console.error('AuthProvider - WARNING: Could not determine region from token');
                }

                const userObject = {
                    id: decoded.userId,
                    ...decoded,
                    role: (
                        decoded.role ||
                        decoded.Role ||
                        decoded.user_role ||
                        ''
                    ).toLowerCase(),
                    region: region
                };

                setUser(userObject);

                // Store the user info with standardized region in localStorage
                localStorage.setItem('loginInfo', JSON.stringify({
                    user: userObject
                }));

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
