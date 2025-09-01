import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { requisitionWindowsAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequisitionWindow {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RequisitionWindow() {
  const [schoolStartDate, setSchoolStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [schoolClosingDate, setSchoolClosingDate] = useState<Date | undefined>(
    undefined,
  );
  const [districtStartDate, setDistrictStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [districtClosingDate, setDistrictClosingDate] = useState<
    Date | undefined
  >(undefined);
  const [blockStartDate, setBlockStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [blockClosingDate, setBlockClosingDate] = useState<Date | undefined>(
    undefined,
  );

  const [loading, setLoading] = useState(false);
  const [existingWindows, setExistingWindows] = useState<RequisitionWindow[]>(
    [],
  );

  const { toast } = useToast();

  const loadExistingWindows = async () => {
    try {
      const response = await requisitionWindowsAPI.getAll();
      if (response.data.success) {
        setExistingWindows(response.data.data);

        // Pre-fill form with existing data
        response.data.data.forEach((window: RequisitionWindow) => {
          const startDate = new Date(window.startDate);
          const endDate = new Date(window.endDate);

          switch (window.type) {
            case "SCHOOL":
              setSchoolStartDate(startDate);
              setSchoolClosingDate(endDate);
              break;
            case "DISTRICT":
              setDistrictStartDate(startDate);
              setDistrictClosingDate(endDate);
              break;
            case "BLOCK":
              setBlockStartDate(startDate);
              setBlockClosingDate(endDate);
              break;
          }
        });
      }
    } catch (error) {
      console.error("Error loading windows:", error);
    }
  };

  useEffect(() => {
    loadExistingWindows();
  }, []);

  const handleSave = async (
    type: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
  ) => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both start and end dates.",
      });
      return;
    }

    if (startDate >= endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Start date must be before end date.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await requisitionWindowsAPI.createOrUpdate({
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (response.data.success) {
        toast({
          title: "Success!",
          description: `${type} requisition window has been saved successfully.`,
        });
        loadExistingWindows(); // Reload to get updated data
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save requisition window.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWindowStatus = (type: string) => {
    const window = existingWindows.find((w) => w.type === type);
    if (!window) return { status: "none", message: "No window set" };

    const now = new Date();
    const start = new Date(window.startDate);
    const end = new Date(window.endDate);

    if (now < start) {
      return {
        status: "upcoming",
        message: `Opens on ${format(start, "PPP")}`,
      };
    } else if (now > end) {
      return { status: "closed", message: `Closed on ${format(end, "PPP")}` };
    } else {
      return { status: "open", message: `Open until ${format(end, "PPP")}` };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const DatePicker = ({
    date,
    setDate,
    label,
    disabled = false,
  }: {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    label: string;
    disabled?: boolean;
  }) => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal transition-all hover:bg-gray-50 min-h-[40px]",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {date ? format(date, "PPP") : "Pick a date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const WindowCard = ({
    title,
    type,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    onSave,
  }: {
    title: string;
    type: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    setStartDate: (date: Date | undefined) => void;
    setEndDate: (date: Date | undefined) => void;
    onSave: () => void;
  }) => {
    const status = getWindowStatus(type);

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              {title}
            </CardTitle>
            <Badge
              className={cn(
                "flex items-center gap-1 self-start sm:self-auto",
                getStatusColor(status.status),
              )}
            >
              {getStatusIcon(status.status)}
              <span className="whitespace-nowrap">
                {status.status === "none"
                  ? "Not Set"
                  : status.status.charAt(0).toUpperCase() +
                    status.status.slice(1)}
              </span>
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">{status.message}</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              label="Start Date"
              disabled={loading}
            />
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              label="End Date"
              disabled={loading}
            />
          </div>

          {startDate && endDate && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Window duration:{" "}
                {Math.ceil(
                  (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={onSave}
            disabled={loading || !startDate || !endDate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? "Saving..." : `Save ${title} Dates`}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout
      title="Requisition Window Management"
      description="Configure the active periods when Schools, Districts, and Blocks (IS) can submit requisitions."
    >
      <div className="space-y-6 lg:space-y-8">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-amber-800 text-sm sm:text-base">
            School, District, and Block (IS) requisition pages will only be
            accessible during their configured time windows. Users will see
            appropriate messages when windows are closed.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          <WindowCard
            title="School Requisitions"
            type="SCHOOL"
            startDate={schoolStartDate}
            endDate={schoolClosingDate}
            setStartDate={setSchoolStartDate}
            setEndDate={setSchoolClosingDate}
            onSave={() =>
              handleSave("SCHOOL", schoolStartDate, schoolClosingDate)
            }
          />

          <WindowCard
            title="District Requisitions"
            type="DISTRICT"
            startDate={districtStartDate}
            endDate={districtClosingDate}
            setStartDate={setDistrictStartDate}
            setEndDate={setDistrictClosingDate}
            onSave={() =>
              handleSave("DISTRICT", districtStartDate, districtClosingDate)
            }
          />

          <WindowCard
            title="Block (IS) Requisitions"
            type="BLOCK"
            startDate={blockStartDate}
            endDate={blockClosingDate}
            setStartDate={setBlockStartDate}
            setEndDate={setBlockClosingDate}
            onSave={() => handleSave("BLOCK", blockStartDate, blockClosingDate)}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
