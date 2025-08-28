import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye,
  RefreshCw,
  AlertCircle,
  Zap,
  ArrowUp,
  ArrowRight,
  Send,
  BookOpen,
  Users,
  Building,
} from "lucide-react";
import { issuesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Issue {
  id: string;
  issueId: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: string;
  schoolId: string;
  raisedBy: string;
  currentLevel: "BLOCK" | "DISTRICT" | "STATE";
  remarksByBlock?: string;
  remarksByDistrict?: string;
  remarksByState?: string;
  createdAt: string;
  updatedAt: string;
  reviewedByBlockAt?: string;
  reviewedByDistrictAt?: string;
  reviewedByStateAt?: string;
  resolvedAt?: string;
  rejectedAt?: string;
  school: {
    id: string;
    name: string;
    udise: string;
    block_name: string;
    district: string;
  };
}

const priorityColors = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const statusColors = {
  PENDING_BLOCK_REVIEW: "bg-blue-100 text-blue-800",
  PENDING_DISTRICT_REVIEW: "bg-purple-100 text-purple-800",
  PENDING_STATE_REVIEW: "bg-indigo-100 text-indigo-800",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED_BY_BLOCK: "bg-red-100 text-red-800",
  REJECTED_BY_DISTRICT: "bg-red-100 text-red-800",
  REJECTED_BY_STATE: "bg-red-100 text-red-800",
};

const priorityIcons = {
  LOW: <ArrowRight className="h-3 w-3" />,
  MEDIUM: <Clock className="h-3 w-3" />,
  HIGH: <ArrowUp className="h-3 w-3" />,
  CRITICAL: <Zap className="h-3 w-3" />,
};

const issueCategories = [
  { value: "BOOKS_DELIVERY", label: "Books Delivery Issues", icon: BookOpen },
  { value: "QUALITY_ISSUES", label: "Quality Issues", icon: AlertTriangle },
  { value: "QUANTITY_SHORTAGE", label: "Quantity Shortage", icon: AlertCircle },
  { value: "INFRASTRUCTURE", label: "Infrastructure Issues", icon: Building },
  { value: "STAFF_RELATED", label: "Staff Related Issues", icon: Users },
  { value: "OTHER", label: "Other Issues", icon: AlertTriangle },
];

export default function SchoolIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { toast } = useToast();

  // Mock current school data - in real app, this would come from auth context
  const currentSchool = {
    id: "school-001",
    name: "Government Primary School, Example",
    udise: "12345678901",
    block_name: "Example Block",
    district: "Example District",
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, priorityFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params: any = { schoolId: currentSchool.id };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      const response = await issuesAPI.getAll(params);
      setIssues(response.data.data || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast({
        title: "Error",
        description: "Failed to fetch issues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await issuesAPI.create({
        title: `[${category}] ${title}`,
        description,
        priority: priority as any,
        schoolId: currentSchool.id,
        raisedBy: "current-school-user", // This should come from auth context
      });

      toast({
        title: "Success",
        description: "Issue raised successfully and sent to Block Level (IS)",
      });

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCategory("");
      setShowCreateForm(false);
      fetchIssues();
    } catch (error) {
      console.error("Error creating issue:", error);
      toast({
        title: "Error",
        description: "Failed to raise issue",
        variant: "destructive",
      });
    }
  };

  const getStatusText = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "PENDING_BLOCK_REVIEW":
        return "Your issue has been sent to the Block Level (IS) for review";
      case "PENDING_DISTRICT_REVIEW":
        return "Issue has been escalated to District Level for review";
      case "PENDING_STATE_REVIEW":
        return "Issue has been escalated to State Level for review";
      case "RESOLVED":
        return "Issue has been resolved";
      case "REJECTED_BY_BLOCK":
        return "Issue was rejected at Block Level";
      case "REJECTED_BY_DISTRICT":
        return "Issue was rejected at District Level";
      case "REJECTED_BY_STATE":
        return "Issue was rejected at State Level";
      default:
        return "Status unknown";
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const statusMatch = statusFilter === "all" || issue.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || issue.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const IssueCard = ({ issue }: { issue: Issue }) => (
    <Card key={issue.id} className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={priorityColors[issue.priority]}>
              {priorityIcons[issue.priority]}
              <span className="ml-1">{issue.priority}</span>
            </Badge>
            <Badge
              className={
                statusColors[issue.status as keyof typeof statusColors]
              }
            >
              {getStatusText(issue.status)}
            </Badge>
            <span className="text-sm text-gray-500">#{issue.issueId}</span>
          </div>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(issue.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-lg">{issue.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{issue.description}</p>
        </div>

        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
          {getStatusDescription(issue.status)}
        </div>

        {/* Show review history */}
        <div className="space-y-2">
          {issue.remarksByBlock && (
            <div className="p-2 bg-blue-50 rounded text-sm">
              <p className="font-medium text-blue-800">Block Level Response:</p>
              <p className="text-blue-700">{issue.remarksByBlock}</p>
              {issue.reviewedByBlockAt && (
                <p className="text-xs text-blue-600 mt-1">
                  {formatDistanceToNow(new Date(issue.reviewedByBlockAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          )}
          {issue.remarksByDistrict && (
            <div className="p-2 bg-purple-50 rounded text-sm">
              <p className="font-medium text-purple-800">
                District Level Response:
              </p>
              <p className="text-purple-700">{issue.remarksByDistrict}</p>
              {issue.reviewedByDistrictAt && (
                <p className="text-xs text-purple-600 mt-1">
                  {formatDistanceToNow(new Date(issue.reviewedByDistrictAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          )}
          {issue.remarksByState && (
            <div className="p-2 bg-indigo-50 rounded text-sm">
              <p className="font-medium text-indigo-800">
                State Level Response:
              </p>
              <p className="text-indigo-700">{issue.remarksByState}</p>
              {issue.reviewedByStateAt && (
                <p className="text-xs text-indigo-600 mt-1">
                  {formatDistanceToNow(new Date(issue.reviewedByStateAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout
      title="Raise Issues"
      description={`Report issues and track their progress through Block → District → State levels`}
      adminLevel="SCHOOL ADMIN"
    >
      <div className="space-y-6">
        {/* School Info Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Your School</CardTitle>
            <CardDescription className="text-blue-600">
              {currentSchool.name} (UDISE: {currentSchool.udise})
              <br />
              Block: {currentSchool.block_name}, District:{" "}
              {currentSchool.district}
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Raise New Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Raise New Issue</DialogTitle>
                  <CardDescription>
                    Your issue will be sent to the Block Level (IS) for review
                  </CardDescription>
                </DialogHeader>
                <form onSubmit={handleCreateIssue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueCategories.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center">
                                <Icon className="h-4 w-4 mr-2" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Issue Title *
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Detailed Description *
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed information about the issue, including when it occurred, what was expected vs what happened, and any other relevant details"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">
                          <div className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-green-600" />
                            Low Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                            Medium Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="HIGH">
                          <div className="flex items-center">
                            <ArrowUp className="h-4 w-4 mr-2 text-orange-600" />
                            High Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="CRITICAL">
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-red-600" />
                            Critical Priority
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                    <p>
                      <strong>Next Steps:</strong>
                    </p>
                    <p>1. Your issue will be sent to the Block Level (IS)</p>
                    <p>2. They can resolve it or escalate to District Level</p>
                    <p>3. District can resolve or escalate to State Level</p>
                    <p>4. You'll receive updates on the progress</p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Send className="h-4 w-4 mr-1" />
                      Raise Issue
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING_BLOCK_REVIEW">
                  Pending Block
                </SelectItem>
                <SelectItem value="PENDING_DISTRICT_REVIEW">
                  Pending District
                </SelectItem>
                <SelectItem value="PENDING_STATE_REVIEW">
                  Pending State
                </SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchIssues}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <TabsContent value="all">
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">Loading your issues...</div>
              ) : filteredIssues.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Issues Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You haven't raised any issues yet. Click the "Raise New
                    Issue" button to report a problem.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Raise Your First Issue
                  </Button>
                </Card>
              ) : (
                filteredIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {filteredIssues
                .filter((issue) => issue.status.includes("PENDING"))
                .map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="resolved">
            <div className="grid gap-4">
              {filteredIssues
                .filter((issue) => issue.status === "RESOLVED")
                .map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid gap-4">
              {filteredIssues
                .filter((issue) => issue.status.includes("REJECTED"))
                .map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
