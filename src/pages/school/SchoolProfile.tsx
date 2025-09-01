import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  User,
  Phone,
  BadgeCheck,
  School,
  Building2,
  Edit2,
  Save,
  Plus,
  Loader2,
  Trash2,
  AlertCircle,
  Users,
  MapPin,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchoolData } from "@/hooks/useSchoolData";
import { CLASS_OPTIONS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SchoolProfile() {
  const SCHOOL_UDISE = "16010100108"; // The specific UDISE we want to show

  const {
    school,
    enrollments,
    loading,
    error,
    updateEnrollment,
    deleteEnrollment,
    refreshData,
  } = useSchoolData({ udise: SCHOOL_UDISE });

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

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number | undefined>();
  const [addingClass, setAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCount, setNewClassCount] = useState<number>();
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

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

  // Class enrollment handlers
  const handleClassEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(enrollments[idx].students);
  };

  const handleClassSave = async (idx: number) => {
    if (!enrollments[idx] || !editValue || editValue <= 0) return;

    setEnrollmentLoading(true);
    const success = await updateEnrollment(enrollments[idx].class, editValue);
    if (success) {
      setEditIdx(null);
    }
    setEnrollmentLoading(false);
  };

  const handleClassCancel = () => {
    setEditIdx(null);
  };

  const handleAddClass = async () => {
    if (!newClassName.trim() || !newClassCount || newClassCount <= 0) return;

    setEnrollmentLoading(true);
    const success = await updateEnrollment(newClassName.trim(), newClassCount);
    if (success) {
      setAddingClass(false);
      setNewClassName("");
      setNewClassCount(undefined);
    }
    setEnrollmentLoading(false);
  };

  // Get unused class options
  const getUnusedClassOptions = () => {
    const existingClasses = enrollments.map((e) => e.class);
    return CLASS_OPTIONS.filter(
      (classOption) => !existingClasses.includes(classOption),
    );
  };

  const handleDeleteClass = async (enrollmentId: string) => {
    if (confirm("Are you sure you want to delete this class enrollment?")) {
      setEnrollmentLoading(true);
      await deleteEnrollment(enrollmentId);
      setEnrollmentLoading(false);
    }
  };

  const totalStudents = enrollments.reduce(
    (sum, enrollment) => sum + enrollment.students,
    0,
  );

  if (loading) {
    return (
      <AdminLayout
        title="School Profile"
        description="Manage your school information and class enrollments"
        adminLevel="SCHOOL ADMIN"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading school data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="School Profile"
        description="Manage your school information and class enrollments"
        adminLevel="SCHOOL ADMIN"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading School Data
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="School Profile"
      description="Manage your school information and class enrollments"
      adminLevel="SCHOOL ADMIN"
    >
      <div className="space-y-8">
        {/* School Information Card */}
        <Card className="bg-gradient-to-br from-blue-100 to-purple-50 border-blue-300">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
              <School className="h-5 w-5" />
              School Information
            </CardTitle>
            <CardDescription>
              Basic information about {school?.name || "your school"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <School className="h-4 w-4" />
                  School Name
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.name || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  UDISE Code
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.udise || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  District
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.district || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Block
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.block_name || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Management
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.management || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.category || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Type
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.type || "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Students
                </label>
                <p className="text-lg font-semibold text-blue-600">
                  {totalStudents}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Classes
                </label>
                <p className="text-lg font-semibold text-green-600">
                  {enrollments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card className="bg-gradient-to-br from-green-100 to-blue-50 border-green-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                School administrator contact details
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={editing ? handleCancel : handleEdit}
              className="flex items-center gap-2"
            >
              {editing ? (
                <>Cancel</>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Headmaster Name
                  </label>
                  {editing ? (
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">
                      {headmasterName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  {editing ? (
                    <Input
                      value={tempDesignation}
                      onChange={(e) => setTempDesignation(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">{designation}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  {editing ? (
                    <Input
                      type="email"
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">{email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Admin ID
                  </label>
                  {editing ? (
                    <Input
                      value={tempId}
                      onChange={(e) => setTempId(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">{headmasterId}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  {editing ? (
                    <Input
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">{phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  {editing ? (
                    <Input
                      type="password"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-lg text-gray-900">••••••••</p>
                  )}
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Enrollments Card */}
        <Card className="bg-gradient-to-br from-purple-100 to-pink-50 border-purple-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Class Enrollments
              </CardTitle>
              <CardDescription>
                Manage student count for each class - this determines your
                requisition limits
              </CardDescription>
            </div>
            <Button
              onClick={() => setAddingClass(true)}
              size="sm"
              className="flex items-center gap-2"
              disabled={
                addingClass ||
                enrollmentLoading ||
                getUnusedClassOptions().length === 0
              }
            >
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </CardHeader>
          <CardContent>
            {enrollmentLoading && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-blue-700">
                  Updating enrollments...
                </span>
              </div>
            )}

            <div className="space-y-4">
              {addingClass && (
                <div className="flex gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Select value={newClassName} onValueChange={setNewClassName}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUnusedClassOptions().map((classOption) => (
                        <SelectItem key={classOption} value={classOption}>
                          {classOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Student count"
                    value={newClassCount ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewClassCount(
                        value === "" ? undefined : parseInt(value),
                      );
                    }}
                    min="1"
                    className="w-32"
                  />
                  <Button
                    onClick={handleAddClass}
                    disabled={
                      !newClassName.trim() ||
                      !newClassCount ||
                      newClassCount <= 0 ||
                      enrollmentLoading
                    }
                    size="sm"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setAddingClass(false);
                      setNewClassName("");
                      setNewClassCount(undefined);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {enrollments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    No class enrollments found
                  </p>
                  <p className="text-sm">
                    Add class enrollments to enable book requisitions
                  </p>
                </div>
              ) : getUnusedClassOptions().length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">
                    All available classes (Class 1 - Class 12) have been added
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-purple-200">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="border border-purple-200 px-4 py-2 text-left text-purple-900 font-semibold">
                          Class
                        </th>
                        <th className="border border-purple-200 px-4 py-2 text-left text-purple-900 font-semibold">
                          Students
                        </th>
                        <th className="border border-purple-200 px-4 py-2 text-center text-purple-900 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment, idx) => (
                        <tr
                          key={enrollment.id}
                          className="bg-white hover:bg-purple-50"
                        >
                          <td className="border border-purple-200 px-4 py-2 font-medium">
                            {enrollment.class}
                          </td>
                          <td className="border border-purple-200 px-4 py-2">
                            {editIdx === idx ? (
                              <Input
                                type="number"
                                value={editValue ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEditValue(
                                    value === "" ? undefined : parseInt(value),
                                  );
                                }}
                                min="1"
                                className="w-24"
                                placeholder="Students"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold">
                                {enrollment.students}
                              </span>
                            )}
                          </td>
                          <td className="border border-purple-200 px-4 py-2 text-center">
                            {editIdx === idx ? (
                              <div className="flex gap-1 justify-center">
                                <Button
                                  onClick={() => handleClassSave(idx)}
                                  size="sm"
                                  disabled={
                                    enrollmentLoading ||
                                    !editValue ||
                                    editValue <= 0
                                  }
                                >
                                  {enrollmentLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Save className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  onClick={handleClassCancel}
                                  variant="outline"
                                  size="sm"
                                  disabled={enrollmentLoading}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-center">
                                <Button
                                  onClick={() => handleClassEdit(idx)}
                                  variant="outline"
                                  size="sm"
                                  disabled={enrollmentLoading}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleDeleteClass(enrollment.id)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  disabled={enrollmentLoading}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {enrollments.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Requisition Guidelines:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • The number of students in each class determines the
                      maximum books you can requisition
                    </li>
                    <li>
                      • You cannot request more books than the enrolled student
                      count for any subject
                    </li>
                    <li>
                      • Update enrollments regularly to ensure accurate
                      requisition limits
                    </li>
                    <li>
                      • Total students across all classes:{" "}
                      <strong>{totalStudents}</strong>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
