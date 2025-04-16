import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import ForgotPassword from './pages/ForgotPassword';
import Verification from './pages/Verification';
import PDFViewer from './components/Documents/PDFViewer';
import './styles/MediaQuaries.css';
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
import ErrorLogs from './pages/ErrorLogs';
import ProtectedRoute from './components/ProtectedRoute';
import RegionDetails from './pages/RegionDetails';
import EdcDetails from './pages/EdcDetails';
import SubstationDetails from './pages/SubstationDetails';
import EdcSubstationDetails from './pages/EdcSubstationDetails';
import EdcFeederDetails from './pages/EdcFeederDetails';
import FeederDetails from './pages/FeederDetails';
import RegionEdcs from './pages/RegionEdcs';
import EdcSubstations from './pages/EdcSubstations';
import RegionSubstations from './pages/RegionSubstations';
import RegionFeeders from './pages/RegionFeeders';
import UserEdcDashboard from './pages/UserEdcDashboard';
import UserSubstationDashboard from './pages/UserSubstationDashboard';
import EdcFeeders from './pages/EdcFeeders';
import SubstationFeeders from './pages/SubstationFeeders';
import EdcSubstationFeeders from './pages/EdcSubstationFeeders';
import RegionSubstationFeederDetails from './pages/RegionSubstationFeederDetails';
import EdcSubstationFeederDetails from './pages/EdcSubstationFeederDetails';
// import UserRegionDashboard from './pages/UserRegionDashboard';

const App = () => {
    return (
        <BrowserRouter basename="/exedb">
            <AuthProvider>
                <Routes>
                    <Route
                        path="/pdf/:invoiceId/:meterNo"
                        element={<PDFViewer />}
                    />
                    <Route path="/" element={<AdminLayout />}>
                        <Route
                            index
                            element={<Navigate to="/admin/dashboard" replace />}
                        />

                        <Route
                            path="admin"
                            element={
                                <ProtectedRoute allowedRoles={['admin']} />
                            }>
                            <Route
                                index
                                element={
                                    <Navigate to="/admin/dashboard" replace />
                                }
                            />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="regions" element={<Regions />} />
                            <Route
                                path="regions/:region/details"
                                element={<RegionDetails />}
                            />
                            <Route path="edcs" element={<EDCs />} />
                            <Route
                                path="substations"
                                element={<Substations />}
                            />
                            <Route path="feeders" element={<Feeders />} />
                            <Route path="tickets">
                                <Route index element={<Tickets />} />
                                <Route path="new" element={<CreateTicket />} />
                                <Route path=":id" element={<TicketDetails />} />
                            </Route>
                            <Route path="account" element={<Profile />} />
                            <Route path="emulate" element={<Load />} />
                            <Route path="terms" element={<Terms />} />
                            <Route path="privacy" element={<Privacy />} />
                            <Route path="error-logs" element={<ErrorLogs />} />

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

                            <Route
                                path=":region/edcs/:edcId/details"
                                element={<EdcDetails />}
                            />
                            <Route
                                path=":region/:edcs/substations"
                                element={<EdcSubstations />}
                            />
                            <Route
                                path=":region/:edcs/feeders"
                                element={<EdcFeeders />}
                            />
                            <Route
                                path=":region/:edcId/substations/:substationId/details"
                                element={<EdcSubstationDetails />}
                            />
                            <Route
                                path=":region/:edcId/feeders/:feederId/details"
                                element={<EdcFeederDetails />}
                            />
                            <Route
                                path=":region/:edcs/:substationId/feeders"
                                element={<EdcSubstationFeeders />}
                            />
                            <Route
                                path=":region/:edcs/substations/:substationId/feeders/:feederId/details"
                                element={<EdcSubstationFeederDetails />}
                            />
                            <Route
                                path=":region/substations/:substationId/feeders"
                                element={<SubstationFeeders />}
                            />
                            <Route
                                path=":region/substations/:substationId/feeders/:feederId/details"
                                element={<RegionSubstationFeederDetails />}
                            />
                            <Route
                                path=":region/substations/:substationId/details"
                                element={<SubstationDetails />}
                            />
                            <Route
                                path=":region/feeders/:feederId/details"
                                element={<FeederDetails />}
                            />
                        </Route>

                        <Route
                            path="user/region"
                            element={
                                <ProtectedRoute allowedRoles={['region']} />
                            }>
                            <Route
                                index
                                element={<Navigate to="dashboard" replace />}
                            />
                            <Route
                                path="dashboard"
                                element={<RegionDetails />}
                            />
                            <Route path="edcs" element={<RegionEdcs />} />
                            <Route
                                path="edcs/:edcId/details"
                                element={<EdcDetails />}
                            />
                            <Route
                                path="substations"
                                element={<RegionSubstations />}
                            />
                            <Route
                                path="substations/:substationId/details"
                                element={<SubstationDetails />}
                            />
                            <Route path="feeders" element={<RegionFeeders />} />
                            <Route
                                path=":edcId/substations/:substationId/details"
                                element={<EdcSubstationDetails />}
                            />
                            <Route
                                path=":edcs/feeders"
                                element={<EdcFeeders />}
                            />
                            <Route
                                path=":edcs/substations"
                                element={<EdcSubstations />}
                            />
                            <Route
                                path=":edcs/:substationId/feeders"
                                element={<EdcSubstationFeeders />}
                            />
                        </Route>

                        <Route
                            path="user/edc"
                            element={
                                <ProtectedRoute allowedRoles={['circle']} />
                            }>
                            <Route
                                index
                                element={
                                    <Navigate to=":edc/dashboard" replace />
                                }
                            />
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
                                element={<EdcSubstationDetails />}
                            />
                            <Route
                                path=":edc/feeders"
                                element={<EdcFeeders />}
                            />
                            <Route
                                path=":edc/feeders/:feederId/details"
                                element={<EdcFeederDetails />}
                            />
                            <Route
                                path=":edc/substations/:substationId/feeders"
                                element={<EdcSubstationFeeders />}
                            />
                            <Route
                                path=":edc/substations/:substationId/feeders/:feederId/details"
                                element={<EdcSubstationFeederDetails />}
                            />
                        </Route>

                        <Route
                            path="user/substation"
                            element={
                                <ProtectedRoute allowedRoles={['substation']} />
                            }>
                            <Route
                                index
                                element={
                                    <Navigate
                                        to=":substation/dashboard"
                                        replace
                                    />
                                }
                            />
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
                        </Route>

                        <Route
                            path="*"
                            element={<Navigate to="/admin/dashboard" replace />}
                        />
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
