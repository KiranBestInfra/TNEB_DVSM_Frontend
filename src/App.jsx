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
import SubstationFeeders from './pages/SubstationFeeders';

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

                        <Route path="admin" element={<ProtectedRoute />}>
                            <Route
                                index
                                element={
                                    <Navigate to="/admin/dashboard" replace />
                                }
                            />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="regions" element={<Regions />} />
                            <Route
                                path="regions/:region"
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
                                path=":region/:edcs/feeder"
                                element={<EdcFeeders />}
                            />
                            <Route
                                path=":region/substations/:substationId/feeders"
                                element={<SubstationFeeders />}
                            />
                            <Route
                                path=":region/feeders/:feederId/details"
                                element={<FeederDetails />}
                            />
                        </Route>

                        <Route path="user/region" element={<ProtectedRoute />}>
                            <Route
                                index
                                element={
                                    <Navigate to=":region/dashboard" replace />
                                }
                            />
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
                        </Route>

                        <Route path="user/edc" element={<ProtectedRoute />}>
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
                        </Route>

                        <Route
                            path="user/substation"
                            element={<ProtectedRoute />}>
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