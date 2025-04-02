import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
    useParams,
} from 'react-router-dom';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
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
import RegionDetails from './pages/RegionDetails';
import EdcDetails from './pages/EdcDetails';
import SubstationDetails from './pages/SubstationDetails';
import FeederDetails from './pages/FeederDetails';
import UserRegionDashboard from './pages/UserRegionDashboard';
import RegionEdcs from './pages/RegionEdcs';
import EdcSubstations from './pages/EdcSubstations';
import RegionSubstations from './pages/RegionSubstations';
import RegionFeeders from './pages/RegionFeeders';
import UserEdcDashboard from './pages/UserEdcDashboard';
import UserSubstationDashboard from './pages/UserSubstationDashboard';
import EdcFeeders from './pages/EdcFeeders';

const App = () => {
    useEffect(() => {
        try {
            const loginInfo = localStorage.getItem('loginInfo');
            if (loginInfo) {
                const parsedInfo = JSON.parse(loginInfo);
                console.log(
                    'App - Initial localStorage loginInfo:',
                    parsedInfo
                );
                console.log(
                    'App - User region from localStorage:',
                    parsedInfo?.user?.region || parsedInfo?.region
                );
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

                let regionValue =
                    decoded.region ||
                    decoded.Region ||
                    decoded.regionId ||
                    decoded.RegionId ||
                    decoded.region_id ||
                    null;

                if (regionValue) {
                    regionValue = regionValue.toLowerCase();
                }

                console.log('Initial region value from token:', regionValue);

                if (
                    !regionValue &&
                    decoded.userId &&
                    decoded.userId.includes('_REG')
                ) {
                    regionValue = decoded.userId.split('_REG')[0].toLowerCase();
                    console.log('Extracted region from userId:', regionValue);
                }

                let circleValue =
                    decoded.circle ||
                    decoded.Circle ||
                    decoded.circleId ||
                    decoded.CircleId ||
                    decoded.circle_id ||
                    null;

                if (
                    !circleValue &&
                    decoded.userId &&
                    decoded.userId.includes('_EDC')
                ) {
                    circleValue = decoded.userId.split('_EDC')[0].toLowerCase();
                    console.log('Extracted circle from userId:', circleValue);

                    if (!regionValue) {
                        const circleToRegionMap = {
                            central: 'kancheepuram',
                            north: 'tiruvannamalai',
                        };
                        regionValue =
                            circleToRegionMap[circleValue.toLowerCase()] ||
                            'kancheepuram';
                        console.log('Mapped circle to region:', regionValue);
                    }
                }

                let substationValue =
                    decoded.substation ||
                    decoded.Substation ||
                    decoded.substationId ||
                    decoded.SubstationId ||
                    decoded.substation_id ||
                    null;

                if (
                    !substationValue &&
                    decoded.userId &&
                    decoded.userId.includes('_SUB')
                ) {
                    substationValue = decoded.userId
                        .split('_SUB')[0]
                        .toLowerCase();
                    console.log(
                        'Extracted substation from userId:',
                        substationValue
                    );

                    if (!regionValue) {
                        const substationToRegionMap = {
                            central_sub1: 'kancheepuram',
                            north_sub1: 'tiruvannamalai',
                        };
                        regionValue =
                            substationToRegionMap[
                                substationValue.toLowerCase()
                            ] || 'kancheepuram';
                        console.log(
                            'Mapped substation to region:',
                            regionValue
                        );
                    }
                }

                console.log(
                    'Extracted region value after userId processing:',
                    regionValue
                );
                console.log('Extracted circle value:', circleValue);
                console.log('Extracted substation value:', substationValue);

                const loginInfo = localStorage.getItem('loginInfo');
                let parsedLoginInfo = null;

                if (loginInfo) {
                    try {
                        parsedLoginInfo = JSON.parse(loginInfo);
                        console.log(
                            'Login info from localStorage:',
                            parsedLoginInfo
                        );
                    } catch (e) {
                        console.error('Error parsing login info:', e);
                    }
                }

                const regionFromStorage =
                    parsedLoginInfo?.user?.region ||
                    parsedLoginInfo?.region ||
                    null;
                console.log('Region from localStorage:', regionFromStorage);

                const circleFromStorage =
                    parsedLoginInfo?.user?.circle ||
                    parsedLoginInfo?.circle ||
                    null;
                const substationFromStorage =
                    parsedLoginInfo?.user?.substation ||
                    parsedLoginInfo?.substation ||
                    null;

                const finalRegion = regionValue || regionFromStorage;
                const finalCircle = circleValue || circleFromStorage;
                const finalSubstation =
                    substationValue || substationFromStorage;

                console.log('Final region value:', finalRegion);
                console.log('Final circle value:', finalCircle);
                console.log('Final substation value:', finalSubstation);

                return {
                    roleId: decoded.role_id || decoded.RoleId || 0,
                    roleName:
                        decoded.role ||
                        decoded.Role ||
                        decoded.user_role ||
                        'User',
                    region: finalRegion,
                    circle: finalCircle,
                    substation: finalSubstation,
                    userId: decoded.userId || decoded.UserId || null,
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

        if (
            user.roleId === 2 ||
            user.roleName?.toLowerCase() === 'region user'
        ) {
            let region = null;

            if (user.userId) {
                if (user.userId.includes('_')) {
                    const circleFromUserId = user.userId
                        .split('_')[1]
                        .toLowerCase();
                    console.log(
                        'DefaultRedirect - Circle from userId:',
                        circleFromUserId
                    );

                    const circleToRegionMap = {
                        central: null,
                    };

                    region = circleToRegionMap[circleFromUserId];
                    if (region) {
                        console.log(
                            'DefaultRedirect - Found region from circle mapping:',
                            region
                        );
                    }
                }

                if (!region && user.userId.includes('_sub')) {
                    const substationFromUserId = user.userId
                        .split('_')[1]
                        .toLowerCase();
                    console.log(
                        'DefaultRedirect - Substation from userId:',
                        substationFromUserId
                    );

                    const substationToRegionMap = {
                        central_sub1: null,
                    };

                    region = substationToRegionMap[substationFromUserId];
                    if (region) {
                        console.log(
                            'DefaultRedirect - Found region from substation mapping:',
                            region
                        );
                    }
                }
            }

            if (!region && user.region) {
                region = user.region.toLowerCase();
                console.log(
                    'DefaultRedirect - Found region from user.region:',
                    region
                );
            }

            if (!region) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        region =
                            parsedLoginInfo?.user?.region ||
                            parsedLoginInfo?.region;
                        if (region) {
                            region = region.toLowerCase();
                            console.log(
                                'DefaultRedirect - Found region from localStorage:',
                                region
                            );
                        }
                    }
                } catch (e) {
                    console.error(
                        'DefaultRedirect - Error parsing loginInfo from localStorage:',
                        e
                    );
                }
            }

            if (!region) {
                console.error(
                    'DefaultRedirect - CRITICAL: Unable to determine region for Region User'
                );
                alert(
                    'Unable to determine your region. Please contact your administrator.'
                );
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log('DefaultRedirect - Redirecting to region:', region);
            return <Navigate to={`/user/${region}/dashboard`} replace />;
        }

        return <Navigate to="/admin/dashboard" replace />;
    };

    const RegionRedirect = () => {
        const { user } = useAuth();
        const { region } = useParams();

        console.log(
            'RegionRedirect - User:',
            user,
            'URL region param:',
            region
        );

        if (!user) {
            console.log('RegionRedirect - No user, redirecting to login');
            return <Navigate to="/login" replace />;
        }

        if (!region || region === 'dashboard' || region === 'undefined') {
            let userRegion = null;

            if (user.region) {
                userRegion = user.region.toLowerCase();
                console.log(
                    'RegionRedirect - Found region from user object:',
                    userRegion
                );
            }

            if (!userRegion) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        userRegion =
                            parsedLoginInfo?.user?.region ||
                            parsedLoginInfo?.region;
                        if (userRegion) {
                            userRegion = userRegion.toLowerCase();
                            console.log(
                                'RegionRedirect - Found region from localStorage:',
                                userRegion
                            );
                        }
                    }
                } catch (e) {
                    console.error(
                        'RegionRedirect - Error getting region from localStorage:',
                        e
                    );
                }
            }

            if (!userRegion) {
                console.error(
                    'RegionRedirect - CRITICAL: Unable to determine region'
                );
                alert(
                    'Unable to determine your region. Please contact your administrator.'
                );
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log('RegionRedirect - Redirecting to region:', userRegion);
            return <Navigate to={`/user/${userRegion}/dashboard`} replace />;
        }

        const safeRegion = region.toLowerCase();
        console.log('RegionRedirect - Using region from URL:', safeRegion);
        return <Navigate to={`/user/${safeRegion}/dashboard`} replace />;
    };

    const RegionUserRoute = ({ children }) => {
        const { user } = useAuth();
        const location = useLocation();

        console.log(
            'RegionUserRoute - User:',
            user,
            'Location:',
            location.pathname
        );

        if (!user) {
            console.log('RegionUserRoute - No user, redirecting to login');
            return <Navigate to="/login" replace />;
        }

        const isRegionUser =
            user.roleId === 2 || user.roleName?.toLowerCase() === 'region user';

        const isAllowedPath =
            location.pathname === '/admin/dashboard' ||
            (location.pathname.includes('/user/') &&
                (location.pathname.includes('/dashboard') ||
                    location.pathname.includes('/edcs') ||
                    location.pathname.includes('/substations') ||
                    location.pathname.includes('/feeders')));

        if (isRegionUser && !isAllowedPath) {
            let userRegion = null;

            if (user.region) {
                userRegion = user.region.toLowerCase();
                console.log(
                    'RegionUserRoute - Found region from user object:',
                    userRegion
                );
            }

            if (!userRegion) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        userRegion =
                            parsedLoginInfo?.user?.region ||
                            parsedLoginInfo?.region;
                        if (userRegion) {
                            userRegion = userRegion.toLowerCase();
                            console.log(
                                'RegionUserRoute - Found region from localStorage:',
                                userRegion
                            );
                        }
                    }
                } catch (e) {
                    console.error(
                        'RegionUserRoute - Error getting region from localStorage:',
                        e
                    );
                }
            }

            if (!userRegion) {
                console.error(
                    'RegionUserRoute - CRITICAL: Unable to determine region'
                );
                alert(
                    'Unable to determine your region. Please contact your administrator.'
                );
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log('RegionUserRoute - Redirecting to region:', userRegion);
            return <Navigate to={`/user/${userRegion}/dashboard`} replace />;
        }

        return <ProtectedRoute>{children}</ProtectedRoute>;
    };

    RegionUserRoute.propTypes = {
        children: PropTypes.node.isRequired,
    };

    const EdcRedirect = () => {
        const { user } = useAuth();
        const { edc } = useParams();

        console.log('EdcRedirect - User:', user, 'URL edc param:', edc);

        if (!user) {
            console.log('EdcRedirect - No user, redirecting to login');
            return <Navigate to="/login" replace />;
        }

        if (!edc || edc === 'dashboard' || edc === 'undefined') {
            let userEdc = null;

            if (user.circle) {
                userEdc = user.circle.toLowerCase();
                console.log(
                    'EdcRedirect - Found edc from user object:',
                    userEdc
                );
            }

            if (!userEdc) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        userEdc =
                            parsedLoginInfo?.user?.circle ||
                            parsedLoginInfo?.circle;
                        if (userEdc) {
                            userEdc = userEdc.toLowerCase();
                            console.log(
                                'EdcRedirect - Found edc from localStorage:',
                                userEdc
                            );
                        }
                    }
                } catch (e) {
                    console.error(
                        'EdcRedirect - Error getting edc from localStorage:',
                        e
                    );
                }
            }

            if (!userEdc) {
                console.error(
                    'EdcRedirect - CRITICAL: Unable to determine edc'
                );
                alert(
                    'Unable to determine your EDC. Please contact your administrator.'
                );
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log('EdcRedirect - Redirecting to edc:', userEdc);
            return <Navigate to={`/user/edc/${userEdc}/dashboard`} replace />;
        }

        const safeEdc = edc.toLowerCase();
        console.log('EdcRedirect - Using edc from URL:', safeEdc);
        return <Navigate to={`/user/edc/${safeEdc}/dashboard`} replace />;
    };

    const SubstationRedirect = () => {
        const { user } = useAuth();
        const { substation } = useParams();

        console.log(
            'SubstationRedirect - User:',
            user,
            'URL substation param:',
            substation
        );

        if (!user) {
            console.log('SubstationRedirect - No user, redirecting to login');
            return <Navigate to="/login" replace />;
        }

        if (
            !substation ||
            substation === 'dashboard' ||
            substation === 'undefined'
        ) {
            let userSubstation = null;

            if (user.substation) {
                userSubstation = user.substation.toLowerCase();
                console.log(
                    'SubstationRedirect - Found substation from user object:',
                    userSubstation
                );
            }

            if (!userSubstation) {
                try {
                    const loginInfo = localStorage.getItem('loginInfo');
                    if (loginInfo) {
                        const parsedLoginInfo = JSON.parse(loginInfo);
                        userSubstation =
                            parsedLoginInfo?.user?.substation ||
                            parsedLoginInfo?.substation;
                        if (userSubstation) {
                            userSubstation = userSubstation.toLowerCase();
                            console.log(
                                'SubstationRedirect - Found substation from localStorage:',
                                userSubstation
                            );
                        }
                    }
                } catch (e) {
                    console.error(
                        'SubstationRedirect - Error getting substation from localStorage:',
                        e
                    );
                }
            }

            if (!userSubstation) {
                console.error(
                    'SubstationRedirect - CRITICAL: Unable to determine substation'
                );
                alert(
                    'Unable to determine your substation. Please contact your administrator.'
                );
                return <Navigate to="/admin/dashboard" replace />;
            }

            console.log(
                'SubstationRedirect - Redirecting to substation:',
                userSubstation
            );
            return (
                <Navigate
                    to={`/user/substation/${userSubstation}/dashboard`}
                    replace
                />
            );
        }

        const safeSubstation = substation.toLowerCase();
        console.log(
            'SubstationRedirect - Using substation from URL:',
            safeSubstation
        );
        return (
            <Navigate
                to={`/user/substation/${safeSubstation}/dashboard`}
                replace
            />
        );
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

                        <Route path="admin" element={<ProtectedRoute />}>
                            <Route index element={<DefaultRedirect />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="regions" element={<Regions />} />
                            <Route
                                path="regions/:region"
                                element={<RegionDetails />}
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
                                path="substations"
                                element={
                                    <RegionUserRoute>
                                        <Substations />
                                    </RegionUserRoute>
                                }
                            />
                            <Route
                                path="feeders"
                                element={
                                    <RegionUserRoute>
                                        <Feeders />
                                    </RegionUserRoute>
                                }
                            />
                            <Route path="tickets">
                                <Route index element={<Tickets />} />
                                <Route path="new" element={<CreateTicket />} />
                                <Route path=":id" element={<TicketDetails />} />
                            </Route>
                            <Route path="account" element={<Profile />} />
                            <Route path="emulate" element={<Load />} />
                            <Route path="terms" element={<Terms />} />
                            <Route path="privacy" element={<Privacy />} />

                            <Route
                                path=":region/edcs"
                                element={<RegionEdcs />}
                            />
                            <Route
                                path=":region/substations"
                                element={<RegionSubstations />}
                            />
                            <Route
                                path=":region/feeders"
                                element={<RegionFeeders />}
                            />

                            {/*  */}
                            <Route
                                path=":region/edcs/:edcId/details"
                                element={<EdcDetails />}
                            />
                            <Route
                                path=":region/:edcs/substations"
                                element={<EdcSubstations />}
                            />
                            <Route
                                path=":region/feeders/:feederId/details"
                                element={<FeederDetails />}
                            />
                        </Route>

                        <Route path="user/region" element={<ProtectedRoute />}>
                            <Route index element={<DefaultRedirect />} />
                            <Route
                                path=":region/dashboard"
                                element={<UserRegionDashboard />}
                            />
                            <Route
                                path=":region/edcs"
                                element={<RegionEdcs />}
                            />
                            <Route
                                path=":region/edcs/:edcId/details"
                                element={<EdcDetails />}
                            />
                            <Route
                                path=":region/substations"
                                element={<RegionSubstations />}
                            />
                            <Route
                                path=":region/substations/:substationId/details"
                                element={<SubstationDetails />}
                            />
                            <Route
                                path=":region/feeders"
                                element={<RegionFeeders />}
                            />
                            <Route
                                path=":region/feeders/:feederId/details"
                                element={<FeederDetails />}
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

                        <Route path="user/edc" element={<ProtectedRoute />}>
                            <Route index element={<DefaultRedirect />} />
                            <Route
                                path=":edc/dashboard"
                                element={<UserEdcDashboard />}
                            />
                            <Route
                                path=":edc/substations"
                                element={<EdcSubstations />}
                            />
                            <Route
                                path=":edc/substations/:substationId/details"
                                element={<SubstationDetails />}
                            />
                            <Route
                                path=":edc/feeders"
                                element={<EdcFeeders />}
                            />
                            <Route
                                path=":edc/feeders/:feederId/details"
                                element={<FeederDetails />}
                            />
                            <Route path=":edc" element={<EdcRedirect />} />
                        </Route>

                        <Route
                            path="user/substation"
                            element={<ProtectedRoute />}>
                            <Route index element={<DefaultRedirect />} />
                            <Route
                                path=":substation/dashboard"
                                element={<UserSubstationDashboard />}
                            />
                            <Route
                                path=":substation/feeders"
                                element={<RegionFeeders />}
                            />
                            <Route
                                path=":substation/feeders/:feederId/details"
                                element={<FeederDetails />}
                            />
                            <Route
                                path=":substation"
                                element={<SubstationRedirect />}
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
