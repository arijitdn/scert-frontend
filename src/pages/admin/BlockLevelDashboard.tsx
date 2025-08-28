import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  School,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Plus,
  Send,
  Eye,
  Users,
  Package,
  BookCheck,
  Search,
  User,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  schoolsAPI,
  stockAPI,
  requisitionsAPI,
  blocksAPI,
  issuesAPI,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types for API data
interface ClassEnrollment {
  id: string;
  school_id: string;
  class: string;
  students: number;
}

interface School {
  id: string;
  name: string;
  udise: string;
  category: string;
  block_code: number;
  block_name: string;
  district: string;
  district_code: number;
  management: string;
  type: string;
  ClassEnrollment?: ClassEnrollment;
}

interface Stock {
  id: string;
  bookId: string;
  userId: string;
  type: string;
  quantity: number;
}

interface Requisition {
  id: string;
  reqId: string;
  schoolId: string;
  bookId: string;
  quantity: number;
  received: number;
  status: string;
}

interface Block {
  id: string;
  name: string;
  code: number;
  district: string;
  phone: string;
}

export default function BlockLevelDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for data
  const [schools, setSchools] = useState<School[]>([]);
  const [blockStock, setBlockStock] = useState<Stock[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [issuesSummary, setIssuesSummary] = useState<any>({});
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculated statistics
  const [stats, setStats] = useState([
    {
      label: "Books in Stock",
      value: "0",
      icon: BookOpen,
      change: "+0%",
    },
    { label: "Schools Managed", value: "0", icon: School, change: "+0%" },
    {
      label: "Active Requisitions",
      value: "0",
      icon: AlertCircle,
      change: "0%",
    },
    {
      label: "Pending Issues",
      value: "0",
      icon: AlertTriangle,
      change: "0%",
    },
  ]);

  // Get current block info (you may want to get this from auth context or props)
  const getCurrentBlockCode = () => {
    // This should come from authentication/user context
    // For now, using a placeholder - you should replace this with actual logic
    return 1; // Replace with actual block code from user session
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const blockCode = getCurrentBlockCode();

        // Fetch schools, stock, requisitions, and issues in parallel
        const [
          schoolsResponse,
          stockResponse,
          requisitionsResponse,
          issuesResponse,
          issuesSummaryResponse,
        ] = await Promise.all([
          schoolsAPI.getAll({ block: blockCode.toString() }),
          stockAPI.getAll({ type: "BLOCK" }),
          requisitionsAPI.getAll(),
          issuesAPI.getAll({ level: "BLOCK" }),
          issuesAPI.getSummary({ level: "BLOCK" }),
        ]);

        const schoolsData = schoolsResponse.data.data || [];
        const stockData = stockResponse.data.data || [];
        const requisitionsData = requisitionsResponse.data.data || [];
        const issuesData = issuesResponse.data.data || [];
        const issuesSummaryData = issuesSummaryResponse.data.data || {};

        setSchools(schoolsData);
        setBlockStock(stockData);
        setRequisitions(requisitionsData);
        setIssues(issuesData);
        setIssuesSummary(issuesSummaryData);

        // Calculate statistics
        calculateStats(
          schoolsData,
          stockData,
          requisitionsData,
          issuesSummaryData,
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate statistics from real data
  const calculateStats = (
    schoolsData: School[],
    stockData: Stock[],
    requisitionsData: Requisition[],
    issuesSummaryData: any = {},
  ) => {
    const totalBooksInStock = stockData.reduce(
      (sum, stock) => sum + stock.quantity,
      0,
    );
    const schoolsCount = schoolsData.length;

    // Get active requisitions (those that are not completed or rejected)
    const activeRequisitions = requisitionsData.filter(
      (req) =>
        ![
          "COMPLETED",
          "REJECTED_BY_BLOCK",
          "REJECTED_BY_DISTRICT",
          "REJECTED_BY_STATE",
        ].includes(req.status),
    );

    const pendingIssues = issuesSummaryData.pendingBlock || 0;

    setStats([
      {
        label: "Books in Stock",
        value: totalBooksInStock.toLocaleString(),
        icon: BookOpen,
        change: "+5.2%", // You can calculate this from previous data if available
      },
      {
        label: "Schools Managed",
        value: schoolsCount.toString(),
        icon: School,
        change: "+2%",
      },
      {
        label: "Active Requisitions",
        value: activeRequisitions.length.toString(),
        icon: AlertCircle,
        change: "-12%",
      },
      {
        label: "Pending Issues",
        value: pendingIssues.toString(),
        icon: AlertTriangle,
        change: "0%",
      },
    ]);
  };

  // Get requisitions summary for schools
  const getSchoolRequisitionSummary = (schoolId: string) => {
    const schoolReqs = requisitions.filter((req) => req.schoolId === schoolId);
    const activeReqs = schoolReqs.filter(
      (req) =>
        ![
          "COMPLETED",
          "REJECTED_BY_BLOCK",
          "REJECTED_BY_DISTRICT",
          "REJECTED_BY_STATE",
        ].includes(req.status),
    );
    const totalBooksRequested = activeReqs.reduce(
      (sum, req) => sum + req.quantity,
      0,
    );

    return {
      active: activeReqs.length,
      totalBooks: totalBooksRequested,
      hasUrgent: activeReqs.some(
        (req) => req.status === "PENDING_BLOCK_APPROVAL",
      ), // Pending block approval considered urgent
    };
  };

  if (loading) {
    return (
      <AdminLayout
        title="Block Level Dashboard (IS)"
        description="Loading dashboard data..."
        adminLevel={null}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

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
            label: "Issues",
            icon: AlertTriangle,
            path: "/admin/block/issues",
          },
          {
            label: "Backlog Entry",
            icon: Plus,
            path: "/admin/block/backlog-entry",
          },
          {
            label: "Received",
            icon: BookCheck,
            path: "/admin/block/received",
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

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Urgent Requisitions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Urgent Requisitions
            </CardTitle>
            <CardDescription>
              Requisitions requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requisitions
                .filter((req) => req.status === "PENDING_BLOCK_APPROVAL")
                .slice(0, 5)
                .map((req) => {
                  const school = schools.find((s) => s.id === req.schoolId);
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {school?.name || "Unknown School"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Req ID: {req.reqId} • {req.quantity} books
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/block/requisition?req=${req.id}`)
                        }
                      >
                        Review
                      </Button>
                    </div>
                  );
                })}
              {requisitions.filter(
                (req) => req.status === "PENDING_BLOCK_APPROVAL",
              ).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No urgent requisitions
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Block Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Block Summary
            </CardTitle>
            <CardDescription>Overview of block performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Schools:</span>
                <span className="text-lg font-bold">{schools.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Students:</span>
                <span className="text-lg font-bold">
                  {schools
                    .reduce(
                      (sum, school) =>
                        sum + (school.ClassEnrollment?.students || 0),
                      0,
                    )
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Books in Stock:</span>
                <span className="text-lg font-bold">
                  {blockStock
                    .reduce((sum, stock) => sum + stock.quantity, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending Approvals:</span>
                <span className="text-lg font-bold text-red-600">
                  {
                    requisitions.filter(
                      (req) => req.status === "PENDING_BLOCK_APPROVAL",
                    ).length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
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
                {schools.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No schools found in this block.
                    </p>
                  </div>
                ) : (
                  schools.map((school, index) => {
                    const reqSummary = getSchoolRequisitionSummary(school.id);
                    return (
                      <div
                        key={school.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{school.name}</h4>
                            {reqSummary.hasUrgent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            UDISE: {school.udise} • {school.category} •{" "}
                            {school.management}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {school.ClassEnrollment?.students || "N/A"} students
                            • {reqSummary.active} active requisitions •{" "}
                            {reqSummary.totalBooks} books requested
                          </p>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {school.type}
                            </span>
                            {school.ClassEnrollment?.class && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                Class {school.ClassEnrollment.class}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2 ml-4">
                          <p className="text-xs text-muted-foreground">
                            District: {school.district}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/admin/block/school-details/${school.id}`,
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {reqSummary.active > 0 && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  navigate(
                                    `/admin/block/requisition?school=${school.id}`,
                                  )
                                }
                              >
                                <Package className="h-4 w-4 mr-1" />
                                View Requests
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
