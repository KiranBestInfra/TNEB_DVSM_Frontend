import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import ForgotPassword from './pages/ForgotPassword';
import Verification from './pages/Verification';
import PDFViewer from './components/Documents/PDFViewer';
import './styles/MediaQuaries.css';
import { jwtDecode } from 'jwt-decode';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Profile from './pages/Profile';
import Load from './pages/Load';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import CreateTicket from './pages/CreateTicket';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import EDCs from './pages/EDCs';
import Substations from './pages/Substations';
import Regions from './pages/Regions';
import Feeders from './pages/Feeders';
import ProtectedRoute from './components/ProtectedRoute';
import LongDetailsWidget from './pages/LongDetailsWidget';

const App = () => {
    // Add a useEffect to log localStorage on initial render
    useEffect(() => {
        try {
            const loginInfo = localStorage.getItem('loginInfo');
            if (loginInfo) {
                const parsedInfo = JSON.parse(loginInfo);
                console.log('App - Initial localStorage loginInfo:', parsedInfo);
                console.log('App - User region from localStorage:',
                    parsedInfo?.user?.region || parsedInfo?.region);
            } else {
                console.log('App - No loginInfo in localStorage');
            }
        } catch (e) {
            console.error('App - Error parsing localStorage:', e);
        }
    }, []);

    const getUserRole = () => {
        const accessToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('accessTokenDuplicate='))
            ?.split('=')[1];

        if (accessToken) {
            try {
                const decoded = jwtDecode(accessToken);
                console.log('Decoded token:', decoded);

                let regionValue = decoded.region ||
                    decoded.Region ||
                    decoded.regionId ||
                    decoded.RegionId ||
                    decoded.region_id || null;

                if (regionValue) {
                    regionValue = regionValue.toLowerCase();
                }

                console.log('Initial region value from token:', regionValue);

                if (!regionValue && decoded.userId && decoded.userId.includes('_REG')) {
                    regionValue = decoded.userId.split('_REG')[0].toLowerCase();
                    console.log('Extracted region from userId:', regionValue);
                }

                let circleValue = decoded.circle ||
                    decoded.Circle ||
                    decoded.circleId ||
                    decoded.CircleId ||
                    decoded.circle_id || null;

                if (!circleValue && decoded.userId && decoded.userId.includes('_EDC')) {
                    circleValue = decoded.userId.split('_EDC')[0].toLowerCase();
                    console.log('Extracted circle from userId:', circleValue);

                    if (!regionValue) {
                        const circleToRegionMap = {
                            'central': 'kancheepuram',
                            'north': 'tiruvannamalai',
                        };
                        regionValue = circleToRegionMap[circleValue.toLowerCase()] || 'kancheepuram';
                        console.log('Mapped circle to region:', regionValue);
                    }
                }

                let substationValue = decoded.substation ||
                    decoded.Substation ||
                    decoded.substationId ||
                    decoded.SubstationId ||
                    decoded.substation_id || null;

                if (!substationValue && decoded.userId && decoded.userId.includes('_SUB')) {
                    substationValue = decoded.userId.split('_SUB')[0].toLowerCase();
                    console.log('Extracted substation from userId:', substationValue);

                    if (!regionValue) {
                        const substationToRegionMap = {
                            'central_sub1': 'kancheepuram',
                            'north_sub1': 'tiruvannamalai',
                        };
                        regionValue = substationToRegionMap[substationValue.toLowerCase()] || 'kancheepuram';
                        console.log('Mapped substation to region:', regionValue);
                    }
                }

                console.log('Extracted region value after userId processing:', regionValue);
                console.log('Extracted circle value:', circleValue);
                console.log('Extracted substation value:', substationValue);

                const loginInfo = localStorage.getItem('loginInfo');
                let parsedLoginInfo = null;

                if (loginInfo) {
                    try {
                        parsedLoginInfo = JSON.parse(loginInfo);
                        console.log('Login info from localStorage:', parsedLoginInfo);
                    } catch (e) {
                        console.error('Error parsing login info:', e);
                    }
                }

                const regionFromStorage = parsedLoginInfo?.user?.region ||
                    parsedLoginInfo?.region || null;
                console.log('Region from localStorage:', regionFromStorage);

                const circleFromStorage = parsedLoginInfo?.user?.circle ||
                    parsedLoginInfo?.circle || null;
                const substationFromStorage = parsedLoginInfo?.user?.substation ||
                    parsedLoginInfo?.substation || null;

                const finalRegion = regionValue || regionFromStorage;
                const finalCircle = circleValue || circleFromStorage;
                const finalSubstation = substationValue || substationFromStorage;

                console.log('Final region value:', finalRegion);
                console.log('Final circle value:', finalCircle);
                console.log('Final substation value:', finalSubstation);

                return {
                    roleId: decoded.role_id || decoded.RoleId || 0,
                    roleName: decoded.role || decoded.Role || decoded.user_role || 'User',
                    region: finalRegion,
                    circle: finalCircle,
                    substation: finalSubstation,
                    userId: decoded.userId || decoded.UserId || null
                };
            } catch (error) {
                console.error('Error decoding token:', error);
                return { roleId: 0, roleName: 'User' };
            }
        }
        return { roleId: 0, roleName: 'User' };
    };

    const DefaultRedirect = () => {
        const { user } = useAuth();
        console.log('DefaultRedirect - User info:', user);

        if (!user) {
            return <Navigate to="/login" replace />;
        }

        if (user.roleId === 1 || user.roleName?.toLowerCase() === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (user.roleId === 2 || user.roleName?.toLowerCase() === 'region user') {
            // Determine the region from user information
            let region = null;

            // Try to get the region from the userId (in case it's a circle or substation format)
            if (user.userId) {
                // Check if userId is in circle format: region_circlename
                if (user.userId.includes('_')) {
                    const circleFromUserId = user.userId.split('_')[1].toLowerCase();
                    console.log('DefaultRedirect - Circle from userId:', circleFromUserId);

                    // Map circle names to their corresponding regions
                    const circleToRegionMap = {
                        'central': null, // No default mapping
                        // Add other circle-to-region mappings as needed
                    };

                    region = circleToRegionMap[circleFromUserId];
                    if (region) {
                        console.log('DefaultRedirect - Found region from circle mapping:', region);
                    }
                }

                // Check if userId is in substation format: region_substationname
                if (!region && user.userId.includes('_sub')) {
                    const substationFromUserId = user.userId.split('_')[1].toLowerCase();
                    console.log('DefaultRedirect - Substation from userId:', substationFromUserId);

                    // Map substation names to their corresponding regions
                    const substationToRegionMap = {
                        'central_sub1': null, // No default mapping
                        // Add other substation-to-region mappings as needed
                    };

                    region = substationToRegionMap[substationFromUserId];
                    if (region) {
                        console.log('DefaultRedirect - Found region from substation mapping:', region);
                    }
                }
            }

            // If region is still not found, try to get it directly from the user object
            if (!region && user.region) {
                region = user.region.toLowerCase();
                console.log('DefaultRedirect - Found region from user.region:', region);
            }

            // If still not found, try to get from localStorage
            if (!region) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        region = parsedLoginInfo?.user?.region || parsedLoginInfo?.region;
                        if (region) {
                            region = region.toLowerCase();
                            console.log('DefaultRedirect - Found region from localStorage:', region);
                        }
                    }
                } catch (e) {
                    console.error('DefaultRedirect - Error parsing loginInfo from localStorage:', e);
                }
            }

            // If we still don't have a valid region, show error and redirect to dashboard
            if (!region) {
                console.error('DefaultRedirect - CRITICAL: Unable to determine region for Region User');
                alert('Unable to determine your region. Please contact your administrator.');
                // Use admin dashboard as fallback
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log('DefaultRedirect - Redirecting to region:', region);
            return <Navigate to={`/user/${region}/dashboard`} replace />;
        }

        // Default case - redirect to admin dashboard
        return <Navigate to="/admin/dashboard" replace />;
    };

    const RegionsProtectedRoute = () => {
        const { user } = useAuth();
        const { region } = useParams();

        console.log('RegionsProtectedRoute - User:', user, 'URL region param:', region);

        if (!user) {
            console.log('RegionsProtectedRoute - No user, redirecting to login');
            return <Navigate to="/login" replace />;
        }

        // For admin users, allow access to all regions
        if (user.roleId === 1 || user.roleName?.toLowerCase() === 'admin') {
            console.log('RegionsProtectedRoute - Admin user, allowing access');
            return <Outlet />;
        }

        // For region users, check if they're trying to access their own region
        if (user.roleId === 2 || user.roleName?.toLowerCase() === 'region user') {
            let userRegion = null;

            // Get the user's region from user object
            if (user.region) {
                userRegion = user.region.toLowerCase();
                console.log('RegionsProtectedRoute - Found region from user object:', userRegion);
            }

            // If not found, try to get from localStorage
            if (!userRegion) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        userRegion = parsedLoginInfo?.user?.region || parsedLoginInfo?.region;
                        if (userRegion) {
                            userRegion = userRegion.toLowerCase();
                            console.log('RegionsProtectedRoute - Found region from localStorage:', userRegion);
                        }
                    }
                } catch (e) {
                    console.error('RegionsProtectedRoute - Error getting region from localStorage:', e);
                }
            }

            // If we still don't have a region, alert and redirect to dashboard
            if (!userRegion) {
                console.error('RegionsProtectedRoute - CRITICAL: Unable to determine user region');
                alert('Unable to determine your region. Please contact your administrator.');
                // Use admin dashboard as fallback
                return <Navigate to="/admin/dashboard" replace />;
            }

            // Check if URL region param matches user's region
            if (region && region.toLowerCase() !== userRegion) {
                console.log('RegionsProtectedRoute - Region mismatch. User region:', userRegion, 'URL region:', region);
                console.log('RegionsProtectedRoute - Redirecting to user\'s region details');
                return <Navigate to={`/user/${userRegion}/dashboard`} replace />;
            }

            console.log('RegionsProtectedRoute - Region match, allowing access');
            return <Outlet />;
        }

        // Default case - redirect to dashboard
        console.log('RegionsProtectedRoute - User role not recognized, redirecting to dashboard');
        return <Navigate to="/admin/dashboard" replace />;
    };

    const SubstationsProtectedRoute = ({ children }) => {
        const userInfo = getUserRole();
        const location = useLocation();

        if (userInfo.roleId === 143 || userInfo.roleName.toUpperCase() === 'SUBSTATION_USER') {
            let substation = userInfo.substation;
            let region = userInfo.region;

            if (!substation && userInfo.userId && userInfo.userId.includes('_SUB')) {
                substation = userInfo.userId.split('_SUB')[0].toLowerCase();
                console.log('SubstationsProtectedRoute - Extracted substation from userId:', substation);

                if (!region) {
                    const substationToRegionMap = {
                        'central_sub1': 'kancheepuram',
                        'north_sub1': 'tiruvannamalai',
                    };
                    region = substationToRegionMap[substation] || 'kancheepuram';
                }
            }

            if (!substation || !region) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        if (!substation) {
                            substation = parsedLoginInfo?.user?.substation || parsedLoginInfo?.substation;
                        }
                        if (!region) {
                            region = parsedLoginInfo?.user?.region || parsedLoginInfo?.region;
                        }
                    }
                } catch (e) {
                    console.error('Error parsing login info in SubstationsProtectedRoute:', e);
                }
            }

            substation = substation || 'default';
            region = region || 'kancheepuram';

            console.log(`Redirecting SUBSTATION_USER from substations list to their substation: ${substation} in region: ${region}`);
            return <Navigate to={`/admin/${region}/substations/${substation}/details`} replace state={{ from: location }} />;
        }

        return <ProtectedRoute>{children}</ProtectedRoute>;
    };

    const RegionRedirect = () => {
        const { user } = useAuth();
        const { region } = useParams();

        console.log('RegionRedirect - User:', user, 'URL region param:', region);

        if (!user) {
            console.log('RegionRedirect - No user, redirecting to login');
            return <Navigate to="/login" replace />;
        }

        // If region is 'dashboard' or undefined, we need to get it from the user info
        if (!region || region === 'dashboard' || region === 'undefined') {
            let userRegion = null;

            // Try to get region from user object
            if (user.region) {
                userRegion = user.region.toLowerCase();
                console.log('RegionRedirect - Found region from user object:', userRegion);
            }

            // If not found, try to get from localStorage
            if (!userRegion) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        userRegion = parsedLoginInfo?.user?.region || parsedLoginInfo?.region;
                        if (userRegion) {
                            userRegion = userRegion.toLowerCase();
                            console.log('RegionRedirect - Found region from localStorage:', userRegion);
                        }
                    }
                } catch (e) {
                    console.error('RegionRedirect - Error getting region from localStorage:', e);
                }
            }

            // If we still don't have a valid region, alert and redirect to dashboard
            if (!userRegion) {
                console.error('RegionRedirect - CRITICAL: Unable to determine region');
                alert('Unable to determine your region. Please contact your administrator.');
                // Use admin dashboard as fallback
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log('RegionRedirect - Redirecting to region:', userRegion);
            return <Navigate to={`/user/${userRegion}/dashboard`} replace />;
        }

        // Ensure region is standardized to lowercase
        const safeRegion = region.toLowerCase();
        console.log('RegionRedirect - Using region from URL:', safeRegion);
        return <Navigate to={`/user/${safeRegion}/dashboard`} replace />;
    };

    // Update RegionUserRoute to handle the new URL pattern
    const RegionUserRoute = ({ children }) => {
        const { user } = useAuth();
        const location = useLocation();

        console.log('RegionUserRoute - User:', user, 'Location:', location.pathname);

        if (!user) {
            console.log('RegionUserRoute - No user, redirecting to login');
            return <Navigate to="/login" replace />;
        }

        // Check if the user is a Region User
        const isRegionUser = user.roleId === 2 || user.roleName?.toLowerCase() === 'region user';

        // Allowed paths for Region Users
        const isAllowedPath =
            location.pathname === "/admin/dashboard" ||
            (location.pathname.includes("/user/") && (
                location.pathname.includes("/dashboard") ||
                location.pathname.includes("/edcs") ||
                location.pathname.includes("/substations") ||
                location.pathname.includes("/feeders")
            ));

        // If Region User is trying to access a non-allowed path, redirect to their region detail page
        if (isRegionUser && !isAllowedPath) {
            let userRegion = null;

            // Try to get region from user object
            if (user.region) {
                userRegion = user.region.toLowerCase();
                console.log('RegionUserRoute - Found region from user object:', userRegion);
            }

            // If not found, try to get from localStorage
            if (!userRegion) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        userRegion = parsedLoginInfo?.user?.region || parsedLoginInfo?.region;
                        if (userRegion) {
                            userRegion = userRegion.toLowerCase();
                            console.log('RegionUserRoute - Found region from localStorage:', userRegion);
                        }
                    }
                } catch (e) {
                    console.error('RegionUserRoute - Error getting region from localStorage:', e);
                }
            }

            // If we still don't have a valid region, alert and redirect to dashboard
            if (!userRegion) {
                console.error('RegionUserRoute - CRITICAL: Unable to determine region');
                alert('Unable to determine your region. Please contact your administrator.');
                // Use admin dashboard as fallback
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log('RegionUserRoute - Redirecting to region:', userRegion);
            return <Navigate to={`/user/${userRegion}/dashboard`} replace />;
        }

        // For Admin users or allowed paths, just render the children
        return <ProtectedRoute>{children}</ProtectedRoute>;
    };

    return (
        <BrowserRouter basename="/bi">
            <AuthProvider>
                <Routes>
                    <Route
                        path="/pdf/:invoiceId/:meterNo"
                        element={<PDFViewer />}
                    />
                    <Route path="/" element={<AdminLayout />}>
                        <Route index element={<DefaultRedirect />} />

                        <Route path="admin">
                            <Route
                                index
                                element={<DefaultRedirect />}
                            />
                            <Route
                                path="dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="regions"
                                element={
                                    <ProtectedRoute>
                                        <Regions />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="regions/:region"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="regions/:regionId/details"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="edcs"
                                element={
                                    <RegionUserRoute>
                                        <EDCs />
                                    </RegionUserRoute>
                                }
                            />
                            <Route
                                path=":region/edcs"
                                element={
                                    <RegionUserRoute>
                                        <EDCs />
                                    </RegionUserRoute>
                                }
                            />
                            <Route
                                path=":region/edcs/:edcId/details"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="substations"
                                element={
                                    <RegionUserRoute>
                                        <Substations />
                                    </RegionUserRoute>
                                }
                            />
                            <Route
                                path=":region/substations"
                                element={
                                    <RegionUserRoute>
                                        <Substations />
                                    </RegionUserRoute>
                                }
                            />
                            <Route
                                path=":region/feeders"
                                element={
                                    <RegionUserRoute>
                                        <Feeders />
                                    </RegionUserRoute>
                                }
                            />
                            <Route
                                path=":region/feeders/:feederId/details"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="tickets">
                                <Route
                                    index
                                    element={
                                        <ProtectedRoute>
                                            <Tickets />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="new"
                                    element={
                                        <ProtectedRoute>
                                            <CreateTicket />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path=":id"
                                    element={
                                        <ProtectedRoute>
                                            <TicketDetails />
                                        </ProtectedRoute>
                                    }
                                />
                            </Route>
                            <Route
                                path="account"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="emulate"
                                element={
                                    <ProtectedRoute>
                                        <Load />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="terms" element={<Terms />} />
                            <Route path="privacy" element={<Privacy />} />
                        </Route>

                        <Route path="user">
                            <Route
                                index
                                element={<DefaultRedirect />}
                            />
                            <Route
                                path=":region/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path=":region/edcs"
                                element={
                                    <ProtectedRoute>
                                        <EDCs />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path=":region/edcs/:edcId/details"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path=":region/substations"
                                element={
                                    <ProtectedRoute>
                                        <Substations />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path=":region/substations/:substationId/details"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path=":region/feeders"
                                element={
                                    <ProtectedRoute>
                                        <Feeders />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path=":region/feeders/:feederId/details"
                                element={
                                    <ProtectedRoute>
                                        <LongDetailsWidget />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path=":region"
                                element={<RegionRedirect />}
                            />
                            <Route
                                path="regions/:region/details"
                                element={<RegionRedirect />}
                            />
                        </Route>

                        <Route path="*" element={<DefaultRedirect />} />
                    </Route>
                    <Route path="/auth" element={<AuthLayout />}>
                        <Route
                            index
                            element={<Navigate to="/auth/login" replace />}
                        />
                        <Route path="login" element={<Login />} />
                        <Route
                            path="forgot-password"
                            element={<ForgotPassword />}
                        />
                        <Route path="verification" element={<Verification />} />
                        <Route path="terms" element={<Terms />} />
                        <Route path="privacy" element={<Privacy />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
