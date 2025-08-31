import AdminLayout from "@/components/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schools = [
    { name: "DAKSHIN LANKAMURA J.B SCHOOL", udise: "16010100108", principal: "Mr. R.K. Sharma", booksReceived: 1200 },
    { name: "LANKAMURA H.S. SCHOOL", udise: "16010100109", principal: "Ms. S. Devi", booksReceived: 1500 },
    { name: "DAKSHIN NARAYANPUR SB SCHOOL", udise: "16010100110", principal: "Mr. A. Singh", booksReceived: 900 },
];

export default function BlockProfile() {
  // Dummy data
  const [blockName] = useState("Block A - Central");
  const [isName] = useState("Dr. Anil Sharma");
  const [districtName] = useState("District Alpha");
  const [blockId] = useState("BLK-001");
  const [password, setPassword] = useState("password123");
  const [newPassword, setNewPassword] = useState("");
  const [showChange, setShowChange] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChangePassword = () => {
    if (newPassword.length > 0) {
      setPassword(newPassword);
      setNewPassword("");
      setShowChange(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <AdminLayout
      title="Block Profile"
      description="View and update your block profile details"
      adminLevel={null}
    >
      <div className="space-y-6">
        <Card className="w-full max-w-xl mx-auto mt-8 shadow-xl rounded-2xl border-0">
          <CardHeader>
            <CardTitle>Block Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-semibold">Block Name:</span>
                <span>{blockName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">IS Name:</span>
                <span>{isName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">District Name:</span>
                <span>{districtName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Block ID:</span>
                <span>{blockId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Password:</span>
                <span className="font-mono">{password.replace(/./g, "*")}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChange((v) => !v)}
                >
                  Change Password
                </Button>
              </div>
              {showChange && (
                <div className="flex gap-2 items-center mt-2">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-48"
                  />
                  <Button
                    size="sm"
                    onClick={handleChangePassword}
                    disabled={newPassword.length === 0}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowChange(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {success && (
                <div className="text-green-600 text-sm mt-2">
                  Password changed successfully!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-xl mx-auto mt-8 shadow-xl rounded-2xl border-0">
            <CardHeader>
                <CardTitle>Schools Managed</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>School Name</TableHead>
                            <TableHead>UDISE Code</TableHead>
                            <TableHead>Principal Name</TableHead>
                            <TableHead>Books Received</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schools.map((school) => (
                            <TableRow key={school.udise}>
                                <TableCell>{school.name}</TableCell>
                                <TableCell>{school.udise}</TableCell>
                                <TableCell>{school.principal}</TableCell>
                                <TableCell>{school.booksReceived}</TableCell>
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