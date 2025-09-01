import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RequisitionWindowStatusProps {
  isOpen: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  startDate?: Date;
  endDate?: Date;
  message: string;
  loading: boolean;
  error?: string;
  className?: string;
}

export const RequisitionWindowStatus = ({
  isOpen,
  hasStarted,
  hasEnded,
  startDate,
  endDate,
  message,
  loading,
  error,
  className,
}: RequisitionWindowStatusProps) => {
  if (loading) {
    return (
      <Alert className={cn("border-blue-200 bg-blue-50", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800">
          Checking requisition window status...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className={cn("border-red-200 bg-red-50", className)}>
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  const getStatus = () => {
    if (!hasStarted && startDate) {
      return {
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        badge: "Upcoming",
        badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
        alertClass: "border-yellow-200 bg-yellow-50",
        textClass: "text-yellow-800",
      };
    } else if (hasEnded) {
      return {
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        badge: "Closed",
        badgeClass: "bg-red-100 text-red-800 border-red-200",
        alertClass: "border-red-200 bg-red-50",
        textClass: "text-red-800",
      };
    } else if (isOpen) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        badge: "Open",
        badgeClass: "bg-green-100 text-green-800 border-green-200",
        alertClass: "border-green-200 bg-green-50",
        textClass: "text-green-800",
      };
    } else {
      return {
        icon: <AlertCircle className="h-4 w-4 text-gray-600" />,
        badge: "Not Available",
        badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
        alertClass: "border-gray-200 bg-gray-50",
        textClass: "text-gray-800",
      };
    }
  };

  const status = getStatus();

  return (
    <Alert className={cn(status.alertClass, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status.icon}
          <AlertDescription className={status.textClass}>
            <span className="font-medium">Requisition Window:</span> {message}
          </AlertDescription>
        </div>
        <Badge className={status.badgeClass}>{status.badge}</Badge>
      </div>

      {(startDate || endDate) && (
        <div className={cn("mt-2 text-sm", status.textClass)}>
          {startDate && (
            <div>
              <span className="font-medium">Opens:</span>{" "}
              {format(startDate, "PPP 'at' p")}
            </div>
          )}
          {endDate && (
            <div>
              <span className="font-medium">Closes:</span>{" "}
              {format(endDate, "PPP 'at' p")}
            </div>
          )}
        </div>
      )}
    </Alert>
  );
};
