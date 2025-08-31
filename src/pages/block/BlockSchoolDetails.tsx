import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Users, Home, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BlockSchoolDetails() {
  const navigate = useNavigate();

  const school = {
    name: "Umakanta Academy",
    udise: "27270100101",
    principal: "Mrs. Sunita Sharma",
    students: 850,
    address: "Agartala, West Tripura",
  };

  const requisition = {
    id: "REQ-2024-03-12-001",
    date: "March 12, 2024",
    status: "Pending",
    items: [
      { title: "Mathematics Class 9", quantity: 150 },
      { title: "Science Class 9", quantity: 150 },
      { title: "History Class 10", quantity: 120 },
    ],
  };

  const studentData = {
    total: 850,
    classes: [
      { name: "Class 6", students: 150, boys: 70, girls: 80 },
      { name: "Class 7", students: 145, boys: 68, girls: 77 },
      { name: "Class 8", students: 155, boys: 75, girls: 80 },
      { name: "Class 9", students: 200, boys: 95, girls: 105 },
      { name: "Class 10", students: 200, boys: 92, girls: 108 },
    ],
  };

  return (
    <AdminLayout
      title="School Details"
      description={`In-depth information for ${school.name}`}
    >
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Block Dashboard
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2" /> School Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>UDISE:</strong> {school.udise}</p>
              <p><strong>Principal:</strong> {school.principal}</p>
              <p><strong>Students:</strong> {school.students}</p>
              <p><strong>Address:</strong> {school.address}</p>
              <Button className="mt-4 w-full" onClick={() => navigate('/admin/CreateProfile')}>Edit Profile</Button>
            </CardContent>
          </Card>
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" /> Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.classes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.students} Students</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Boys: {c.boys}</p>
                      <p className="text-sm">Girls: {c.girls}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="destructive" className="mt-4 w-full">View Detailed Report</Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="border-accent">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2" /> Active Requisition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-bold">{requisition.id}</p>
                  <p className="text-sm text-muted-foreground">Date: {requisition.date}</p>
                </div>
                <span className="text-orange-500 font-bold">{requisition.status}</span>
              </div>
              <ul className="space-y-2">
                {requisition.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <span className="flex items-center"><BookOpen className="mr-2 h-4 w-4" />{item.title}</span>
                    <span>Qty: {item.quantity}</span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="mt-4 w-full">View Requisition History</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
