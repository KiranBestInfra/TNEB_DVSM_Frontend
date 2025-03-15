import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import ForgotPassword from './pages/ForgotPassword';
import Verification from './pages/Verification';
import ProtectedRoute from './components/ProtectedRoute';
import PDFViewer from './components/Documents/PDFViewer';
import './styles/MediaQuaries.css';
import { jwtDecode } from 'jwt-decode';
import { AuthProvider } from './components/AuthProvider';
import Profile from './pages/Profile';
import Load from './pages/Load';
import TNEBDashboard from './pages/TNEBDashboard';
import RegionDetailPage from './pages/RegionDetailPage';
import UnitDetailPage from './pages/UnitDetailPage';
import ChennaiCentralPage from './pages/ChennaiCentralPage';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

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
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                        <Route index element={<DefaultRedirect />} />

                        <Route path="admin">
                            <Route
                                index
                                element={<Navigate to="dashboard" replace />}
                            />
                            <Route path="dashboard" element={<TNEBDashboard />} />
                            <Route path="region/:regionId" element={<RegionDetailPage />} />
                            <Route path="subdistrict/:subdistrictId" element={<ChennaiCentralPage />} />
                            <Route path="units" element={<UnitDetailPage />} />
                            <Route path="tickets">
                                <Route index element={<Tickets />} />
                                <Route path="new" element={<TicketDetails />} />
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
