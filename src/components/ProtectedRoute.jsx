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
        const userRole = decoded.role || decoded.Role || decoded.user_role;
        const userRoleId = decoded.user_role_id || decoded.Role_Id || decoded.user_roleid;
        //console.log('userRole:', userRole);
       // console.log('userRoleId:', userRoleId);


        const isAdmin =
            userRole.toLowerCase().includes('admin') ||
            userRole.toLowerCase().includes('demo');

        // Check if user is trying to access admin routes
        const isAdminRoute = location.pathname.startsWith('/admin');
        const isUserRoute = location.pathname.startsWith('/user');

        // Get the base route (e.g., /admin/consumers/view/123 -> admin)
        const baseRoute = location.pathname.split('/')[1];

        // Redirect logic based on role and route
        if (isAdmin) {
            if (isUserRoute) {
                return <Navigate to="/admin/dashboard" replace state={{ from: location }} />;
            }
        } else {
            if (isAdminRoute || baseRoute === 'admin') {
                console.log('Non-admin user attempting to access admin route:', location.pathname);
                return <Navigate to="/user/dashboard" replace state={{ from: location }} />;
            }
        }

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
