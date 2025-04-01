import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    // Get access token from cookie
    const accessToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessTokenDuplicate='))
        ?.split('=')[1];

    // If no token, redirect to login
    if (!accessToken) {
        return <Navigate to="/auth/login" replace />;
    }

    try {
        const decoded = jwtDecode(accessToken);
        // All users with valid tokens can access all routes
        // We'll handle specific permissions at component level

        // For backward compatibility, we used to redirect admins away from user routes
        // But now we allow admins to access both admin and user routes
        /*
        const userRole = decoded.role || decoded.Role || decoded.user_role;
        const userRoleId = decoded.user_role_id || decoded.Role_Id || decoded.user_roleid;
        //console.log('userRole:', userRole);
       // console.log('userRoleId:', userRoleId);


        const isAdmin =
            userRole.toLowerCase().includes('admin') ||
            userRole.toLowerCase().includes('demo');
        const isUserRoute = location.pathname.startsWith('/user');

        if (isAdmin && isUserRoute) {
            return <Navigate to="/admin/dashboard" replace state={{ from: location }} />;
        }
        */

        return children;
    } catch (error) {
        console.error('Error decoding token:', error);
        return <Navigate to="/auth/login" replace />;
    }
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
