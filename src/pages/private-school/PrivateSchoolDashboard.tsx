import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Users,
  TrendingDown,
  Package,
  Plus,
  Search,
  BookCheck,
  AlertCircle,
  TrendingUp,
  User,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const allBooksData = {
  "Class 6": [
    { subject: "Mathematics", total: 150, issued: 120, available: 30, percentage: 80 },
    { subject: "Science", total: 150, issued: 110, available: 40, percentage: 73 },
    { subject: "English", total: 150, issued: 130, available: 20, percentage: 87 },
  ],
  "Class 7": [
    { subject: "Mathematics", total: 145, issued: 100, available: 45, percentage: 69 },
    { subject: "Science", total: 145, issued: 120, available: 25, percentage: 83 },
    { subject: "Social Studies", total: 145, issued: 115, available: 30, percentage: 79 },
  ],
  "Class 8": [
    { subject: "Mathematics", total: 155, issued: 130, available: 25, percentage: 84 },
    { subject: "Science", total: 155, issued: 140, available: 15, percentage: 90 },
    { subject: "Hindi", total: 155, issued: 125, available: 30, percentage: 81 },
  ],
  "Class 9": [
    { subject: "Mathematics", total: 200, issued: 180, available: 20, percentage: 90 },
    { subject: "Science", total: 200, issued: 170, available: 30, percentage: 85 },
    { subject: "English", total: 200, issued: 190, available: 10, percentage: 95 },
  ],
  "Class 10": [
    { subject: "Mathematics", total: 200, issued: 190, available: 10, percentage: 95 },
    { subject: "Science", total: 200, issued: 185, available: 15, percentage: 93 },
    { subject: "Computer Science", total: 200, issued: 195, available: 5, percentage: 98 },
  ],
};

export default function PrivateSchoolDashboard() {
  const [selectedClass, setSelectedClass] = useState("Class 9");
  const booksBySubject = allBooksData[selectedClass];

  const stats = [
    { label: "Books Requested", value: "1,200", icon: BookOpen, change: "+10%" },
    { label: "Books Received", value: "950", icon: BookCheck, change: "+8%" },
    { label: "Total Amount Spent", value: "₹ 1,50,000", icon: Package, change: "+12%" },
    { label: "Pending Issues", value: "5", icon: AlertCircle, change: "-20%" },
  ];

  const navigate = useNavigate();

  return (
    <AdminLayout
      title="Private School Dashboard"
      description="Manage your private school's book inventory and track student book distribution"
      adminLevel={null}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith("+");
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={isPositive ? "text-green-600" : "text-red-600"}
                  >
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {[
          {
            label: "Profile",
            icon: Users,
            path: "/admin/private-school/profile",
          },
          {
            label: "Requisition",
            icon: Package,
            path: "/admin/private-school/requisition",
          },
          {
            label: "Notification",
            icon: Users,
            path: "/admin/private-school/notifications",
          },
          { label: "Received", icon: Package, path: "/admin/private-school/received" },
          { label: "Issues", icon: AlertCircle, path: "/admin/private-school/issues" },
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.label}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Icon className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium text-center text-sm">
                  {action.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Books by Subject - Removed for Private School Dashboard */}
      {/* <div className="grid lg:grid-cols-1 gap-6">
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Books by Subject</CardTitle>
                  <CardDescription>
                    Current inventory status for {selectedClass}
                  </CardDescription>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(allBooksData).map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booksBySubject.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{subject.subject}</h4>
                      <span className="text-sm text-muted-foreground">
                        {subject.issued}/{subject.total} ({subject.percentage}%
                        issued)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{subject.available} available</span>
                      <span>{subject.issued} issued</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div> */}
    </AdminLayout>
  );
}
