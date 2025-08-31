import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  School,
  User,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";

const dummyIssues = [
  {
    id: 1,
    source: "IS",
    title: "Books not received",
    description: "Books for Class 4 not received in time.",
    date: "2024-06-01",
    solved: false,
  },
  {
    id: 2,
    source: "DEO",
    title: "Shortage of Science books",
    description: "Science books for Class 5 are short in Mumbai district.",
    date: "2024-05-28",
    solved: false,
  },
  {
    id: 3,
    source: "Private School",
    title: "Damaged books received",
    description: "Some books received were damaged.",
    date: "2024-05-25",
    solved: true,
  },
];

const sourceIcons = {
  IS: <User className="h-4 w-4 text-blue-500" />,
  DEO: <Building2 className="h-4 w-4 text-green-500" />,
  "Private School": <School className="h-4 w-4 text-pink-500" />,
};

const recipientOptions = [
  { label: "District Education Officer (DEO)", value: "DEO" },
  { label: "Inspection Staff (IS)", value: "IS" },
  { label: "State", value: "STATE" },
];

export default function PrivateSchoolIssues() {
  const [issues, setIssues] = useState(dummyIssues);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleRaiseIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !recipient) return;
    setIssues((prev) => [
      {
        id: prev.length + 1,
        source: "Private School",
        title,
        description,
        date: new Date().toISOString().slice(0, 10),
        solved: false,
        recipient,
      },
      ...prev,
    ]);
    setTitle("");
    setDescription("");
    setRecipient("");
  };

  return (
    <AdminLayout
      title="Private School Issues"
      description="Raise an issue and send it to DEO, IS, or State. View previously raised issues for your private school."
      adminLevel={null}
    >
      {/* Raise Issue Form */}
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300 mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-900">
            Raise a New Issue
          </CardTitle>
          <CardDescription>
            Fill the form to raise an issue and select the recipient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleRaiseIssue}>
            <div>
              <div className="font-semibold mb-2">Send Issue To</div>
              <Select value={recipient} onValueChange={setRecipient} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose recipient..." />
                </SelectTrigger>
                <SelectContent>
                  {recipientOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {recipient === "" && (
                <div className="text-xs text-red-500 mt-2">
                  Please select a recipient.
                </div>
              )}
            </div>
            <Input
              placeholder="Issue Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Button type="submit" disabled={!recipient}>
              Raise Issue
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* List of Issues Raised by Private School */}
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-100 to-pink-50 border-purple-300">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900">
            Your Raised Issues
          </CardTitle>
          <CardDescription>All issues you have raised</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No issues found.
              </div>
            ) : (
              issues
                .filter((issue) => issue.source === "Private School")
                .map((issue) => (
                  <div
                    key={issue.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg shadow-md border ${
                      issue.solved
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-green-300"
                        : "bg-gradient-to-r from-yellow-50 to-pink-50 border-pink-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2 md:mb-0">
                      {sourceIcons[issue.source as keyof typeof sourceIcons]}
                      <div>
                        <div className="font-semibold text-lg">
                          {issue.title}
                        </div>
                        <div className="text-sm text-gray-700">
                          {issue.description}
                        </div>
                        <div className="text-xs text-gray-400">
                          Sent to {issue.recipient} on {issue.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setIssues(
                              issues.map((i) =>
                                i.id === issue.id ? { ...i, solved: !i.solved } : i
                              )
                            )
                          }
                        >
                          {issue.solved ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="ml-2">
                            {issue.solved ? "Solved" : "Pending"}
                          </span>
                        </Button>
                        <Select
                          onValueChange={(value) =>
                            setIssues(
                              issues.map((i) =>
                                i.id === issue.id
                                  ? { ...i, recipient: value }
                                  : i
                              )
                            )
                          }
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Forward to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {recipientOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}