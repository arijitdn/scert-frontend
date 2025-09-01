import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { requisitionsAPI, schoolsAPI } from "@/lib/api";
import type { Requisition, School } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useRequisitionWindow } from "@/hooks/useRequisitionWindow";
import { RequisitionWindowStatus } from "@/components/RequisitionWindowStatus";

const block_code = "160101"; // Block code for the authenticated block admin

export default function BlockRequisition() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  // Requisition window status
  const windowStatus = useRequisitionWindow("BLOCK");

  // Load block requisitions
  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const blockRequisitionsResponse =
        await requisitionsAPI.getByBlock(block_code);
      const blockRequisitions: Requisition[] =
        blockRequisitionsResponse.data.data;
      setRequisitions(blockRequisitions);

      // Since requisitions include school data, we don't need to fetch schools separately
      // But let's still fetch them for completeness in case we need them elsewhere
      try {
        const schoolsResponse = await schoolsAPI.getAll();
        const allSchools: School[] = schoolsResponse.data.data;
        const blockSchools = allSchools.filter(
          (school) => school.block_code === block_code,
        );
        setSchools(blockSchools);
      } catch (schoolError) {
        console.warn("Could not fetch schools separately:", schoolError);
        // This is okay since requisitions include school data
      }

      // Initialize remarks from existing data
      const initialRemarks: { [key: string]: string } = {};
      blockRequisitions.forEach((req) => {
        initialRemarks[req.id] = req.remarksByBlock || "";
      });
      setRemarks(initialRemarks);
    } catch (error) {
      console.error("Error loading requisitions:", error);
      toast({
        title: "Error",
        description: "Failed to load requisitions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get school name from requisition
  const getSchoolName = (requisition: Requisition) => {
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

  // Helper function to get school UDISE from requisition
  const getSchoolUdise = (requisition: Requisition) => {
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

  // Helper function to get school info from requisition (preferred method)
  const getSchoolInfo = (req: Requisition) => {
    // If the requisition includes the school relationship, use it
    if (req.school) {
      return {
        name: req.school.name,
        udise: req.school.udise,
      };
    }
    // Otherwise, find the school from our loaded schools array
    const school = schools.find((s) => s.id === req.schoolId);
    if (school) {
      return {
        name: school.name,
        udise: school.udise,
      };
    }
    // Final fallback
    return {
      name: `School ID: ${req.schoolId}`,
      udise: req.schoolId,
    };
  };

  // Filter requisitions by status
  const pendingRequisitions = requisitions.filter(
    (req) => req.status === "PENDING_BLOCK_APPROVAL",
  );
  const approvedRequisitions = requisitions.filter(
    (req) => req.status === "PENDING_DISTRICT_APPROVAL",
  );

  // Group requisitions by school ID
  const groupRequisitionsBySchool = (reqs: Requisition[]) => {
    return reqs.reduce(
      (acc, req) => {
        const schoolId = req.schoolId || "Unknown School";
        if (!acc[schoolId]) acc[schoolId] = [];
        acc[schoolId].push(req);
        return acc;
      },
      {} as { [schoolId: string]: Requisition[] },
    );
  };

  // Handle sending remarks
  const handleSendRemark = async (requisitionId: string) => {
    try {
      // Validate that remarks are provided
      if (!remarks[requisitionId] || remarks[requisitionId].trim() === "") {
        toast({
          title: "Validation Error",
          description: "Please add remarks before sending.",
          variant: "destructive",
        });
        return;
      }

      setUpdating((prev) => ({ ...prev, [requisitionId]: true }));

      const requisition = requisitions.find((req) => req.id === requisitionId);
      if (!requisition) {
        throw new Error("Requisition not found");
      }

      // Update both remarks and status to approve by block
      await requisitionsAPI.update(requisitionId, {
        remarksByBlock: remarks[requisitionId].trim(),
        status: "PENDING_DISTRICT_APPROVAL",
      });

      toast({
        title: "Success",
        description: "Requisition remarked by block successfully",
      });

      // Reload requisitions to get updated data
      await loadRequisitions();
    } catch (error) {
      console.error("Error sending remarks:", error);
      toast({
        title: "Error",
        description: "Error sending remarks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [requisitionId]: false }));
    }
  };

  // Handle remark change
  const handleRemarkChange = (requisitionId: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [requisitionId]: value }));
  };

  // Render requisition card
  const renderRequisitionCard = (req: Requisition) => {
    const schoolInfo = getSchoolInfo(req);
    return (
      <div key={req.id} className="border rounded-lg bg-white p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-semibold text-lg">Requisition {req.reqId}</h4>
            <p className="text-sm text-gray-600">School: {schoolInfo.name}</p>
            <p className="text-sm text-gray-600">UDISE: {schoolInfo.udise}</p>
            <p className="text-sm text-gray-600">
              Submitted:{" "}
              {req.createdAt
                ? new Date(req.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <Badge
            variant={
              req.status === "PENDING_DISTRICT_APPROVAL"
                ? "default"
                : req.status === "COMPLETED"
                  ? "default"
                  : "secondary"
            }
          >
            {req.status === "PENDING_BLOCK_APPROVAL" && (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </>
            )}
            {req.status === "PENDING_DISTRICT_APPROVAL" && (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Remarked by Block
              </>
            )}
            {req.status === "COMPLETED" && (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </>
            )}
          </Badge>
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

        {/* Remarks Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Block Remarks{" "}
            {req.status === "PENDING_BLOCK_APPROVAL" && (
              <span className="text-red-500">*</span>
            )}
          </label>

          {req.status === "PENDING_BLOCK_APPROVAL" ? (
            <Textarea
              value={remarks[req.id] || req.remarksByBlock || ""}
              onChange={(e) => handleRemarkChange(req.id, e.target.value)}
              placeholder="Add remarks for this requisition... (Required for approval)"
              className="mb-2"
              disabled={updating[req.id] || !windowStatus.isOpen}
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-gray-700">
                {req.remarksByBlock || "No remarks provided"}
              </p>
            </div>
          )}
        </div>

        {/* Show existing district remarks if any */}
        {req.remarksByDistrict && (
          <div className="mb-4 p-3 bg-purple-50 rounded">
            <span className="font-medium text-purple-800">
              District Remarks:
            </span>
            <p className="text-purple-700 mt-1">{req.remarksByDistrict}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {req.status === "PENDING_BLOCK_APPROVAL" && (
            <Button
              onClick={() => handleSendRemark(req.id)}
              disabled={updating[req.id] || !windowStatus.isOpen}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating[req.id] ? (
                "Sending..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {!windowStatus.isOpen ? "Disabled" : "Send Remark"}
                </>
              )}
            </Button>
          )}

          {req.status === "COMPLETED" && (
            <span className="text-green-600 font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Delivered
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout
        title="Block Requisition Management"
        description="Review and approve requisitions from schools in your block"
        adminLevel="BLOCK ADMIN"
      >
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Block Requisition Management"
      description="Review and approve requisitions from schools in your block"
      adminLevel="BLOCK ADMIN"
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
              Block requisition actions are currently disabled
            </p>
            <p className="text-sm text-gray-500 mt-1">
              You can view requisitions but cannot approve or reject them
              outside the active window.
            </p>
          </div>
        )}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingRequisitions.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedRequisitions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequisitions.length === 0 ? (
            <Card className="w-full max-w-4xl mx-auto">
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No pending requisitions found for your block.
                </p>
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
                <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No approved requisitions found for your block.
                </p>
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
      </Tabs>
    </AdminLayout>
  );
}
