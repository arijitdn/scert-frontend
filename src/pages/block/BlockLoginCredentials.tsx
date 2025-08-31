import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dummyAccounts = [
  { id: 1, username: "blockadmin", role: "Block Admin" },
  { id: 2, username: "isupervisor", role: "Institutional Supervisor" },
];

export default function BlockLoginCredentials() {
  return (
    <AdminLayout
      title="Login Credentials"
      description="Manage user accounts for your block"
      adminLevel="INSTITUTIONAL SUPERVISOR"
    >
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">User Accounts</CardTitle>
          <CardDescription>View and manage login credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dummyAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-white"
              >
                <div>
                  <div className="font-semibold">{acc.username}</div>
                  <div className="text-xs text-gray-500">{acc.role}</div>
                </div>
                <Button
                  size="sm"
                  className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
                >
                  Reset Password
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
