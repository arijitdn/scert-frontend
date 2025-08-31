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
  Filter,
  RefreshCw,
  AlertCircle,
  Zap,
  ArrowUp,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useParams } from "react-router-dom";
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

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [remarks, setRemarks] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { userType } = useParams();
  const { toast } = useToast();

  const currentUserLevel = userType?.toUpperCase() as
    | "SCHOOL"
    | "BLOCK"
    | "DISTRICT"
    | "STATE";

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, priorityFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      // Filter based on user level
      if (currentUserLevel !== "STATE") {
        params.level = currentUserLevel;
      }

      const response = await issuesAPI.getAll(params);
      setIssues(response.data.data);
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

    if (!title || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await issuesAPI.create({
        title,
        description,
        priority: priority as any,
        schoolId: "dummy-school-id", // This should come from user context
        raisedBy: "current-user-id", // This should come from user context
      });

      toast({
        title: "Success",
        description: "Issue created successfully",
      });

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setShowCreateForm(false);
      fetchIssues();
    } catch (error) {
      console.error("Error creating issue:", error);
      toast({
        title: "Error",
        description: "Failed to create issue",
        variant: "destructive",
      });
    }
  };

  const handleReviewIssue = async (issueId: string, action: string) => {
    try {
      let apiCall;

      switch (currentUserLevel) {
        case "BLOCK":
          apiCall = issuesAPI.reviewAtBlock(issueId, {
            action: action as any,
            remarks,
          });
          break;
        case "DISTRICT":
          apiCall = issuesAPI.reviewAtDistrict(issueId, {
            action: action as any,
            remarks,
          });
          break;
        case "STATE":
          apiCall = issuesAPI.reviewAtState(issueId, {
            action: action as any,
            remarks,
          });
          break;
        default:
          throw new Error("Invalid user level for review");
      }

      await apiCall;

      toast({
        title: "Success",
        description: `Issue ${action}${action.endsWith("e") ? "d" : "ed"} successfully`,
      });

      setRemarks("");
      setSelectedIssue(null);
      fetchIssues();
    } catch (error) {
      console.error("Error reviewing issue:", error);
      toast({
        title: "Error",
        description: "Failed to review issue",
        variant: "destructive",
      });
    }
  };

  const canReviewIssue = (issue: Issue) => {
    const statusLevelMap = {
      PENDING_BLOCK_REVIEW: "BLOCK",
      PENDING_DISTRICT_REVIEW: "DISTRICT",
      PENDING_STATE_REVIEW: "STATE",
    };

    return (
      statusLevelMap[issue.status as keyof typeof statusLevelMap] ===
      currentUserLevel
    );
  };

  const getStatusText = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const filteredIssues = issues.filter((issue) => {
    const statusMatch = statusFilter === "all" || issue.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || issue.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const IssueCard = ({ issue }: { issue: Issue }) => (
    <Card key={issue.id} className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
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

          <h3 className="font-semibold text-lg">{issue.title}</h3>
          <p className="text-gray-600 mb-2">{issue.description}</p>

          <div className="text-sm text-gray-500">
            <p>
              School: {issue.school.name} ({issue.school.udise})
            </p>
            <p>
              Block: {issue.school.block_name}, District:{" "}
              {issue.school.district}
            </p>
            <p>
              Created:{" "}
              {formatDistanceToNow(new Date(issue.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Issue Details - #{issue.issueId}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">{issue.title}</h4>
                  <p className="text-gray-600">{issue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <div>
                      <Badge className={priorityColors[issue.priority]}>
                        {issue.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div>
                      <Badge
                        className={
                          statusColors[
                            issue.status as keyof typeof statusColors
                          ]
                        }
                      >
                        {getStatusText(issue.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Show remarks history */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Review History</h4>
                  {issue.remarksByBlock && (
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium">
                        Block Level Remarks:
                      </p>
                      <p className="text-sm">{issue.remarksByBlock}</p>
                      {issue.reviewedByBlockAt && (
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(issue.reviewedByBlockAt),
                            { addSuffix: true },
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  {issue.remarksByDistrict && (
                    <div className="p-3 bg-purple-50 rounded">
                      <p className="text-sm font-medium">
                        District Level Remarks:
                      </p>
                      <p className="text-sm">{issue.remarksByDistrict}</p>
                      {issue.reviewedByDistrictAt && (
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(issue.reviewedByDistrictAt),
                            { addSuffix: true },
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  {issue.remarksByState && (
                    <div className="p-3 bg-indigo-50 rounded">
                      <p className="text-sm font-medium">
                        State Level Remarks:
                      </p>
                      <p className="text-sm">{issue.remarksByState}</p>
                      {issue.reviewedByStateAt && (
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(issue.reviewedByStateAt),
                            { addSuffix: true },
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {canReviewIssue(issue) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Review Issue - #{issue.issueId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{issue.title}</h4>
                    <p className="text-gray-600">{issue.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Remarks
                    </label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add your remarks or comments"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReviewIssue(issue.id, "reject")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    {currentUserLevel !== "STATE" && (
                      <Button
                        variant="secondary"
                        onClick={() => handleReviewIssue(issue.id, "escalate")}
                      >
                        <ArrowUp className="h-4 w-4 mr-1" />
                        Escalate
                      </Button>
                    )}
                    <Button
                      onClick={() => handleReviewIssue(issue.id, "resolve")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout
      title="Issues Management"
      description="Manage and track issues across different levels"
      adminLevel={`${currentUserLevel} ADMIN`}
    >
      <div className="space-y-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {currentUserLevel === "SCHOOL" && (
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Raise Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Raise New Issue</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateIssue} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
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
                        Description
                      </label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed description of the issue"
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
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Issue</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
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
                <div className="text-center py-8">Loading issues...</div>
              ) : filteredIssues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No issues found
                </div>
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
