import AdminLayout from "@/components/AdminLayout";
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
  BookOpen,
  School,
  TrendingUp,
  AlertCircle,
  Plus,
  Send,
  Eye,
  Users,
  Package,
  BookCheck,
  Search,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function BlockLevelDashboard() {
  const navigate = useNavigate();
  const stats = [
    {
      label: "Books in Stock",
      value: "35,670",
      icon: BookOpen,
      change: "+5.2%",
    },
    { label: "Schools Managed", value: "94", icon: School, change: "+2%" },
    { label: "Active Requisition", value: "7", icon: AlertCircle, change: "-12%" },
    {
      label: "Distribution Rate",
      value: "88.7%",
      icon: TrendingUp,
      change: "+4.1%",
    },
  ];

  const schoolRequisitions = [
    {
      school: "Government Primary School - Sector 1",
      books: 450,
      subject: "Mathematics",
      grade: "Class 3-5",
      status: "urgent",
    },
    {
      school: "Municipal High School - Central",
      books: 320,
      subject: "Science",
      grade: "Class 6-8",
      status: "normal",
    },
    {
      school: "Community School - North",
      books: 180,
      subject: "English",
      grade: "Class 1-2",
      status: "normal",
    },
    {
      school: "Primary School - West Block",
      books: 290,
      subject: "Hindi",
      grade: "Class 3-5",
      status: "urgent",
    },
  ];

  const schools = [
    {
      name: "HENRY DEROZIO ACADEMY",
      principal: "Mr. John Doe",
      students: 450,
      booksIssued: 4200,
      lastUpdate: "1 day ago",
    },
    {
      name: "INDRANAGAR HIGH SCHOOL",
      principal: "Ms. Jane Smith",
      students: 620,
      booksIssued: 5900,
      lastUpdate: "2 days ago",
    },
    {
      name: "NOAGAON KRISHNANAGAR H.S SCHOOL",
      principal: "Dr. Robert Johnson",
      students: 310,
      booksIssued: 2900,
      lastUpdate: "3 hours ago",
    },
    {
      name: "ALIMUDDIN JB SCHOOL",
      principal: "Mrs. Emily White",
      students: 280,
      booksIssued: 2700,
      lastUpdate: "5 hours ago",
    },
    {
      name: "CHANPUR AKSHOY KUMAR SMRITI J.B. SCHOOL",
      principal: "Mr. Michael Brown",
      students: 500,
      booksIssued: 4800,
      lastUpdate: "1 day ago",
    },
    {
      name: "PALLIMANGAL H/S SCHOOL",
      principal: "Ms. Sarah Davis",
      students: 390,
      booksIssued: 3700,
      lastUpdate: "4 hours ago",
    },
    {
      name: "CHANDRAPUR SOUTH HIGH",
      principal: "Dr. David Green",
      students: 550,
      booksIssued: 5300,
      lastUpdate: "2 days ago",
    },
    {
      name: "CHANDRAPUR J.B SCHOOL",
      principal: "Mrs. Laura Wilson",
      students: 250,
      booksIssued: 2300,
      lastUpdate: "6 hours ago",
    },
    {
      name: "RESHAMBAGAN H/S SCHOOL",
      principal: "Mr. Chris Taylor",
      students: 480,
      booksIssued: 4600,
      lastUpdate: "1 day ago",
    },
  ];

  return (
    <AdminLayout
      title="Block Level Dashboard (IS)"
      description="Institutional Supervisor - Manage schools and book distribution in your block"
      adminLevel={null}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
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
                  <span className="text-green-600">{stat.change}</span> from
                  last month
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
            path: "/admin/block/profile",
          },
          {
            label: "Requisition",
            icon: Package,
            path: "/admin/block/requisition",
          },
          { label: "Issues", icon: AlertCircle, path: "/admin/block/issues" },
          {
            label: "Notification",
            icon: Users,
            path: "/admin/block/notifications",
          },
          {
            label: "e-Challan",
            icon: BookCheck,
            path: "/admin/block/block-echallan",
          },
          {
            label: "Backlog Entry",
            icon: Plus,
            path: "/admin/school/backlog-entry",
          },
          {
            label: "Received",
            icon: BookCheck,
            path: "/admin/school/received",
          },
          {
            label: "Distribute",
            icon: BookCheck,
            path: "/admin/school/distribute",
          },
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

      <div className="grid lg:grid-cols-1 gap-6">
        {/* School Management */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>List of Schools</CardTitle>
              <CardDescription>Monitor schools in your block</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schools.map((school, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{school.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Principal: {school.principal}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {school.students} students •{" "}
                        {school.booksIssued.toLocaleString()} books issued
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Updated {school.lastUpdate}
                      </p>
                      <div>
                        <Button size="sm" variant="outline" onClick={() => navigate("/admin/block/school-details")}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
