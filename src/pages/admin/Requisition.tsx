import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { BookOpen, Send } from "lucide-react";

const dummyAdditionalRequisitions = [
  {
    className: "Class 5",
    subject: "Science",
    medium: "English",
    bookName: "Science Marvels",
    currentStock: 100,
    requisition: 150,
    additionalRequirement: 0,
  },
  {
    className: "Class 4",
    subject: "History",
    medium: "Bengali",
    bookName: "History of Bengal",
    currentStock: 50,
    requisition: 120,
    additionalRequirement: 0,
  },
  {
    className: "Class 6",
    subject: "Mathematics",
    medium: "Kokborok",
    bookName: "Math Magic",
    currentStock: 300,
    requisition: 200,
    additionalRequirement: 0,
  },
];

const dummyRequisitions = [
  {
    district: "Dhalai",
    requests: [
      {
        className: "Class 3",
        subject: "Mathematics",
        book: "Maths for Class 3",
        requested: 120,
        stock: 200,
        sent: 60,
      },
      {
        className: "Class 4",
        subject: "Science",
        book: "Science Explorer",
        requested: 80,
        stock: 150,
        sent: 40,
      },
    ],
  },
  {
    district: "Gomati",
    requests: [
      {
        className: "Class 5",
        subject: "English",
        book: "English Reader",
        requested: 100,
        stock: 180,
        sent: 100,
      },
      {
        className: "Class 2",
        subject: "Hindi",
        book: "Hindi Basics",
        requested: 60,
        stock: 90,
        sent: 30,
      },
    ],
  },
  {
    district: "Khowai",
    requests: [
      {
        className: "Class 3",
        subject: "Social Studies",
        book: "Our Society",
        requested: 90,
        stock: 150,
        sent: 50,
      },
    ],
  },
  {
    district: "North Tripura",
    requests: [
      {
        className: "Class 6",
        subject: "Physics",
        book: "Fundamentals of Physics",
        requested: 70,
        stock: 120,
        sent: 30,
      },
    ],
  },
  {
    district: "Sepahijala",
    requests: [
      {
        className: "Class 7",
        subject: "Chemistry",
        book: "Basic Chemistry",
        requested: 80,
        stock: 130,
        sent: 40,
      },
    ],
  },
  {
    district: "South Tripura",
    requests: [
      {
        className: "Class 8",
        subject: "Biology",
        book: "Life Sciences",
        requested: 90,
        stock: 140,
        sent: 50,
      },
    ],
  },
  {
    district: "Unakoti",
    requests: [
      {
        className: "Class 9",
        subject: "Computer Science",
        book: "Introduction to Computers",
        requested: 60,
        stock: 100,
        sent: 20,
      },
    ],
  },
  {
    district: "West Tripura",
    requests: [
      {
        className: "Class 10",
        subject: "Economics",
        book: "Principles of Economics",
        requested: 70,
        stock: 110,
        sent: 30,
      },
    ],
  },
];

export default function Requisition() {
  const [requisitions, setRequisitions] = useState(dummyRequisitions);
  const [additionalRequisitions, setAdditionalRequisitions] = useState(
    dummyAdditionalRequisitions,
  );
  const [batchInputs, setBatchInputs] = useState({});

  const handleAdditionalRequirementChange = (index, value) => {
    const percentage = parseInt(value, 10);
    setAdditionalRequisitions((prev) =>
      prev.map((req, i) => {
        if (i === index) {
          return {
            ...req,
            additionalRequirement: percentage,
          };
        }
        return req;
      }),
    );
  };

  const handleBatchInput = (districtIdx, reqIdx, value) => {
    setBatchInputs((prev) => ({
      ...prev,
      [`${districtIdx}-${reqIdx}`]: value,
    }));
  };

  const handleSendBatch = (districtIdx, reqIdx) => {
    setRequisitions((prev) =>
      prev.map((district, dIdx) => {
        if (dIdx !== districtIdx) return district;
        const req = district.requests[reqIdx];
        const key = `${districtIdx}-${reqIdx}`;
        const maxSend = Math.min(req.requested - req.sent, req.stock);
        let toSend = parseInt(batchInputs[key] || "0", 10);
        if (isNaN(toSend) || toSend <= 0) toSend = 0;
        if (toSend > maxSend) toSend = maxSend;
        const updatedRequests = district.requests.map((r, idx) =>
          idx === reqIdx
            ? { ...r, sent: r.sent + toSend, stock: r.stock - toSend }
            : r,
        );
        return { ...district, requests: updatedRequests };
      }),
    );
    setBatchInputs((prev) => ({ ...prev, [`${districtIdx}-${reqIdx}`]: "" }));
  };

  const handleDownloadPdf = () => {
    const input = document.getElementById('work-order-table');
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; 
        const pageHeight = 297;  
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save('work-order.pdf');
      });
    }
  };

  return (
    <AdminLayout
      title="Requisition Management"
      description="Approve and fulfill book requests from districts"
      adminLevel="STATE ADMIN"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">Work Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto" id="work-order-table">
              <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                  <tr>
                    <th className="px-4 py-2 border-b text-left">Class</th>
                    <th className="px-4 py-2 border-b text-left">Subject</th>
                    <th className="px-4 py-2 border-b text-left">Medium</th>
                    <th className="px-4 py-2 border-b text-left">Book Name</th>
                    <th className="px-4 py-2 border-b text-left">
                      Current Stock
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Requisition
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Calculated Requisition
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Additional Requirement
                    </th>
                    <th className="px-4 py-2 border-b text-left">
                      Actual Requisition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {additionalRequisitions.map((req, index) => {
                    const booksNeeded = Math.max(
                      0,
                      req.requisition - req.currentStock,
                    );
                    const actualRequisition =
                      booksNeeded +
                      Math.round(
                        booksNeeded * (req.additionalRequirement / 100),
                      );
                    return (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0
                            ? "bg-white hover:bg-blue-50 transition"
                            : "bg-blue-50 hover:bg-blue-100 transition"
                        }
                      >
                        <td className="px-4 py-2 border-b">{req.className}</td>
                        <td className="px-4 py-2 border-b">{req.subject}</td>
                        <td className="px-4 py-2 border-b">{req.medium}</td>
                        <td className="px-4 py-2 border-b">{req.bookName}</td>
                        <td className="px-4 py-2 border-b">
                          {req.currentStock}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {req.requisition}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {Math.max(0, req.requisition - req.currentStock)}
                        </td>
                        <td className="px-4 py-2 border-b">
                          <div className="flex items-center gap-2">
                            <Select
                              onValueChange={(value) =>
                                handleAdditionalRequirementChange(index, value)
                              }
                              value={req.additionalRequirement.toString()}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select %" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(16)].map((_, i) => (
                                  <SelectItem key={i} value={`${i}`}>
                                    {i}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="px-4 py-2 border-b font-semibold">
                          {actualRequisition}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-4">
          <Button onClick={handleDownloadPdf}>
            Save and Download Work Order (PDF)
          </Button>
        </div>

        {requisitions.map((district, districtIdx) => (
          <Card key={district.district} className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">
                {district.district}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl shadow border-separate border-spacing-0">
                  <thead className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900">
                    <tr>
                      <th className="px-4 py-2 border-b text-left">Class</th>
                      <th className="px-4 py-2 border-b text-left">Subject</th>
                      <th className="px-4 py-2 border-b text-left">
                        Book Name
                      </th>
                      <th className="px-4 py-2 border-b text-left">
                        Requested
                      </th>
                      <th className="px-4 py-2 border-b text-left">Stock</th>
                      <th className="px-4 py-2 border-b text-left">Sent</th>
                      <th className="px-4 py-2 border-b text-left">Status</th>
                      <th className="px-4 py-2 border-b text-left">
                        Send Installment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {district.requests.map((req, reqIdx) => {
                      const key = `${districtIdx}-${reqIdx}`;
                      const maxSend = Math.min(
                        req.requested - req.sent,
                        req.stock,
                      );
                      const percent = Math.round(
                        (req.sent / req.requested) * 100,
                      );
                      const fulfilled = req.sent >= req.requested;
                      return (
                        <tr
                          key={req.book}
                          className={
                            reqIdx % 2 === 0
                              ? "bg-white hover:bg-blue-50 transition"
                              : "bg-blue-50 hover:bg-blue-100 transition"
                          }
                        >
                          <td className="px-4 py-2 border-b">
                            {req.className}
                          </td>
                          <td className="px-4 py-2 border-b">{req.subject}</td>
                          <td className="px-4 py-2 border-b">{req.book}</td>
                          <td className="px-4 py-2 border-b">
                            {req.requested}
                          </td>
                          <td className="px-4 py-2 border-b">{req.stock}</td>
                          <td className="px-4 py-2 border-b">{req.sent}</td>
                          <td className="px-4 py-2 border-b w-48">
                            <div className="flex flex-col gap-1">
                              <Progress value={percent} className="h-2" />
                              <span className="text-xs text-gray-600">
                                {percent}% sent
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b">
                            {!fulfilled && (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={1}
                                  max={maxSend}
                                  value={batchInputs[key] || ""}
                                  onChange={(e) =>
                                    handleBatchInput(
                                      districtIdx,
                                      reqIdx,
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 h-8 text-sm"
                                  placeholder={`Max ${maxSend}`}
                                  disabled={req.stock === 0}
                                />
                                <Button
                                  size="sm"
                                  className="bg-blue-200 text-blue-900 hover:bg-blue-300"
                                  onClick={() =>
                                    handleSendBatch(districtIdx, reqIdx)
                                  }
                                  disabled={
                                    req.stock === 0 ||
                                    !batchInputs[key] ||
                                    parseInt(batchInputs[key], 10) <= 0
                                  }
                                >
                                  <Send className="h-4 w-4 mr-1" /> Send
                                </Button>
                              </div>
                            )}
                            {fulfilled && (
                              <span className="text-xs text-green-700 font-semibold">
                                Complete
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
