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
  Save,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import shortid from "shortid"; // Using shortid for dummy ID generation

export default function CreatePrivateSchool() {
  const [schoolName, setSchoolName] = useState("");
  const [udiseCode, setUdiseCode] = useState("");
  const [headmasterName, setHeadmasterName] = useState("");
  const [headmasterId, setHeadmasterId] = useState("");
  const [headmasterPassword, setHeadmasterPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [managedBy, setManagedBy] = useState("Private"); // Default for private schools
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const handleGenerateUdise = () => {
    setUdiseCode(`PRI-${shortid.generate().toUpperCase()}`); // Dummy UDISE-like ID
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this data to a backend API
    console.log("New Private School Data:", {
      schoolName,
      udiseCode,
      headmasterName,
      headmasterId,
      headmasterPassword,
      designation,
      email,
      phone,
      district,
      block,
      managedBy,
      category,
      type,
    });
    alert("Private School Added! (Check console for data)");
    // Reset form
    setSchoolName("");
    setUdiseCode("");
    setHeadmasterName("");
    setHeadmasterId("");
    setHeadmasterPassword("");
    setDesignation("");
    setEmail("");
    setPhone("");
    setDistrict("");
    setBlock("");
    setCategory("");
    setType("");
  };

  return (
    <AdminLayout
      title="Add Private School"
      description="Register a new private school and generate its UDISE code"
      adminLevel="DISTRICT ADMIN"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/30 shadow-lg">
                <AvatarImage src="/profile.png" alt="Profile" />
                <AvatarFallback>
                  <School className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-bold text-primary">
                <Input
                  placeholder="School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                  className="text-center text-2xl font-bold"
                />
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Input
                  placeholder="UDISE Code (Auto-generated)"
                  value={udiseCode}
                  readOnly
                  className="text-center"
                />
                <Button type="button" onClick={handleGenerateUdise} size="sm">
                  Generate
                </Button>
              </CardDescription>
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
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Block</p>
                  <Input
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Managed by</p>
                  <Input value={managedBy} readOnly />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Category</p>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Type</p>
                  <Input
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BadgeCheck className="w-6 h-6 text-orange-500" /> Contact Person
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <Input
                  value={headmasterName}
                  onChange={(e) => setHeadmasterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Designation
                </label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Login ID
                </label>
                <Input
                  value={headmasterId}
                  onChange={(e) => setHeadmasterId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  value={headmasterPassword}
                  onChange={(e) => setHeadmasterPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Private School
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
