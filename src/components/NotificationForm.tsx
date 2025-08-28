import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { notificationsAPI } from "@/lib/api";
import { getCurrentUser } from "@/lib/user";
import { Loader2, Send, AlertCircle } from "lucide-react";

interface NotificationFormProps {
  onNotificationSent?: () => void;
}

export default function NotificationForm({
  onNotificationSent,
}: NotificationFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<string>("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [targetLevel, setTargetLevel] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const user = getCurrentUser();

  const getAvailableTargets = () => {
    switch (user.level) {
      case "STATE":
        return [
          { value: "districts", label: "All Districts" },
          { value: "blocks", label: "All Blocks" },
          { value: "schools", label: "All Schools" },
        ];
      case "DISTRICT":
        return [
          { value: "blocks", label: "All Blocks in District" },
          { value: "schools", label: "All Schools in District" },
        ];
      case "BLOCK":
        return [{ value: "schools", label: "All Schools in Block" }];
      default:
        return [];
    }
  };

  const calculateExpiryDate = (daysFromNow: string) => {
    if (!daysFromNow) return null;
    const days = parseInt(daysFromNow);
    if (isNaN(days)) return null;

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim() || !type || !targetLevel) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notificationData = {
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
        sentBy: user.id,
        sentFrom: user.level,
        targetSchools: targetLevel === "schools",
        targetBlocks: targetLevel === "blocks",
        targetDistricts: targetLevel === "districts",
        targetStates: false,
        expiresAt: calculateExpiryDate(expiresIn),
      };

      await notificationsAPI.create(notificationData);

      setSuccess(true);
      setTitle("");
      setMessage("");
      setType("");
      setPriority("MEDIUM");
      setTargetLevel("");
      setExpiresIn("");

      if (onNotificationSent) {
        onNotificationSent();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const availableTargets = getAvailableTargets();

  if (availableTargets.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto mb-8 bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>You don't have permission to send notifications.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300">
      <CardHeader>
        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
          <Send className="h-5 w-5" />
          Create New Notification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md">
            <p className="text-green-800 text-sm font-medium">
              Notification sent successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STOCK_ARRIVAL">Stock Arrival</SelectItem>
                  <SelectItem value="REQUISITION_STATUS">
                    Requisition Status
                  </SelectItem>
                  <SelectItem value="SYSTEM_UPDATE">System Update</SelectItem>
                  <SelectItem value="URGENT_NOTICE">Urgent Notice</SelectItem>
                  <SelectItem value="INFO">Information</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To *
              </label>
              <Select value={targetLevel} onValueChange={setTargetLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  {availableTargets.map((target) => (
                    <SelectItem key={target.value} value={target.value}>
                      {target.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires After (days)
              </label>
              <Input
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                placeholder="e.g., 7"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              type="submit"
              disabled={
                loading ||
                !title.trim() ||
                !message.trim() ||
                !type ||
                !targetLevel
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>

            {priority === "URGENT" && (
              <Badge variant="destructive" className="ml-2">
                URGENT
              </Badge>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
