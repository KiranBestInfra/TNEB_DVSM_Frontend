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
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="regions" element={<Regions />} />
                            <Route path=":region/edcs" element={<EDCs />} />
                            <Route path=":region/substations" element={<Substations />} />
                            <Route path=":region/feeders" element={<Feeders />} />
                            <Route path="tickets">
                                <Route index element={<Tickets />} />
                                <Route path="new" element={<CreateTicket />} />
                                <Route path=":id" element={<TicketDetails />} />
                            </Route>
                            <Route path="account" element={<Profile />} />
                            <Route path="emulate" element={<Load />} />
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
