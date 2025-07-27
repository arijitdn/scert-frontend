import { ReactNode } from "react";
import Navigation from "./Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  adminLevel?: ReactNode;
}

const AdminLayout = ({
  children,
  title,
  description,
  adminLevel,
}: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            {adminLevel && (
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">{adminLevel}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
