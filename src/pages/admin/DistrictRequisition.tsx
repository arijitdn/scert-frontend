import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

const dummyRequisitions = [
  {
    id: 1,
    block: "Mohanpur",
    school: "Umakanta Academy",
    isName: "IS Mohanpur",
    requisitionNumber: "REQ-001",
    items: [
      { book: "Maths for Class 3", className: "Class 3", subject: "Mathematics", enrolled: 52, requested: 50, remark: "Urgent requirement" },
      { book: "English Reader", className: "Class 4", subject: "English", enrolled: 47, requested: 30, remark: "" },
    ],
    status: "Pending",
  },
  {
    id: 2,
    block: "Mohanpur",
    school: "Mohanpur High School",
    isName: "IS Mohanpur",
    requisitionNumber: "REQ-002",
    items: [
      { book: "Science Explorer", className: "Class 5", subject: "Science", enrolled: 41, requested: 20, remark: "First priority" },
      { book: "Hindi Basics", className: "Class 2", subject: "Hindi", enrolled: 39, requested: 15, remark: "" },
    ],
    status: "Pending",
  },
  {
    id: 3,
    block: "Mohanpur",
    school: "Mohanpur Primary School",
    isName: "IS Mohanpur",
    requisitionNumber: "REQ-003",
    items: [
      { book: "Social Studies", className: "Class 6", subject: "Social Studies", enrolled: 60, requested: 55, remark: "New curriculum" },
    ],
    status: "Pending",
  },
  {
    id: 4,
    block: "Dhukli",
    school: "Dhukli High School",
    isName: "IS Dhukli",
    requisitionNumber: "REQ-004",
    items: [
      { book: "Art & Craft", className: "Class 1", subject: "Art", enrolled: 25, requested: 20, remark: "" },
      { book: "General Knowledge", className: "Class 3", subject: "GK", enrolled: 30, requested: 28, remark: "" },
    ],
    status: "Approved",
  },
  {
    id: 5,
    block: "Dhukli",
    school: "Dhukli Secondary School",
    isName: "IS Dhukli",
    requisitionNumber: "REQ-005",
    items: [
      { book: "Physics", className: "Class 10", subject: "Science", enrolled: 70, requested: 65, remark: "" },
    ],
    status: "Pending",
  },
];

function groupByBlock(requisitions) {
  return requisitions.reduce((acc, req) => {
    if (!acc[req.block]) acc[req.block] = [];
    acc[req.block].push(req);
    return acc;
  }, {});
}

export default function DistrictRequisition() {
  const [requisitions, setRequisitions] = useState(dummyRequisitions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReqId, setCurrentReqId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  const openModal = (reqId: number, type: "approve" | "reject") => {
    setCurrentReqId(reqId);
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (currentReqId === null || !actionType) return;

    setRequisitions((prev) =>
      prev.map((req) =>
        req.id === currentReqId
          ? { ...req, status: actionType === "approve" ? "Approved" : "Rejected", districtRemark: reason }
          : req
      )
    );
    setIsModalOpen(false);
    setCurrentReqId(null);
    setActionType(null);
    setReason("");
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setCurrentReqId(null);
    setActionType(null);
    setReason("");
  };

  const grouped = groupByBlock(requisitions);

  return (
    <AdminLayout
      title="Block Requisitions"
      description="View and approve/reject block book requisitions"
      adminLevel="DISTRICT EDUCATION OFFICER"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {Object.entries(grouped).map(([block, reqs]) => (
          <Card key={block} className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">{block}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                  <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                    <tr>
                      <th className="px-4 py-2 border-b text-left">Requisition Details</th>
                      <th className="px-4 py-2 border-b text-left">Book Name</th>
                      <th className="px-4 py-2 border-b text-left">Class</th>
                      <th className="px-4 py-2 border-b text-left">Subject</th>
                      <th className="px-4 py-2 border-b text-left">Enrolled</th>
                      <th className="px-4 py-2 border-b text-left">
                        Requested
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        Remarks by Block
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        Remarks by District
                      </th>
                      <th className="px-4 py-2 border-b text-left">Status</th>
                      <th className="px-4 py-2 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reqs.map((req) => (
                      req.items.map((item, itemIdx) => (
                        <tr
                          key={`${req.id}-${itemIdx}`}
                          className={
                            itemIdx % 2 === 0
                              ? "bg-white hover:bg-blue-50 transition"
                              : "bg-blue-50 hover:bg-blue-100 transition"
                          }
                        >
                          {itemIdx === 0 && (
                            <td
                              rowSpan={req.items.length}
                              className="px-4 py-2 border-b align-top"
                            >
                              <p className="font-semibold">{req.requisitionNumber}</p>
                              <p className="text-xs text-gray-600">{req.school}</p>
                              <p className="text-xs text-gray-600">{req.isName}</p>
                            </td>
                          )}
                          <td className="px-4 py-2 border-b">{item.book}</td>
                          <td className="px-4 py-2 border-b">{item.className}</td>
                          <td className="px-4 py-2 border-b">{item.subject}</td>
                          <td className="px-4 py-2 border-b">{item.enrolled}</td>
                          <td className="px-4 py-2 border-b">{item.requested}</td>
                          <td className="px-4 py-2 border-b">{item.remark}</td>
                          <td className="px-4 py-2 border-b">{req.districtRemark}</td>
                          {itemIdx === 0 && (
                            <td
                              rowSpan={req.items.length}
                              className="px-4 py-2 border-b align-top"
                            >
                              {req.status}
                            </td>
                          )}
                          {itemIdx === 0 && (
                            <td
                              rowSpan={req.items.length}
                              className="px-4 py-2 border-b align-top"
                            >
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-200 text-green-900 hover:bg-green-300"
                                  onClick={() => openModal(req.id, "approve")}
                                  disabled={req.status !== "Pending"}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-200 text-red-900 hover:bg-red-300"
                                  onClick={() => openModal(req.id, "reject")}
                                  disabled={req.status !== "Pending"}
                                >
                                  Reject
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionType === "approve" ? "Approve" : "Reject"} Requisition</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={!reason}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
