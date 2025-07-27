import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function StateProfile() {
  return (
    <AdminLayout
      title="Profile"
      description="Your profile and dashboard overview"
      adminLevel="STATE ADMIN"
    >
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/profile.png" alt="Profile" />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>State Admin</CardTitle>
                <CardDescription>stateadmin@email.com</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription>
              Features and responsibilities at each level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <b>State Level:</b> Manage book inventory, registration,
                requisition, received items, e-Challan, monitoring, issues,
                notifications, and backlog entry for all districts.
              </li>
              <li>
                <b>District Level (DEO):</b> Oversee book distribution, create
                profiles, manage requisitions, handle issues, notifications, and
                monitor all blocks in the district.
              </li>
              <li>
                <b>Block Level (IS):</b> Supervise schools, manage book
                distribution, create profiles, requisitions, issues,
                notifications, e-Challan, backlog entry, and reports for all
                schools in the block.
              </li>
              <li>
                <b>School Level:</b> Manage school book inventory, create
                profiles, requisitions, notifications, received/distributed
                books, issues, monitoring, and reports for the school.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
