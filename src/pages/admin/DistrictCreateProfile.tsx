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

const initialAccounts = [
  { id: 1, username: "deo", role: "District Education Officer" },
  { id: 2, username: "blockmanager", role: "Block Manager" },
];

export default function DistrictCreateProfile() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !role) return;
    setAccounts((prev) => [...prev, { id: prev.length + 1, username, role }]);
    setUsername("");
    setRole("");
  };

  return (
    <AdminLayout
      title="Create Profile"
      description="Add new user accounts for your district"
      adminLevel="DISTRICT EDUCATION OFFICER"
    >
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-100 to-green-50 border-green-300 mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-green-900">Add New User</CardTitle>
          <CardDescription>Create a new user account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col md:flex-row gap-4 items-center"
            onSubmit={handleAdd}
          >
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="max-w-xs"
              required
            />
            <Input
              placeholder="Role (e.g. Block Manager)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="max-w-xs"
              required
            />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            Existing Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-white"
              >
                <div>
                  <div className="font-semibold">{acc.username}</div>
                  <div className="text-xs text-gray-500">{acc.role}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
