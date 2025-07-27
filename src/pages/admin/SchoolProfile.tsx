import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  BadgeCheck,
  Lock,
  School,
  Building2,
  ShieldCheck,
  Edit2,
  Save,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SchoolProfile() {
  const [editing, setEditing] = useState(false);
  const [headmasterName, setHeadmasterName] = useState("Amit Verma");
  const [headmasterId, setHeadmasterId] = useState("HM12345");
  const [headmasterPassword, setHeadmasterPassword] = useState("password123");
  const [designation, setDesignation] = useState("Headmaster");
  const [email, setEmail] = useState("amit.verma@sunrise.edu.in");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [tempName, setTempName] = useState(headmasterName);
  const [tempId, setTempId] = useState(headmasterId);
  const [tempPassword, setTempPassword] = useState(headmasterPassword);
  const [tempDesignation, setTempDesignation] = useState(designation);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);

  // Dummy data for class student counts
  const initialClassStudentCounts = [
    { className: "Class 1", studentCount: 30 },
    { className: "Class 2", studentCount: 28 },
    { className: "Class 3", studentCount: 32 },
    { className: "Class 4", studentCount: 27 },
    { className: "Class 5", studentCount: 25 },
  ];
  const [classStudentCounts, setClassStudentCounts] = useState(
    initialClassStudentCounts,
  );
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [addingClass, setAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCount, setNewClassCount] = useState(0);

  const [editingSchoolDetails, setEditingSchoolDetails] = useState(false);
  const [district, setDistrict] = useState("WEST TRIPURA");
  const [block, setBlock] = useState("AGARTALA MUNICIPAL COORPORATION");
  const [managedBy, setManagedBy] = useState("State Govt. Managed");
  const [category, setCategory] = useState("Pr. with Up.Pr. sec. and H.Sec.");
  const [type, setType] = useState("Co-ed");
  const [tempDistrict, setTempDistrict] = useState(district);
  const [tempBlock, setTempBlock] = useState(block);
  const [tempManagedBy, setTempManagedBy] = useState(managedBy);
  const [tempCategory, setTempCategory] = useState(category);
  const [tempType, setTempType] = useState(type);

  const handleEdit = () => {
    setTempName(headmasterName);
    setTempId(headmasterId);
    setTempPassword(headmasterPassword);
    setTempDesignation(designation);
    setTempEmail(email);
    setTempPhone(phone);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = () => {
    setHeadmasterName(tempName);
    setHeadmasterId(tempId);
    setHeadmasterPassword(tempPassword);
    setDesignation(tempDesignation);
    setEmail(tempEmail);
    setPhone(tempPhone);
    setEditing(false);
  };

  // Rename the handlers for the student/class table to avoid conflict
  const handleClassEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(classStudentCounts[idx].studentCount);
  };
  const handleClassSave = (idx: number) => {
    setClassStudentCounts((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, studentCount: editValue } : item,
      ),
    );
    setEditIdx(null);
  };
  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    setClassStudentCounts((prev) => [
      ...prev,
      { className: newClassName.trim(), studentCount: newClassCount },
    ]);
    setNewClassName("");
    setNewClassCount(0);
    setAddingClass(false);
  };

  const handleEditSchoolDetails = () => {
    setTempDistrict(district);
    setTempBlock(block);
    setTempManagedBy(managedBy);
    setTempCategory(category);
    setTempType(type);
    setEditingSchoolDetails(true);
  };
  const handleCancelSchoolDetails = () => {
    setEditingSchoolDetails(false);
  };
  const handleSaveSchoolDetails = () => {
    setDistrict(tempDistrict);
    setBlock(tempBlock);
    setManagedBy(tempManagedBy);
    setCategory(tempCategory);
    setType(tempType);
    setEditingSchoolDetails(false);
  };

  return (
    <AdminLayout
      title="School Profile"
      description="Manage school and contact person details"
      adminLevel="SCHOOL ADMIN"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/30 shadow-lg">
                <AvatarImage src="/profile.png" alt="Profile" />
                <AvatarFallback>
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold text-primary">
                Umakanta Academy
              </CardTitle>
              <CardDescription>Udise Code: 1601010003</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <School className="w-6 h-6 text-orange-500" /> School Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">District</p>
                  {editingSchoolDetails ? (
                    <Input
                      value={tempDistrict}
                      onChange={(e) => setTempDistrict(e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground">{district}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Block</p>
                  {editingSchoolDetails ? (
                    <Input
                      value={tempBlock}
                      onChange={(e) => setTempBlock(e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground">{block}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Managed by</p>
                  {editingSchoolDetails ? (
                    <Input
                      value={tempManagedBy}
                      onChange={(e) => setTempManagedBy(e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground">{managedBy}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Category</p>
                  {editingSchoolDetails ? (
                    <Input
                      value={tempCategory}
                      onChange={(e) => setTempCategory(e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground">{category}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Type</p>
                  {editingSchoolDetails ? (
                    <Input
                      value={tempType}
                      onChange={(e) => setTempType(e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground">{type}</p>
                  )}
                </div>
              </div>
              {editingSchoolDetails ? (
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSaveSchoolDetails} className="w-full">
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancelSchoolDetails}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  className="mt-4 w-full"
                  onClick={handleEditSchoolDetails}
                >
                  Edit School Details
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BadgeCheck className="w-6 h-6 text-orange-500" /> Contact
                Person
              </CardTitle>
              {editing ? (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              ) : (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                {editing ? (
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                  />
                ) : (
                  <p>{headmasterName}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Designation
                </label>
                {editing ? (
                  <Input
                    value={tempDesignation}
                    onChange={(e) => setTempDesignation(e.target.value)}
                  />
                ) : (
                  <p>{designation}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                {editing ? (
                  <Input
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                  />
                ) : (
                  <p>{email}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                {editing ? (
                  <Input
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                  />
                ) : (
                  <p>{phone}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Password
                </label>
                {editing ? (
                  <Input
                    type="password"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                  />
                ) : (
                  <p>••••••••</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <School className="w-6 h-6 text-orange-500" /> Class Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg bg-white">
                  <thead>
                    <tr className="bg-orange-100">
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Students
                      </th>
                      <th className="px-4 py-3 w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudentCounts.map((cls, idx) => (
                      <tr
                        key={cls.className}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-2">{cls.className}</td>
                        <td className="px-4 py-2">
                          {editIdx === idx ? (
                            <Input
                              type="number"
                              min={0}
                              value={editValue}
                              onChange={(e) =>
                                setEditValue(
                                  Math.max(0, parseInt(e.target.value) || 0),
                                )
                              }
                              className="w-24 h-8"
                            />
                          ) : (
                            cls.studentCount
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {editIdx === idx ? (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleClassSave(idx)}
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleClassEdit(idx)}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {addingClass && (
                      <tr>
                        <td className="px-4 py-2">
                          <Input
                            placeholder="Class Name"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            className="w-32 h-8"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min={0}
                            value={newClassCount}
                            onChange={(e) =>
                              setNewClassCount(
                                Math.max(0, parseInt(e.target.value) || 0),
                              )
                            }
                            className="w-24 h-8"
                          />
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button size="sm" onClick={handleAddClass}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAddingClass(false)}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {!addingClass && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setAddingClass(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Class
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
