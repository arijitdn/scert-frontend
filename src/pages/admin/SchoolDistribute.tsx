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
import { Plus, Edit2, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const classOptions = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];
const bookOptions = [
  "Maths for Class 3",
  "Science Explorer",
  "English Reader",
  "Hindi Basics",
];

// Add initial student counts for each class
const initialClassStudentCounts = classOptions.map((className) => ({
  className,
  studentCount: 0,
}));

type Distribution = {
  id: number;
  date: string;
  book: string;
  className: string;
  section: string;
  numBooks: number;
  udiseCode: string;
};

const initialDistributions: Distribution[] = [
  {
    id: 1,
    date: "2024-06-01",
    book: "Maths for Class 3",
    className: "Class 3",
    section: "A",
    numBooks: 2,
    udiseCode: "12345678901",
  },
  {
    id: 2,
    date: "2024-05-28",
    book: "Science Explorer",
    className: "Class 4",
    section: "B",
    numBooks: 1,
    udiseCode: "12345678902",
  },
];

export default function SchoolDistribute() {
  const [distributions, setDistributions] =
    useState<Distribution[]>(initialDistributions);
  const [book, setBook] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [numBooks, setNumBooks] = useState("");
  const [udiseCode, setUdiseCode] = useState("");
  const [responsible, setResponsible] = useState(false);
  // Remove all unused state and handler declarations for student counts

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !book ||
      !className ||
      !numBooks ||
      isNaN(Number(numBooks)) ||
      Number(numBooks) <= 0 ||
      !udiseCode
    )
      return;
    setDistributions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        date: new Date().toISOString().slice(0, 10),
        book,
        className,
        section,
        numBooks: Number(numBooks),
        udiseCode,
      },
    ]);
    setBook("");
    setClassName("");
    setSection("");
    setNumBooks("");
    setUdiseCode("");
  };

  // Handler for updating student count for a class
  // const handleStudentCountChange = (idx: number, value: string) => {
  //   const count = Math.max(0, parseInt(value) || 0);
  //   setClassStudentCounts((prev) =>
  //     prev.map((item, i) =>
  //       i === idx ? { ...item, studentCount: count } : item,
  //     ),
  //   );
  // };

  // Handler for toggling edit mode
  // const handleEditToggle = (idx: number) => {
  //   setEditModes((prev) => prev.map((mode, i) => (i === idx ? !mode : mode)));
  // };

  // Handler for saving (just disables edit mode)
  // const handleSave = (idx: number) => {
  //   setEditModes((prev) => prev.map((mode, i) => (i === idx ? false : mode)));
  // };

  // Handler for starting to add a new class
  // const handleAddClassStart = () => {
  //   setAddingClass(true);
  //   setNewClassName("");
  //   setNewClassCount(0);
  // };

  // Handler for saving a new class
  // const handleAddClassSave = () => {
  //   if (!newClassName.trim()) return;
  //   setClassStudentCounts((prev) => [
  //     ...prev,
  //     { className: newClassName.trim(), studentCount: newClassCount },
  //   ]);
  //   setEditModes((prev) => [...prev, false]);
  //   setAddingClass(false);
  //   setNewClassName("");
  //   setNewClassCount(0);
  // };

  // Handler for editing a newly added class
  // const handleEditNewClass = (idx: number) => {
  //   setEditModes((prev) => prev.map((mode, i) => (i === idx ? true : mode)));
  // };

  return (
    <AdminLayout
      title="Distribute Books"
      description="Record and view book distributions to students"
      adminLevel="SCHOOL ADMIN"
    >
      
      {/* Existing Distribute Books Card */}
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300 mb-8">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-900">
            Distribute Books
          </CardTitle>
          <CardDescription>Assign books to a class</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleAdd}>
            <Input
              placeholder="Book Name"
              value={book}
              onChange={(e) => setBook(e.target.value)}
              required
            />
            <Input
              placeholder="School UDISE Code"
              value={udiseCode}
              onChange={(e) => setUdiseCode(e.target.value)}
              required
            />
            <select
              className="border rounded px-3 py-2 bg-background"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            >
              <option value="">Select Class</option>
              {classOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <Input
              placeholder="Section (optional)"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-sm">
                Number of Books to Distribute
              </div>
              <Input
                type="number"
                min={1}
                placeholder="Enter number"
                value={numBooks}
                onChange={(e) => setNumBooks(e.target.value)}
                className="max-w-xs"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="responsible"
                checked={responsible}
                onCheckedChange={setResponsible}
              />
              <Label htmlFor="responsible" className="text-sm cursor-pointer">
                I am wholly responsible for submitting the report
              </Label>
            </div>
            <Button type="submit" disabled={!responsible}>
              Distribute
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            Past Distributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {distributions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No distributions found.
              </div>
            ) : (
              distributions.map((dist) => (
                <div
                  key={dist.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg bg-white mb-2"
                >
                  <div>
                    <div className="font-semibold">{dist.book}</div>
                    <div className="text-xs text-gray-500">
                      Class: {dist.className}{" "}
                      {dist.section && `| Section: ${dist.section}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      UDISE Code: {dist.udiseCode}
                    </div>
                    <div className="text-xs text-gray-500">
                      Date: {dist.date}
                    </div>
                  </div>
                  <span className="text-green-700 font-semibold">
                    Qty: {dist.numBooks}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
