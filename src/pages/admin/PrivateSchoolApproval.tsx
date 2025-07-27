import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

type PrivateSchool = {
  id: string;
  schoolName: string;
  udiseCode: string;
  headmasterName: string;
  email: string;
  phone: string;
  district: string;
  block: string;
  category: string;
  type: string;
};

const initialPrivateSchools: PrivateSchool[] = [
  {
    id: "1",
    schoolName: "Greenwood Academy",
    udiseCode: "PRI-ABC1",
    headmasterName: "Ms. Alice Brown",
    email: "alice.brown@greenwood.com",
    phone: "+91 99887 76655",
    district: "WEST TRIPURA",
    block: "AGARTALA MUNICIPAL COORPORATION",
    category: "Primary",
    type: "Co-ed",
  },
  {
    id: "2",
    schoolName: "Bright Minds School",
    udiseCode: "PRI-DEF2",
    headmasterName: "Mr. Bob Johnson",
    email: "bob.johnson@brightminds.com",
    phone: "+91 99776 65544",
    district: "GOMATI",
    block: "UDAIPUR",
    category: "Secondary",
    type: "Boys",
  },
  {
    id: "3",
    schoolName: "City International",
    udiseCode: "PRI-GHI3",
    headmasterName: "Dr. Carol White",
    email: "carol.white@cityint.com",
    phone: "+91 99665 54433",
    district: "NORTH TRIPURA",
    block: "DHARMANAGAR",
    category: "Higher Secondary",
    type: "Girls",
  },
];

export default function PrivateSchoolApproval() {
  const [schoolsToApprove, setSchoolsToApprove] = useState(initialPrivateSchools);

  const handleApprove = (id: string) => {
    setSchoolsToApprove((prev) => prev.filter((school) => school.id !== id));
    alert(`School with UDISE Code ${id} approved!`);
  };

  return (
    <AdminLayout
      title="Private School Approval"
      description="Review and approve private schools registered by district admins"
      adminLevel="STATE ADMIN"
    >
      <div className="grid grid-cols-1 gap-6">
        {schoolsToApprove.length === 0 ? (
          <Card className="w-full max-w-4xl mx-auto text-center py-12 shadow-lg border-green-300 bg-green-50">
            <CardTitle className="text-green-700">No Private Schools Awaiting Approval</CardTitle>
            <CardDescription className="text-green-600 mt-2">All schools are up to date!</CardDescription>
          </Card>
        ) : (
          schoolsToApprove.map((school) => (
            <Card key={school.id} className="w-full max-w-4xl mx-auto shadow-lg border-blue-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-800">{school.schoolName}</CardTitle>
                <CardDescription>UDISE Code: {school.udiseCode}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p><span className="font-semibold">Headmaster:</span> {school.headmasterName}</p>
                    <p><span className="font-semibold">Email:</span> {school.email}</p>
                    <p><span className="font-semibold">Phone:</span> {school.phone}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">District:</span> {school.district}</p>
                    <p><span className="font-semibold">Block:</span> {school.block}</p>
                    <p><span className="font-semibold">Category:</span> {school.category}</p>
                    <p><span className="font-semibold">Type:</span> {school.type}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="success"
                    onClick={() => handleApprove(school.id)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                  {/* Add a reject button if needed */}
                  {/* <Button
                    variant="destructive"
                    onClick={() => console.log('Reject', school.id)}
                    className="flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
