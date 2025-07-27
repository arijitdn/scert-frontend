import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Building2,
  Users,
  School,
  ArrowRight,
  BarChart3,
  Shield,
  Clock,
} from "lucide-react";

export default function Index() {
  const adminLevels = [
    {
      title: "State Level Admin",
      description:
        "Manage books across all districts and oversee state-wide inventory",
      icon: Building2,
      path: "/admin/state",
      color: "text-blue-600",
    },
    {
      title: "District Level (DEO)",
      description:
        "District Education Officer - manage books for all blocks in district",
      icon: Users,
      path: "/admin/district",
      color: "text-green-600",
    },
    {
      title: "Block Level (IS)",
      description:
        "Institutional Supervisor - manage books for schools in your block",
      icon: School,
      path: "/admin/block",
      color: "text-purple-600",
    },
    {
      title: "School Level Admin",
      description: "Manage inventory and track books for your specific school",
      icon: BookOpen,
      path: "/admin/school",
      color: "text-orange-600",
    },
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Track inventory levels and usage patterns across all levels",
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Role-based permissions ensure proper access control",
    },
    {
      icon: Clock,
      title: "Efficient Management",
      description: "Streamlined workflows for book distribution and tracking",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Book Inventory
              <span className="text-primary block">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              A comprehensive platform for managing book distribution and
              inventory across state, district, block, and school levels with
              real-time tracking and analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Dashboards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Access Your Dashboard
          </h2>
          <p className="text-muted-foreground">
            Choose your administrative level to access the appropriate dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {adminLevels.map((admin, index) => {
            const Icon = admin.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-200 group"
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className={`h-8 w-8 ${admin.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{admin.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {admin.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={admin.path}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Access Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
