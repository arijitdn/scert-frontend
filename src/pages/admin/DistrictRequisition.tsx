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
import { useState, useEffect } from "react";
import { DatabaseService } from "@/lib/database";
import { RequisitionWithDetails, RequisitionStatus } from "@/types/database";

const DISTRICT_ID = "DISTRICT_001"; // This should be replaced with actual district ID from authentication

export default function DistrictRequisition() {
  const [requisitions, setRequisitions] = useState<RequisitionWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});

  // Load district requisitions
  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const districtRequisitions =
        await DatabaseService.getDistrictRequisitions(DISTRICT_ID);
      setRequisitions(districtRequisitions);

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

  // Group requisitions by school and block
  const groupedRequisitions = requisitions.reduce(
    (acc, req) => {
      const schoolName = req.school?.name || "Unknown School";
      const blockId = req.school?.block_id || "Unknown Block";
      const key = `${blockId}-${schoolName}`;

      if (!acc[key]) acc[key] = { blockId, schoolName, requisitions: [] };
      acc[key].requisitions.push(req);
      return acc;
    },
    {} as {
      [key: string]: {
        blockId: string;
        schoolName: string;
        requisitions: RequisitionWithDetails[];
      };
    },
  );

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

      await DatabaseService.updateRequisition(requisitionId, updates);

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

      await DatabaseService.updateRequisition(requisitionId, {
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
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
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
      {Object.keys(groupedRequisitions).length === 0 ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              No requisitions found for your district.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.values(groupedRequisitions).map(
          ({ blockId, schoolName, requisitions: schoolRequisitions }) => (
            <Card
              key={`${blockId}-${schoolName}`}
              className="w-full max-w-6xl mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-50 border-purple-300"
            >
              <CardHeader>
                <CardTitle className="text-lg text-purple-900">
                  {schoolName}{" "}
                  <span className="text-sm text-purple-600">({blockId})</span>
                </CardTitle>
                <CardDescription>
                  {schoolRequisitions.length} requisition(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schoolRequisitions.map((req) => (
                    <div
                      key={req.id}
                      className="border rounded-lg bg-white p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">
                            Requisition {req.reqId}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Submitted:{" "}
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            req.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : req.status === "APPROVED"
                                ? "bg-blue-100 text-blue-800"
                                : req.status === "REJECTED"
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
                          <span className="font-medium text-blue-800">
                            Block Remarks:
                          </span>
                          <p className="text-blue-700 mt-1">
                            {req.remarksByBlock}
                          </p>
                        </div>
                      )}

                      {/* District Remarks Section */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          District Remarks
                        </label>
                        <Textarea
                          value={remarks[req.id] || ""}
                          onChange={(e) =>
                            handleRemarkChange(req.id, e.target.value)
                          }
                          placeholder="Add district remarks for this requisition..."
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
                        {req.status === "PENDING" && (
                          <>
                            <Button
                              onClick={() =>
                                handleStatusUpdate(req.id, "APPROVED")
                              }
                              disabled={updating[req.id]}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updating[req.id] ? "Updating..." : "Approve"}
                            </Button>
                            <Button
                              onClick={() =>
                                handleStatusUpdate(req.id, "REJECTED")
                              }
                              disabled={updating[req.id]}
                              variant="destructive"
                            >
                              {updating[req.id] ? "Updating..." : "Reject"}
                            </Button>
                          </>
                        )}

                        {req.status === "APPROVED" && (
                          <>
                            <Button
                              onClick={() =>
                                handleStatusUpdate(req.id, "COMPLETED")
                              }
                              disabled={updating[req.id]}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {updating[req.id]
                                ? "Updating..."
                                : "Mark as Delivered"}
                            </Button>
                            <Button
                              onClick={() =>
                                handleStatusUpdate(req.id, "REJECTED")
                              }
                              disabled={updating[req.id]}
                              variant="destructive"
                            >
                              {updating[req.id] ? "Updating..." : "Reject"}
                            </Button>
                          </>
                        )}

                        {req.status === "REJECTED" && (
                          <Button
                            onClick={() =>
                              handleStatusUpdate(req.id, "APPROVED")
                            }
                            disabled={updating[req.id]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updating[req.id] ? "Updating..." : "Re-approve"}
                          </Button>
                        )}

                        {req.status === "COMPLETED" && (
                          <span className="text-green-600 font-medium">
                            ✓ Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ),
        )
      )}
    </AdminLayout>
  );
}
