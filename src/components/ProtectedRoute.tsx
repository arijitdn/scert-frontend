import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// Removed AuthContext
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: (
    | "STATE"
    | "DISTRICT"
    | "BLOCK"
    | "SCHOOL"
    | "PRIVATE_SCHOOL"
  )[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  // Auth removed
  const location = useLocation();

  // Auth removed: always redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
