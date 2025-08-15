import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import StateLevelDashboard from "./pages/admin/StateLevelDashboard";
import DistrictLevelDashboard from "./pages/admin/DistrictLevelDashboard";
import BlockLevelDashboard from "./pages/admin/BlockLevelDashboard";
import SchoolLevelDashboard from "./pages/admin/SchoolLevelDashboard";
import RegistrationOfBooks from "./pages/admin/RegistrationOfBooks";
import CreateProfile from "./pages/admin/CreateProfile";
import StateReceivedItems from "./pages/admin/StateReceivedItems";

import Issues from "./pages/admin/Issues";
import Notifications from "./pages/admin/Notifications";
import Requisition from "./pages/admin/Requisition";
import SchoolLoginCredentials from "./pages/admin/SchoolLoginCredentials";
import SchoolRequisition from "./pages/admin/SchoolRequisition";
import SchoolNotifications from "./pages/admin/SchoolNotifications";
import SchoolReceived from "./pages/admin/SchoolReceived";
import SchoolDistribute from "./pages/admin/SchoolDistribute";
import BlockLoginCredentials from "./pages/admin/BlockLoginCredentials";
import BlockCreateProfile from "./pages/admin/BlockCreateProfile";
import BlockRequisition from "./pages/admin/BlockRequisition";
import BlockNotifications from "./pages/admin/BlockNotifications";
import DistrictProfile from "./pages/admin/DistrictProfile";
import DistrictCreateProfile from "./pages/admin/DistrictCreateProfile";
import DistrictRequisition from "./pages/admin/DistrictRequisition";
import DistrictNotifications from "./pages/admin/DistrictNotifications";
import BlockIssues from "./pages/admin/BlockIssues";
import DistrictIssues from "./pages/admin/DistrictIssues";
import SchoolNotificationsCreate from "./pages/admin/SchoolNotificationsCreate";
import SchoolProfile from "./pages/admin/SchoolProfile";
import BlockProfile from "./pages/admin/BlockProfile";
import BlockSchoolDetails from "./pages/admin/BlockSchoolDetails";
import RequisitionWindow from "./pages/admin/RequisitionWindow";
import Reports from "./pages/admin/Reports";
import StateEChallan from "./pages/admin/StateEChallan";
import DistrictEChallan from "./pages/admin/DistrictEChallan";
import BlockEChallan from "./pages/admin/BlockEChallan";
import SchoolList from "./pages/admin/SchoolList";
import DistrictDetails from "./pages/admin/DistrictDetails";
import PrivateSchoolDashboard from "./pages/admin/PrivateSchoolDashboard";
import PrivateSchoolProfile from "./pages/admin/PrivateSchoolProfile";
import PrivateSchoolRequisition from "./pages/admin/PrivateSchoolRequisition";
import PrivateSchoolReceived from "./pages/admin/PrivateSchoolReceived";
import PrivateSchoolIssues from "./pages/admin/PrivateSchoolIssues";
import PrivateSchoolNotifications from "./pages/admin/PrivateSchoolNotifications";
import CreatePrivateSchool from "./pages/admin/CreatePrivateSchool";
import PrivateSchoolApproval from "./pages/admin/PrivateSchoolApproval";
import StateBacklogEntry from "./pages/admin/StateBacklogEntry";
import DistrictBacklogEntry from "./pages/admin/DistrictBacklogEntry";
import BlockBacklogEntry from "./pages/admin/BlockBacklogEntry";
import SchoolBacklogEntry from "./pages/admin/SchoolBacklogEntry";
import ChartsVisualization from "./pages/admin/ChartsVisualization";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            {/* State Level Routes */}
            <Route
              path="/admin/state"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <StateLevelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/register-books"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <RegistrationOfBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/create-profile"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <CreateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/received"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <StateReceivedItems adminLevel={""} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/state-echallan"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <StateEChallan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/issues"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <Issues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/charts-visualization"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <ChartsVisualization />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/notifications"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/requisition"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <Requisition />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/private-school-approval"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <PrivateSchoolApproval />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/backlog-entry"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <StateBacklogEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/requisition-window"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <RequisitionWindow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/reports"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/state/district-details/:districtName"
              element={
                <ProtectedRoute allowedRoles={["STATE"]}>
                  <DistrictDetails />
                </ProtectedRoute>
              }
            />

            {/* District Level Routes */}
            <Route
              path="/admin/district"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictLevelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/profile"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/create-profile"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictCreateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/requisition"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictRequisition />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/notifications"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/issues"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictIssues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/district-echallan"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictEChallan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/backlog-entry"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <DistrictBacklogEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/district/add-private-school"
              element={
                <ProtectedRoute allowedRoles={["DISTRICT"]}>
                  <CreatePrivateSchool />
                </ProtectedRoute>
              }
            />

            {/* Block Level Routes */}
            <Route
              path="/admin/block"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockLevelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/login-credentials"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockLoginCredentials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/create-profile"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockCreateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/requisition"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockRequisition />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/notifications"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/issues"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockIssues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/block-echallan"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockEChallan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/profile"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/school-details"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockSchoolDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/block/backlog-entry"
              element={
                <ProtectedRoute allowedRoles={["BLOCK"]}>
                  <BlockBacklogEntry />
                </ProtectedRoute>
              }
            />

            {/* School Level Routes */}
            <Route
              path="/admin/school"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolLevelDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/login-credentials"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolLoginCredentials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/requisition"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolRequisition />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/notifications"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/received"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolReceived adminLevel={""} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/distribute"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolDistribute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/issues"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <Issues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/profile"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/backlog-entry"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolBacklogEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/school/notifications-create"
              element={
                <ProtectedRoute allowedRoles={["SCHOOL"]}>
                  <SchoolNotificationsCreate />
                </ProtectedRoute>
              }
            />

            {/* Private School Routes */}
            <Route
              path="/admin/private-school"
              element={
                <ProtectedRoute allowedRoles={["PRIVATE_SCHOOL"]}>
                  <PrivateSchoolDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/private-school/profile"
              element={
                <ProtectedRoute allowedRoles={["PRIVATE_SCHOOL"]}>
                  <PrivateSchoolProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/private-school/requisition"
              element={
                <ProtectedRoute allowedRoles={["PRIVATE_SCHOOL"]}>
                  <PrivateSchoolRequisition />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/private-school/received"
              element={
                <ProtectedRoute allowedRoles={["PRIVATE_SCHOOL"]}>
                  <PrivateSchoolReceived />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/private-school/issues"
              element={
                <ProtectedRoute allowedRoles={["PRIVATE_SCHOOL"]}>
                  <PrivateSchoolIssues />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/private-school/notifications"
              element={
                <ProtectedRoute allowedRoles={["PRIVATE_SCHOOL"]}>
                  <PrivateSchoolNotifications />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - accessible by multiple roles */}
            <Route
              path="/admin/schools"
              element={
                <ProtectedRoute allowedRoles={["STATE", "DISTRICT", "BLOCK"]}>
                  <SchoolList />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
