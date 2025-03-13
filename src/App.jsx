import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Consumers from './pages/Consumers';
import Bills from './pages/Bills';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import ForgotPassword from './pages/ForgotPassword';
import Verification from './pages/Verification';
import ProtectedRoute from './components/ProtectedRoute';
import ConsumerView from './pages/ConsumerView';
import ConsumerEdit from './pages/ConsumerEdit';
import PDFViewer from './components/Documents/PDFViewer';
import './styles/MediaQuaries.css';
import ModuleSettings from './pages/ModuleSettings';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import ConDashboard from './pages/ConDashboard';
import { jwtDecode } from 'jwt-decode';
import ConBills from './pages/ConBills';
import ConTickets from './pages/ConTickets';
import ConReports from './pages/ConReports';
import { AuthProvider } from './components/AuthProvider';
import ConTicketDetails from './pages/ConTicketDetails';
import Profile from './pages/Profile';
import Load from './pages/Load';
import TNEBDashboard from './pages/TNEBDashboard';
import RegionDetailPage from './pages/RegionDetailPage';
import UnitDetailPage from './pages/UnitDetailPage';
import ChennaiCentralPage from './pages/ChennaiCentralPage';

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
        const role = getUserRole();
        return (
            <Navigate
                to={role === 'Admin' ? '/admin/emptydashboard' : '/user/dashboard'}
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
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                        <Route index element={<DefaultRedirect />} />

                        <Route path="user">
                            <Route
                                index
                                element={<Navigate to="dashboard" replace />}
                            />
                            <Route
                                path="dashboard"
                                element={<ConDashboard />}
                            />
                            <Route path="bills" element={<ConBills />} />
                            <Route path="tickets">
                                <Route index element={<ConTickets />} />
                                <Route
                                    path="new"
                                    element={<ConTicketDetails />}
                                />
                                <Route
                                    path=":id"
                                    element={<ConTicketDetails />}
                                />
                            </Route>
                            <Route path="reports" element={<ConReports />} />
                            <Route path="account" element={<Profile />} />
                        </Route>
                        <Route path="admin">
                            <Route
                                index
                                element={<Navigate to="dashboard" replace />}
                            />
                            <Route path="dashboard" element={<TNEBDashboard />} />
                            <Route path="region/:regionId" element={<RegionDetailPage />} />
                            <Route path="subdistrict/:subdistrictId" element={<ChennaiCentralPage />} />
                            <Route path="units" element={<UnitDetailPage />} />
                            <Route path="consumers">
                                <Route index element={<Consumers />} />
                                <Route
                                    path="view/:id"
                                    element={<ConsumerView />}
                                />
                                <Route
                                    path="edit/:id"
                                    element={<ConsumerEdit />}
                                />
                            </Route>
                            <Route path="reports" element={<Reports />} />
                            <Route path="bills" element={<Bills />} />
                            <Route path="tickets">
                                <Route index element={<Tickets />} />
                                <Route path="new" element={<TicketDetails />} />
                                <Route path=":id" element={<TicketDetails />} />
                            </Route>
                            <Route
                                path="settings"
                                element={<ModuleSettings />}
                            />
                            <Route path="account" element={<Profile />} />
                            <Route path="emulate" element={<Load />} />
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
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
