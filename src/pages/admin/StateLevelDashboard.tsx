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
  Building2,
  TrendingUp,
  Users,
  Plus,
  Search,
  Filter,
  Package,
  BookCheck,
  AlertCircle,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function StateLevelDashboard() {
  const stats = [
    {
      label: "Total Books",
      value: "2,847,563",
      icon: BookOpen,
      change: "+12.5%",
    },
    { label: "Districts", value: "8", icon: Building2, change: "0%" },
    { label: "Total IS", value: "100", icon: Users, change: "+0%" },
    { label: "Total Schools", value: "3,500", icon: Users, change: "+2.1%" },
    {
      label: "Distribution Rate",
      value: "94.2%",
      icon: TrendingUp,
      change: "+3.2%",
    },
  ];

  const recentActivities = [
    {
      action: "Book allocation approved",
      district: "Mumbai District",
      time: "2 hours ago",
      status: "approved",
    },
    {
      action: "New shipment received",
      district: "Pune District",
      time: "4 hours ago",
      status: "received",
    },
    {
      action: "Inventory request pending",
      district: "Nashik District",
      time: "6 hours ago",
      status: "pending",
    },
    {
      action: "Distribution completed",
      district: "Nagpur District",
      time: "1 day ago",
      status: "completed",
    },
  ];

  const districts = [
    { name: "Dhalai", schools: 500, books: 200000, utilization: 90, totalRequisition: 150000 },
    { name: "Gomati", schools: 450, books: 180000, utilization: 88, totalRequisition: 130000 },
    { name: "Khowai", schools: 300, books: 120000, utilization: 92, totalRequisition: 90000 },
    { name: "North Tripura", schools: 550, books: 220000, utilization: 85, totalRequisition: 180000 },
    { name: "Sepahijala", schools: 400, books: 160000, utilization: 93, totalRequisition: 140000 },
    { name: "South Tripura", schools: 600, books: 240000, utilization: 89, totalRequisition: 200000 },
    { name: "Unakoti", schools: 250, books: 100000, utilization: 95, totalRequisition: 80000 },
    { name: "West Tripura", schools: 700, books: 280000, utilization: 91, totalRequisition: 230000 },
  ];

  const navigate = useNavigate();

  return (
    <AdminLayout
      title="State Level Dashboard"
      description="Manage book inventory across all districts in the state"
      
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
            label: "Registration Of Books",
            icon: BookOpen,
            path: "/admin/state/register-books",
          },
          {
            label: "Edit Profile",
            icon: User,
            path: "/admin/state/create-profile",
          },
          {
            label: "Requisition",
            icon: Package,
            path: "/admin/state/requisition",
          },
          {
            label: "Received Items",
            icon: Package,
            path: "/admin/state/received",
          },
          {
            label: "e-Challan",
            icon: BookCheck,
            path: "/admin/state/state-echallan",
          },
          { label: "Issues", icon: AlertCircle, path: "/admin/state/issues" },
          {
            label: "Notification",
            icon: Users,
            path: "/admin/state/notifications",
          },
          {
            label: "Backlog Entry",
            icon: Plus,
            path: "/admin/school/backlog-entry",
          },
          {
            label: "Requisition Window",
            icon: Package,
            path: "/admin/state/requisition-window",
          },
          {
            label: "Reports",
            icon: BookCheck,
            path: "/admin/state/reports",
          },
          {
            label: "Private School Approval",
            icon: BookCheck,
            path: "/admin/state/private-school-approval",
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
        {/* Districts Overview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>List of Districts</CardTitle>
              <CardDescription>
                Manage and monitor all districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {districts.map((district, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{district.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {district.schools} government schools | {district.totalRequisition} books requisitioned
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/state/district-details/${district.name}`)}>
                          Manage
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
