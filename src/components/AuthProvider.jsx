import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

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
                //console.log("decoded",decoded);
                const userObject = {
                    id: decoded.userId,
                    email: decoded.email,
                    name: decoded.user_name,
                    role: decoded.role,
                    hierarchy_id: decoded.user_hierarchy_id,
                };

                setUser(userObject);
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
        document.cookie =
            'accessTokenDuplicate=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role?.toLowerCase()?.includes('admin') || false;
    };

    const isRegion = () => {
        return user?.role?.toLowerCase()?.includes('region') || false;
    };

    const isCircle = () => {
        return user?.role?.toLowerCase()?.includes('circle') || false;
    };

    const isSubstation = () => {
        return user?.role?.toLowerCase()?.includes('substation') || false;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                logout,
                isAdmin,
                isRegion,
                isCircle,
                isSubstation,
                updateUserFromToken,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
