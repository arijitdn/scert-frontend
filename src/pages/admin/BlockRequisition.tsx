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
import { useState } from "react";

const dummyRequisitions = [
  {
    id: 1,
    school: "HENRY DEROZIO ACADEMY",
    requisitionNumber: "REQ-001",
    items: [
      { book: "Maths for Class 3", className: "Class 3", subject: "Mathematics", quantity: 50, enrolled: 48, remark: "" },
      { book: "English Reader", className: "Class 4", subject: "English", quantity: 30, enrolled: 42, remark: "" },
    ],
    status: "Pending",
  },
  {
    id: 2,
    school: "INDRANAGAR HIGH SCHOOL",
    requisitionNumber: "REQ-002",
    items: [
      { book: "Hindi Basics", className: "Class 2", subject: "Hindi", quantity: 15, enrolled: 36, remark: "" },
      { book: "Maths for Class 4", className: "Class 4", subject: "Mathematics", quantity: 25, enrolled: 40, remark: "" },
    ],
    status: "Approved",
  },
];

function groupBySchool(requisitions) {
  return requisitions.reduce((acc, req) => {
    if (!acc[req.school]) acc[req.school] = [];
    acc[req.school].push(req);
    return acc;
  }, {});
}

export default function BlockRequisition() {
  const [requisitions, setRequisitions] = useState(dummyRequisitions);
  const [remarks, setRemarks] = useState({});

  const handleRemarkChange = (reqId, itemIdx, value) => {
    setRemarks((prev) => ({ ...prev, [`${reqId}-${itemIdx}`]: value }));
  };

  const handleAddRemark = (reqId, itemIdx) => {
    setRequisitions((prev) =>
      prev.map((req) =>
        req.id === reqId
          ? {
              ...req,
              items: req.items.map((item, idx) =>
                idx === itemIdx ? { ...item, remark: remarks[`${reqId}-${itemIdx}`] || "" } : item
              ),
            }
          : req
      )
    );
    setRemarks((prev) => ({ ...prev, [`${reqId}-${itemIdx}`]: "" }));
  };

  const grouped = groupBySchool(requisitions);

  return (
    <AdminLayout
      title="School Requisitions"
      description="View and remark on school book requisitions"
      adminLevel={null}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {Object.entries(grouped).map(([school, reqs]) => (
          <Card key={school} className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">{school}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                  <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                    <tr>
                      <th className="px-4 py-2 border-b text-left">Requisition No</th>
                      <th className="px-4 py-2 border-b text-left">Book Name</th>
                      <th className="px-4 py-2 border-b text-left">Class</th>
                      <th className="px-4 py-2 border-b text-left">Subject</th>
                      <th className="px-4 py-2 border-b text-left">Enrolled</th>
                      <th className="px-4 py-2 border-b text-left">
                        Requested
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        Action (Add Remarks)
                      </th>
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
                              {req.requisitionNumber}
                            </td>
                          )}
                          <td className="px-4 py-2 border-b">{item.book}</td>
                          <td className="px-4 py-2 border-b">{item.className}</td>
                          <td className="px-4 py-2 border-b">{item.subject}</td>
                          <td className="px-4 py-2 border-b">{item.enrolled}</td>
                          <td className="px-4 py-2 border-b">{item.quantity}</td>
                          <td className="px-4 py-2 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <Input
                                placeholder="Add remark"
                                value={remarks[`${req.id}-${itemIdx}`] || ""}
                                onChange={(e) =>
                                  handleRemarkChange(req.id, itemIdx, e.target.value)
                                }
                                className="max-w-xs"
                              />
                              <Button
                                size="sm"
                                className="bg-blue-200 text-blue-900 hover:bg-blue-300"
                                onClick={() => handleAddRemark(req.id, itemIdx)}
                                disabled={!remarks[`${req.id}-${itemIdx}`]}
                              >
                                Add Remark
                              </Button>
                              {item.remark && (
                                <span className="text-xs text-purple-700 font-semibold ml-2">
                                  Remark: {item.remark}
                                </span>
                              )}
                            </div>
                          </td>
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
    </AdminLayout>
  );
}
