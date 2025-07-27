import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RequisitionWindow() {
  const [schoolStartDate, setSchoolStartDate] = useState<Date | undefined>(undefined);
  const [schoolClosingDate, setSchoolClosingDate] = useState<Date | undefined>(undefined);
  const [deoStartDate, setDeoStartDate] = useState<Date | undefined>(undefined);
  const [deoClosingDate, setDeoClosingDate] = useState<Date | undefined>(undefined);
  const [isStartDate, setIsStartDate] = useState<Date | undefined>(undefined);
  const [isClosingDate, setIsClosingDate] = useState<Date | undefined>(undefined);

  const { toast } = useToast();

  const handleSaveSchool = () => {
    console.log("Saving School Requisition Dates:", {
      schoolStartDate,
      schoolClosingDate,
    });
    // Here you would typically send this data to your backend API
    toast({
      title: "School Requisition Dates Saved!",
      description: `Start: ${schoolStartDate ? format(schoolStartDate, "PPP") : "N/A"}, Closing: ${schoolClosingDate ? format(schoolClosingDate, "PPP") : "N/A"}`,
    });
  };

  const handleSaveDeo = () => {
    console.log("Saving DEO Requisition Dates:", {
      deoStartDate,
      deoClosingDate,
    });
    // Here you would typically send this data to your backend API
    toast({
      title: "DEO Requisition Dates Saved!",
      description: `Start: ${deoStartDate ? format(deoStartDate, "PPP") : "N/A"}, Closing: ${deoClosingDate ? format(deoClosingDate, "PPP") : "N/A"}`,
    });
  };

  const handleSaveIs = () => {
    console.log("Saving IS Requisition Dates:", {
      isStartDate,
      isClosingDate,
    });
    // Here you would typically send this data to your backend API
    toast({
      title: "IS Requisition Dates Saved!",
      description: `Start: ${isStartDate ? format(isStartDate, "PPP") : "N/A"}, Closing: ${isClosingDate ? format(isClosingDate, "PPP") : "N/A"}`,
    });
  };

  const DatePicker = ({ date, setDate, label }: { date: Date | undefined, setDate: (date: Date | undefined) => void, label: string }) => (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
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

  return (
    <AdminLayout
      title="Requisition Window Management"
      description="Set start and closing dates for requisition periods for different entities."
    >
      <div className="space-y-8">
        {/* School Requisition Window */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-4">School Requisition Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker date={schoolStartDate} setDate={setSchoolStartDate} label="Start Date" />
              <DatePicker date={schoolClosingDate} setDate={setSchoolClosingDate} label="Closing Date" />
            </div>
            <Button onClick={handleSaveSchool} className="mt-6 w-full md:w-auto">Save School Dates</Button>
          </CardContent>
        </Card>

        {/* DEO Requisition Window */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-4">IS Requisition Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker date={deoStartDate} setDate={setDeoStartDate} label="Start Date" />
              <DatePicker date={deoClosingDate} setDate={setDeoClosingDate} label="Closing Date" />
            </div>
            <Button onClick={handleSaveDeo} className="mt-6 w-full md:w-auto">Save DEO Dates</Button>
          </CardContent>
        </Card>

        {/* IS Requisition Window */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold mb-4">DEO Requisition Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker date={isStartDate} setDate={setIsStartDate} label="Start Date" />
              <DatePicker date={isClosingDate} setDate={setIsClosingDate} label="Closing Date" />
            </div>
            <Button onClick={handleSaveIs} className="mt-6 w-full md:w-auto">Save IS Dates</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
