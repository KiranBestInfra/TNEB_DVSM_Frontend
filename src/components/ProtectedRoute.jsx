import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from './AuthProvider';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        let timer;
        if (!user && !loading) {
            timer = setTimeout(() => {
                setShouldRedirect(true);
            }, 6000);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [user, loading]);

    if (!user) {
        if (shouldRedirect) {
            return <Navigate to="/auth/login" replace />;
        } else {
            return <div>Waiting for authentication...</div>;
        }
    }

    if (
        allowedRoles &&
        !allowedRoles.some((role) => user.role.toLowerCase().includes(role))
    ) {
        const userRole = user.role.toLowerCase();
        if (userRole.includes('admin')) {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole.includes('region')) {
            return <Navigate to="/user/region" replace />;
        } else if (userRole.includes('substation')) {
            return <Navigate to="/user/substation" replace />;
        } else if (userRole.includes('circle')) {
            return <Navigate to="/user/edc" replace />;
        } else {
            return <Navigate to="/auth/login" replace />;
        }
    }

    return children ? children : <Outlet />;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
