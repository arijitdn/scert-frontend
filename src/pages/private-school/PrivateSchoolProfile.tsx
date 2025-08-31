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

export default function PrivateSchoolProfile() {
  const [editing, setEditing] = useState(false);
  const [headmasterName, setHeadmasterName] = useState("Private School Admin");
  const [headmasterId, setHeadmasterId] = useState("PS12345");
  const [headmasterPassword, setHeadmasterPassword] = useState("password123");
  const [designation, setDesignation] = useState("Principal");
  const [email, setEmail] = useState("admin@privateschool.com");
  const [phone, setPhone] = useState("+91 99887 76655");
  const [tempName, setTempName] = useState(headmasterName);
  const [tempId, setTempId] = useState(headmasterId);
  const [tempPassword, setTempPassword] = useState(headmasterPassword);
  const [tempDesignation, setTempDesignation] = useState(designation);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);

  const [editingSchoolDetails, setEditingSchoolDetails] = useState(false);
  const [district, setDistrict] = useState("WEST TRIPURA");
  const [block, setBlock] = useState("AGARTALA MUNICIPAL COORPORATION");
  const [managedBy, setManagedBy] = useState("Private");
  const [category, setCategory] = useState("Private Unaided");
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
      title="Private School Profile"
      description="Manage private school and contact person details"
      adminLevel={null}
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
                Private School Name
              </CardTitle>
              <CardDescription>Udise Code: 1601010000</CardDescription>
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

          {/* Removed Class Enrollment section as it's not relevant for private schools in this context */}
        </div>
      </div>
    </AdminLayout>
  );
}