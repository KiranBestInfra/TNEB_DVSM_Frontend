import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
    const accessToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessTokenDuplicate='))
        ?.split('=')[1];

    if (!accessToken) {
        return <Navigate to="/auth/login" replace />;
    }

    try {
        jwtDecode(accessToken);
        return children ? children : <Outlet />;
    } catch (error) {
        console.error('Error decoding token:', error);
        return <Navigate to="/auth/login" replace />;
    }
};

ProtectedRoute.propTypes = {
    children: PropTypes.node,
};

export default ProtectedRoute;
