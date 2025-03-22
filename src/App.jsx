import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import ForgotPassword from './pages/ForgotPassword';
import Verification from './pages/Verification';
import PDFViewer from './components/Documents/PDFViewer';
import './styles/MediaQuaries.css';
import { jwtDecode } from 'jwt-decode';
import { AuthProvider } from './components/AuthProvider';
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
    const getUserRole = () => {
        const accessToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('accessTokenDuplicate='))
            ?.split('=')[1];

        if (accessToken) {
            try {
                const decoded = jwtDecode(accessToken);
                const role =
                    decoded.role || decoded.Role || decoded.user_role || 'User';
                return role.toLowerCase().includes('admin') ? 'Admin' : 'User';
            } catch (error) {
                console.error('Error decoding token:', error);
                return 'User';
            }
        }
        return 'User';
    };

    const DefaultRedirect = () => {
        return <Navigate to="/admin/dashboard" replace />;
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
                                element={<Navigate to="dashboard" replace />}
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
                                path="regions/:regionId/details"
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
