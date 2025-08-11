import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/state" element={<StateLevelDashboard />} />
          <Route path="/admin/district" element={<DistrictLevelDashboard />} />
          <Route path="/admin/block" element={<BlockLevelDashboard />} />
          <Route path="/admin/school" element={<SchoolLevelDashboard />} />
          <Route
            path="/admin/state/register-books"
            element={<RegistrationOfBooks />}
          />
          <Route
            path="/admin/state/create-profile"
            element={<CreateProfile />}
          />
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
          <Route
            path="/admin/school/received"
            element={<SchoolReceived adminLevel={""} />}
          />
          <Route
            path="/admin/school/distribute"
            element={<SchoolDistribute />}
          />
          <Route path="/admin/school/issues" element={<Issues />} />
          <Route path="/admin/school/profile" element={<SchoolProfile />} />

          <Route
            path="/admin/state/backlog-entry"
            element={<StateBacklogEntry />}
          />
          <Route
            path="/admin/district/backlog-entry"
            element={<DistrictBacklogEntry />}
          />
          <Route
            path="/admin/block/backlog-entry"
            element={<BlockBacklogEntry />}
          />
          <Route
            path="/admin/school/backlog-entry"
            element={<SchoolBacklogEntry />}
          />

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
            path="/admin/state/requisition-window"
            element={<RequisitionWindow />}
          />
          <Route path="/admin/state/reports" element={<Reports />} />
          <Route
            path="/admin/state/state-echallan"
            element={<StateEChallan />}
          />
          <Route
            path="/admin/district/district-echallan"
            element={<DistrictEChallan />}
          />
          <Route
            path="/admin/block/block-echallan"
            element={<BlockEChallan />}
          />
          <Route
            path="/admin/state/requisition-window"
            element={<RequisitionWindow />}
          />
          <Route path="/admin/district/issues" element={<DistrictIssues />} />
          <Route
            path="/admin/school/notifications-create"
            element={<SchoolNotificationsCreate />}
          />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="/admin/private-school"
            element={<PrivateSchoolDashboard />}
          />
          <Route
            path="/admin/district/add-private-school"
            element={<CreatePrivateSchool />}
          />
          <Route path="/admin/schools" element={<SchoolList />} />
          <Route
            path="/admin/state/district-details/:districtName"
            element={<DistrictDetails />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
