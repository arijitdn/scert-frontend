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
import { useState, useEffect } from "react";
import { DatabaseService } from "@/lib/database";
import { RequisitionWithDetails, RequisitionStatus } from "@/types/database";

const BLOCK_ID = "BLOCK_001"; // This should be replaced with actual block ID from authentication

export default function BlockRequisition() {
  const [requisitions, setRequisitions] = useState<RequisitionWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});

  // Load block requisitions
  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const blockRequisitions =
        await DatabaseService.getBlockRequisitions(BLOCK_ID);
      setRequisitions(blockRequisitions);

      // Initialize remarks from existing data
      const initialRemarks: { [key: string]: string } = {};
      blockRequisitions.forEach((req) => {
        if (req.remarksByBlock) {
          initialRemarks[req.id] = req.remarksByBlock;
        }
      });
      setRemarks(initialRemarks);
    } catch (error) {
      console.error("Error loading requisitions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group requisitions by school
  const groupedRequisitions = requisitions.reduce(
    (acc, req) => {
      const schoolName = req.school?.name || "Unknown School";
      if (!acc[schoolName]) acc[schoolName] = [];
      acc[schoolName].push(req);
      return acc;
    },
    {} as { [schoolName: string]: RequisitionWithDetails[] },
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
        updates.remarksByBlock = remarks[requisitionId];
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
        remarksByBlock: remarks[requisitionId] || "",
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
      {Object.keys(groupedRequisitions).length === 0 ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              No requisitions found for your block.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedRequisitions).map(
          ([schoolName, schoolRequisitions]) => (
            <Card
              key={schoolName}
              className="w-full max-w-6xl mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300"
            >
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">
                  {schoolName}
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

                      {/* Remarks Section */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Block Remarks
                        </label>
                        <Textarea
                          value={remarks[req.id] || ""}
                          onChange={(e) =>
                            handleRemarkChange(req.id, e.target.value)
                          }
                          placeholder="Add remarks for this requisition..."
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

                      {/* Show existing district remarks if any */}
                      {req.remarksByDistrict && (
                        <div className="mb-4 p-3 bg-purple-50 rounded">
                          <span className="font-medium text-purple-800">
                            District Remarks:
                          </span>
                          <p className="text-purple-700 mt-1">
                            {req.remarksByDistrict}
                          </p>
                        </div>
                      )}

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
