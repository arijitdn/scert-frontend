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
import { AlertTriangle, CheckCircle } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const initialIssues = [
  {
    id: 1,
    title: "Books not received",
    description: "Books for Class 4 not received in time.",
    date: "2024-06-01",
    solved: false,
  },
  {
    id: 2,
    title: "Shortage of Science books",
    description: "Science books for Class 5 are short in the block.",
    date: "2024-05-28",
    solved: false,
  },
];

export default function BlockIssues() {
  const [issues, setIssues] = useState(initialIssues);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !recipient) return;
    setIssues((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title,
        description,
        date: new Date().toISOString().slice(0, 10),
        recipient,
        solved: false,
      },
    ]);
    setTitle("");
    setDescription("");
    setRecipient("");
  };

  return (
    <AdminLayout
      title="Issues"
      description="Raise and view issues for the state"
      adminLevel="INSTITUTIONAL SUPERVISOR"
    >
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300 mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-900">
            Create New Issue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleAdd}>
            <div>
              <div className="font-semibold mb-2">Send Issue To</div>
              <Select value={recipient} onValueChange={setRecipient} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose recipient..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STATE">State</SelectItem>
                  <SelectItem value="DEO">DEO</SelectItem>
                  <SelectItem value="School">School</SelectItem>
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
              Submit Issue
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-pink-100 to-pink-50 border-pink-300">
        <CardHeader>
          <CardTitle className="text-lg text-pink-900">Past Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No issues found.
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <div>
                    <div className="font-semibold">{issue.title}</div>
                    <div className="text-xs text-gray-500">
                      {issue.description}
                    </div>
                    {issue.recipient && (
                      <div className="text-xs text-blue-500 mt-1">
                        To: {issue.recipient}
                      </div>
                    )}
                  </div>
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
                        <SelectItem value="STATE">State</SelectItem>
                        <SelectItem value="DEO">DEO</SelectItem>
                        <SelectItem value="School">School</SelectItem>
                      </SelectContent>
                    </Select>
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
