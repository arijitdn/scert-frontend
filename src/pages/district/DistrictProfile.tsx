import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const managedIS = [
  { name: "Dhukli", code: "160101" },
  { name: "AGARTALA MUNICIPAL COORPORATION", code: "160102" },
  { name: "Mohanpur", code: "160108" },
];

export default function DistrictProfile() {
  return (
    <AdminLayout
      title="Profile"
      description="Manage your district's profile and settings"
      adminLevel="DISTRICT EDUCATION OFFICER"
    >
      <div className="space-y-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>District Profile</CardTitle>
            <CardDescription>
              View and manage your district's information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold">District Name:</span> WEST TRIPURA
            </div>
            <div>
              <span className="font-semibold">District Code:</span> 1601
            </div>
            <div className="space-y-2">
              <label className="font-semibold">Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value="************"
                  readOnly
                  className="p-2 border rounded-md w-full"
                />
                <Button variant="outline">Reset Password</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>IS Managed</CardTitle>
            <CardDescription>
              All IS managed by WEST Tripura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IS Name</TableHead>
                  <TableHead>IS Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managedIS.map((is) => (
                  <TableRow key={is.code}>
                    <TableCell>{is.name}</TableCell>
                    <TableCell>{is.code}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}