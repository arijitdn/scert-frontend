import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { requisitionsAPI, schoolsAPI } from "@/lib/api";
import type {
  Requisition,
  RequisitionWithDetails,
  RequisitionStatus,
  School,
} from "@/types/database";
import { useRequisitionWindow } from "@/hooks/useRequisitionWindow";
import { RequisitionWindowStatus } from "@/components/RequisitionWindowStatus";

const DISTRICT_ID = "1601"; // District code extracted from school ID pattern

export default function DistrictRequisition() {
  const [requisitions, setRequisitions] = useState<RequisitionWithDetails[]>(
    [],
  );
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState("pending");

  // Requisition window status
  const windowStatus = useRequisitionWindow("DISTRICT");

  // Load district requisitions
  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);

      // Fetch all requisitions and filter by district
      const requisitionsResponse = await requisitionsAPI.getAll();
      const allRequisitions: Requisition[] = requisitionsResponse.data.data;

      // Filter requisitions for this district based on school UDISE codes
      // Since requisitions include school data, use that for filtering
      const districtRequisitions = allRequisitions.filter((req) =>
        req.school?.udise?.startsWith(DISTRICT_ID),
      );
      setRequisitions(districtRequisitions);

      // Since requisitions include school data, we don't need to fetch schools separately
      // But let's still fetch them for completeness in case we need them elsewhere
      try {
        const schoolsResponse = await schoolsAPI.getAll();
        const allSchools: School[] = schoolsResponse.data.data;
        // Filter schools by district UDISE prefix
        const districtSchools = allSchools.filter((school) =>
          school.udise?.startsWith(DISTRICT_ID),
        );
        setSchools(districtSchools);
      } catch (schoolError) {
        console.warn("Could not fetch schools separately:", schoolError);
        // This is okay since requisitions include school data
      }

      // Initialize remarks from existing data
      const initialRemarks: { [key: string]: string } = {};
      districtRequisitions.forEach((req) => {
        if (req.remarksByDistrict) {
          initialRemarks[req.id] = req.remarksByDistrict;
        }
      });
      setRemarks(initialRemarks);
    } catch (error) {
      console.error("Error loading requisitions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get school info from requisition
  const getSchoolInfo = (requisition: Requisition) => {
    // First check if school is included in the requisition (which it should be)
    if (requisition.school) {
      return {
        name:
          requisition.school.name ||
          `School UDISE: ${requisition.school.udise}`,
        blockId: requisition.school.block_code || "Unknown Block",
        udise: requisition.school.udise?.toString() || "Unknown UDISE",
      };
    }

    // Fallback to finding school by schoolId in our schools list
    const school = schools.find((s) => s.id === requisition.schoolId);
    if (school) {
      return {
        name: school.name || `School UDISE: ${school.udise}`,
        blockId: school.block_code || "Unknown Block",
        udise: school.udise?.toString() || "Unknown UDISE",
      };
    }

    // Last resort
    return {
      name: `School ID: ${requisition.schoolId}`,
      blockId: "Unknown Block",
      udise: `ID: ${requisition.schoolId}`,
    };
  };

  // Group requisitions by school and block
  const groupedRequisitions = requisitions.reduce(
    (acc, req) => {
      const schoolInfo = getSchoolInfo(req);
      const key = `${schoolInfo.blockId}-${schoolInfo.name}`;

      if (!acc[key])
        acc[key] = {
          blockId: schoolInfo.blockId,
          schoolName: schoolInfo.name,
          schoolUdise: schoolInfo.udise,
          requisitions: [],
        };
      acc[key].requisitions.push(req);
      return acc;
    },
    {} as {
      [key: string]: {
        blockId: string;
        schoolName: string;
        schoolUdise: string;
        requisitions: RequisitionWithDetails[];
      };
    },
  );

  // Filter requisitions by status for tabs
  const pendingRequisitions = requisitions.filter(
    (req) => req.status === "PENDING_DISTRICT_APPROVAL",
  );
  const approvedRequisitions = requisitions.filter(
    (req) => req.status === "APPROVED",
  );
  const rejectedRequisitions = requisitions.filter(
    (req) => req.status === "REJECTED_BY_DISTRICT",
  );

  // Helper function to group requisitions by school for tabs
  const groupRequisitionsBySchool = (reqs: RequisitionWithDetails[]) => {
    return reqs.reduce(
      (acc, req) => {
        const schoolId = req.schoolId;
        if (!acc[schoolId]) {
          acc[schoolId] = [];
        }
        acc[schoolId].push(req);
        return acc;
      },
      {} as { [schoolId: string]: RequisitionWithDetails[] },
    );
  };

  // Helper functions to get school name and UDISE from requisition
  const getSchoolName = (requisition: RequisitionWithDetails) => {
    // First check if school is included in the requisition (which it should be)
    if (requisition.school && requisition.school.name) {
      return requisition.school.name;
    }

    // Fallback to finding school by schoolId in our schools list
    const school = schools.find((s) => s.id === requisition.schoolId);
    if (school && school.name) {
      return school.name;
    }

    return `School ID: ${requisition.schoolId}`;
  };

  const getSchoolUdise = (requisition: RequisitionWithDetails) => {
    // First check if school is included in the requisition (which it should be)
    if (requisition.school && requisition.school.udise) {
      return requisition.school.udise.toString();
    }

    // Fallback to finding school by schoolId in our schools list
    const school = schools.find((s) => s.id === requisition.schoolId);
    if (school && school.udise) {
      return school.udise.toString();
    }

    // Last resort - show the schoolId but clearly marked
    return `ID: ${requisition.schoolId}`;
  };

  // Render requisition card
  const renderRequisitionCard = (req: RequisitionWithDetails) => {
    return (
      <div key={req.id} className="border rounded-lg bg-white p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-semibold text-lg">Requisition {req.reqId}</h4>
            <p className="text-sm text-gray-600">
              Submitted:{" "}
              {req.createdAt
                ? new Date(req.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              req.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : req.status === "PENDING_DISTRICT_APPROVAL"
                  ? "bg-blue-100 text-blue-800"
                  : req.status === "REJECTED_BY_DISTRICT"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {req.status}
          </span>
        </div>

        {/* Book Details */}
        <div className="bg-gray-50 p-3 rounded mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Book:</span>
              <br />
              {req.book?.title || "Unknown Book"}
            </div>
            <div>
              <span className="font-medium">Class:</span>
              <br />
              {req.book?.class || "N/A"}
            </div>
            <div>
              <span className="font-medium">Subject:</span>
              <br />
              {req.book?.subject || "N/A"}
            </div>
            <div>
              <span className="font-medium">Quantity:</span>
              <br />
              {req.quantity} books
            </div>
          </div>
        </div>

        {/* Block Remarks */}
        {req.remarksByBlock && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <span className="font-medium text-blue-800">Block Remarks:</span>
            <p className="text-blue-700 mt-1">{req.remarksByBlock}</p>
          </div>
        )}

        {/* District Remarks Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            District Remarks
          </label>
          <Textarea
            value={remarks[req.id] || req.remarksByDistrict || ""}
            onChange={(e) => handleRemarkChange(req.id, e.target.value)}
            placeholder="Add district remarks for this requisition... (Required for approval)"
            className="mb-2"
            disabled={updating[req.id]}
          />
          <Button
            onClick={() => handleSaveRemark(req.id)}
            variant="outline"
            size="sm"
            disabled={updating[req.id]}
          >
            Save Remark
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {req.status === "PENDING_DISTRICT_APPROVAL" && (
            <>
              <Button
                onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                disabled={updating[req.id] || !windowStatus.isOpen}
                className="bg-green-600 hover:bg-green-700"
              >
                {updating[req.id] ? "Updating..." : "Approve"}
              </Button>
              <Button
                onClick={() =>
                  handleStatusUpdate(req.id, "REJECTED_BY_DISTRICT")
                }
                disabled={updating[req.id] || !windowStatus.isOpen}
                variant="destructive"
              >
                {updating[req.id] ? "Updating..." : "Reject"}
              </Button>
            </>
          )}

          {req.status === "REJECTED_BY_DISTRICT" && (
            <Button
              onClick={() => handleStatusUpdate(req.id, "APPROVED")}
              disabled={updating[req.id] || !windowStatus.isOpen}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating[req.id] ? "Updating..." : "Re-approve"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Handle status update
  const handleStatusUpdate = async (
    requisitionId: string,
    newStatus: RequisitionStatus,
  ) => {
    try {
      setUpdating((prev) => ({ ...prev, [requisitionId]: true }));

      const updates: Partial<any> = { status: newStatus };
      if (remarks[requisitionId]) {
        updates.remarksByDistrict = remarks[requisitionId];
      }

      await requisitionsAPI.update(requisitionId, updates);

      // Reload requisitions to get updated data
      await loadRequisitions();
    } catch (error) {
      console.error("Error updating requisition:", error);
      alert("Error updating requisition. Please try again.");
    } finally {
      setUpdating((prev) => ({ ...prev, [requisitionId]: false }));
    }
  };

  // Handle remark change
  const handleRemarkChange = (requisitionId: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [requisitionId]: value }));
  };

  // Save remark without changing status
  const handleSaveRemark = async (requisitionId: string) => {
    try {
      setUpdating((prev) => ({ ...prev, [requisitionId]: true }));

      await requisitionsAPI.update(requisitionId, {
        remarksByDistrict: remarks[requisitionId] || "",
      });

      alert("Remark saved successfully!");
    } catch (error) {
      console.error("Error saving remark:", error);
      alert("Error saving remark. Please try again.");
    } finally {
      setUpdating((prev) => ({ ...prev, [requisitionId]: false }));
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="District Requisition Management"
        description="Review and approve requisitions from all schools in your district"
        adminLevel="DISTRICT ADMIN"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="District Requisition Management"
      description="Review and approve requisitions from all schools in your district"
      adminLevel="DISTRICT ADMIN"
    >
      {/* Requisition Window Status */}
      <RequisitionWindowStatus
        isOpen={windowStatus.isOpen}
        hasStarted={windowStatus.hasStarted}
        hasEnded={windowStatus.hasEnded}
        startDate={windowStatus.startDate}
        endDate={windowStatus.endDate}
        message={windowStatus.message}
        loading={windowStatus.loading}
        error={windowStatus.error}
        className="mb-6"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!windowStatus.isOpen && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
            <p className="text-gray-600 font-medium">
              District requisition actions are currently disabled
            </p>
            <p className="text-sm text-gray-500 mt-1">
              You can view requisitions but cannot approve or reject them
              outside the active window.
            </p>
          </div>
        )}
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Pending ({pendingRequisitions.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved ({approvedRequisitions.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejected ({rejectedRequisitions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequisitions.length === 0 ? (
            <Card className="w-full max-w-4xl mx-auto">
              <CardContent className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-500">No pending requisitions found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                groupRequisitionsBySchool(pendingRequisitions),
              ).map(([schoolId, schoolRequisitions]) => {
                // Get the first requisition to extract school information
                const firstRequisition = schoolRequisitions[0];
                return (
                  <Card
                    key={schoolId}
                    className="w-full max-w-6xl mx-auto bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-yellow-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {getSchoolName(firstRequisition)}
                      </CardTitle>
                      <CardDescription>
                        {schoolRequisitions.length} pending requisition(s) •
                        UDISE: {getSchoolUdise(firstRequisition)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {schoolRequisitions.map(renderRequisitionCard)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedRequisitions.length === 0 ? (
            <Card className="w-full max-w-4xl mx-auto">
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No approved requisitions found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                groupRequisitionsBySchool(approvedRequisitions),
              ).map(([schoolId, schoolRequisitions]) => {
                // Get the first requisition to extract school information
                const firstRequisition = schoolRequisitions[0];
                return (
                  <Card
                    key={schoolId}
                    className="w-full max-w-6xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {getSchoolName(firstRequisition)}
                      </CardTitle>
                      <CardDescription>
                        {schoolRequisitions.length} approved requisition(s) •
                        UDISE: {getSchoolUdise(firstRequisition)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {schoolRequisitions.map(renderRequisitionCard)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedRequisitions.length === 0 ? (
            <Card className="w-full max-w-4xl mx-auto">
              <CardContent className="text-center py-8">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-500">No rejected requisitions found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                groupRequisitionsBySchool(rejectedRequisitions),
              ).map(([schoolId, schoolRequisitions]) => {
                // Get the first requisition to extract school information
                const firstRequisition = schoolRequisitions[0];
                return (
                  <Card
                    key={schoolId}
                    className="w-full max-w-6xl mx-auto bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        {getSchoolName(firstRequisition)}
                      </CardTitle>
                      <CardDescription>
                        {schoolRequisitions.length} rejected requisition(s) •
                        UDISE: {getSchoolUdise(firstRequisition)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {schoolRequisitions.map(renderRequisitionCard)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
