import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import StateLevelDashboard from "./pages/state/StateLevelDashboard";
import DistrictLevelDashboard from "./pages/district/DistrictLevelDashboard";
import BlockLevelDashboard from "./pages/block/BlockLevelDashboard";
import SchoolLevelDashboard from "./pages/school/SchoolLevelDashboard";
import RegistrationOfBooks from "./pages/state/RegistrationOfBooks";
import StateReceivedItems from "./pages/state/StateReceivedItems";

import Issues from "./pages/state/Issues";
import SchoolIssues from "./pages/school/SchoolIssues";
import Notifications from "./pages/state/Notifications";
import Requisition from "./pages/state/Requisition";
import SchoolLoginCredentials from "./pages/school/SchoolLoginCredentials";
import SchoolRequisition from "./pages/school/SchoolRequisition";
import SchoolNotifications from "./pages/school/SchoolNotifications";
import SchoolReceived from "./pages/school/SchoolReceived";
import SchoolDistribute from "./pages/school/SchoolDistribute";
import BlockLoginCredentials from "./pages/block/BlockLoginCredentials";
import BlockCreateProfile from "./pages/block/BlockCreateProfile";
import BlockRequisition from "./pages/block/BlockRequisition";
import BlockNotifications from "./pages/block/BlockNotifications";
import DistrictProfile from "./pages/district/DistrictProfile";
import DistrictCreateProfile from "./pages/district/DistrictCreateProfile";
import DistrictRequisition from "./pages/district/DistrictRequisition";
import DistrictNotifications from "./pages/district/DistrictNotifications";
import BlockIssues from "./pages/block/BlockIssues";
import DistrictIssues from "./pages/district/DistrictIssues";
import SchoolNotificationsCreate from "./pages/school/SchoolNotificationsCreate";
import SchoolProfile from "./pages/school/SchoolProfile";
import BlockProfile from "./pages/block/BlockProfile";
import BlockSchoolDetails from "./pages/block/BlockSchoolDetails";
import RequisitionWindow from "./pages/state/RequisitionWindow";
import Reports from "./pages/state/Reports";
import StateEChallan from "./pages/state/StateEChallan";
import DistrictEChallan from "./pages/district/DistrictEChallan";
import BlockEChallan from "./pages/block/BlockEChallan";
import SchoolList from "./pages/school/SchoolList";
import DistrictDetails from "./pages/district/DistrictDetails";
import PrivateSchoolDashboard from "./pages/private-school/PrivateSchoolDashboard";
import PrivateSchoolProfile from "./pages/private-school/PrivateSchoolProfile";
import PrivateSchoolRequisition from "./pages/private-school/PrivateSchoolRequisition";
import PrivateSchoolReceived from "./pages/private-school/PrivateSchoolReceived";
import PrivateSchoolIssues from "./pages/private-school/PrivateSchoolIssues";
import PrivateSchoolNotifications from "./pages/private-school/PrivateSchoolNotifications";
import CreatePrivateSchool from "./pages/district/CreatePrivateSchool";
import PrivateSchoolApproval from "./pages/private-school/PrivateSchoolApproval";
import StateBacklogEntry from "./pages/state/StateBacklogEntry";
import DistrictBacklogEntry from "./pages/district/DistrictBacklogEntry";
import BlockBacklogEntry from "./pages/block/BlockBacklogEntry";
import SchoolBacklogEntry from "./pages/school/SchoolBacklogEntry";
import ChartsVisualization from "./pages/state/ChartsVisualization";
import EditProfile from "./pages/state/EditProfile";
import DistrictReceived from "./pages/district/DistrictReceived";
import BlockReceived from "./pages/block/BlockReceived";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <AuthProvider> */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* State Level Routes */}
          <Route path="/admin/state" element={<StateLevelDashboard />} />
          <Route
            path="/admin/state/register-books"
            element={<RegistrationOfBooks />}
          />
          <Route path="/admin/state/edit-profile" element={<EditProfile />} />
          <Route
            path="/admin/state/received"
            element={<StateReceivedItems adminLevel={""} />}
          />
          <Route
            path="/admin/state/state-echallan"
            element={<StateEChallan />}
          />
          <Route path="/admin/state/issues" element={<Issues />} />
          <Route
            path="/admin/state/charts-visualization"
            element={<ChartsVisualization />}
          />
          <Route
            path="/admin/state/notifications"
            element={<Notifications />}
          />
          <Route path="/admin/state/requisition" element={<Requisition />} />
          <Route
            path="/admin/state/private-school-approval"
            element={<PrivateSchoolApproval />}
          />
          <Route
            path="/admin/state/backlog-entry"
            element={<StateBacklogEntry />}
          />
          <Route
            path="/admin/state/requisition-window"
            element={<RequisitionWindow />}
          />
          <Route path="/admin/state/reports" element={<Reports />} />
          <Route
            path="/admin/state/district-details/:districtName"
            element={<DistrictDetails />}
          />

          {/* District Level Routes */}
          <Route path="/admin/district" element={<DistrictLevelDashboard />} />
          <Route path="/admin/district/profile" element={<DistrictProfile />} />
          <Route
            path="/admin/district/create-profile"
            element={<DistrictCreateProfile />}
          />
          <Route
            path="/admin/district/requisition"
            element={<DistrictRequisition />}
          />
          <Route
            path="/admin/district/notifications"
            element={<DistrictNotifications />}
          />
          <Route path="/admin/district/issues" element={<DistrictIssues />} />
          <Route
            path="/admin/district/district-echallan"
            element={<DistrictEChallan />}
          />
          <Route
            path="/admin/district/received"
            element={<DistrictReceived adminLevel="district" />}
          />
          <Route
            path="/admin/district/backlog-entry"
            element={<DistrictBacklogEntry />}
          />
          <Route
            path="/admin/district/add-private-school"
            element={<CreatePrivateSchool />}
          />

          {/* Block Level Routes */}
          <Route path="/admin/block" element={<BlockLevelDashboard />} />
          <Route
            path="/admin/block/login-credentials"
            element={<BlockLoginCredentials />}
          />
          <Route
            path="/admin/block/create-profile"
            element={<BlockCreateProfile />}
          />
          <Route
            path="/admin/block/requisition"
            element={<BlockRequisition />}
          />
          <Route
            path="/admin/block/received"
            element={<BlockReceived adminLevel="block" />}
          />
          <Route
            path="/admin/block/notifications"
            element={<BlockNotifications />}
          />
          <Route path="/admin/block/issues" element={<BlockIssues />} />
          <Route
            path="/admin/block/block-echallan"
            element={<BlockEChallan />}
          />
          <Route path="/admin/block/profile" element={<BlockProfile />} />
          <Route
            path="/admin/block/school-details"
            element={<BlockSchoolDetails />}
          />
          <Route
            path="/admin/block/backlog-entry"
            element={<BlockBacklogEntry />}
          />

          {/* School Level Routes */}
          <Route path="/admin/school" element={<SchoolLevelDashboard />} />
          <Route
            path="/admin/school/login-credentials"
            element={<SchoolLoginCredentials />}
          />
          <Route
            path="/admin/school/requisition"
            element={<SchoolRequisition />}
          />
          <Route
            path="/admin/school/notifications"
            element={<SchoolNotifications />}
          />
          <Route path="/admin/school/received" element={<SchoolReceived />} />
          <Route
            path="/admin/school/distribute"
            element={<SchoolDistribute />}
          />
          <Route path="/admin/school/issues" element={<SchoolIssues />} />
          <Route path="/admin/school/profile" element={<SchoolProfile />} />
          <Route
            path="/admin/school/backlog-entry"
            element={<SchoolBacklogEntry />}
          />
          <Route
            path="/admin/school/notifications-create"
            element={<SchoolNotificationsCreate />}
          />

          {/* Private School Routes */}
          <Route
            path="/admin/private-school"
            element={<PrivateSchoolDashboard />}
          />
          <Route
            path="/admin/private-school/profile"
            element={<PrivateSchoolProfile />}
          />
          <Route
            path="/admin/private-school/requisition"
            element={<PrivateSchoolRequisition />}
          />
          <Route
            path="/admin/private-school/received"
            element={<PrivateSchoolReceived />}
          />
          <Route
            path="/admin/private-school/issues"
            element={<PrivateSchoolIssues />}
          />
          <Route
            path="/admin/private-school/notifications"
            element={<PrivateSchoolNotifications />}
          />

          {/* Admin Routes - accessible by multiple roles */}
          <Route path="/admin/schools" element={<SchoolList />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* </AuthProvider> */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
