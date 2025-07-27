import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Package, FilePlus2, Info } from "lucide-react";

const dummyNotifications = [
  {
    id: 1,
    type: "Stock Arrival",
    message: "New stock of Class 4 Science books received.",
    date: "2024-06-02",
    read: false,
  },
  {
    id: 2,
    type: "Request",
    message: "New requisition request from Pune District.",
    date: "2024-06-01",
    read: false,
  },
  {
    id: 3,
    type: "Info",
    message: "System maintenance scheduled for 5th June.",
    date: "2024-05-30",
    read: true,
  },
  {
    id: 4,
    type: "Stock Arrival",
    message: "Books for Class 1 English entered state warehouse.",
    date: "2024-05-28",
    read: true,
  },
];

const typeIcons = {
  "Stock Arrival": <Package className="h-4 w-4 text-green-500" />,
  Request: <FilePlus2 className="h-4 w-4 text-blue-500" />,
  Info: <Info className="h-4 w-4 text-yellow-500" />,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !type || !message) return;
    setNotifications((prev) => [
      {
        id: prev.length + 1,
        type,
        message,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        recipient,
      },
      ...prev,
    ]);
    setRecipient("");
    setType("");
    setMessage("");
  };

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <AdminLayout
      title="Notifications"
      description="Stay updated with the latest requests, stock arrivals, and more"
      adminLevel="STATE ADMIN"
    >
      {/* Create Notification Form */}
      <Card className="w-full max-w-4xl mx-auto mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            Create New Notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleAdd}>
            <div>
              <div className="font-semibold mb-2">Send Notification To</div>
              <Select value={recipient} onValueChange={setRecipient} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose recipient..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IS">IS</SelectItem>
                  <SelectItem value="DEO">DEO</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                </SelectContent>
              </Select>
              {recipient === "" && (
                <div className="text-xs text-red-500 mt-2">
                  Please select a recipient.
                </div>
              )}
            </div>
            <Input
              placeholder="Notification Type (e.g. Stock Arrival, Request, Info)"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
            <Input
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
              disabled={!recipient || !type || !message}
            >
              Send Notification
            </button>
          </form>
        </CardContent>
      </Card>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {notifications.length}
            </div>
            <p className="text-xs text-blue-700">in last 1 month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {notifications.filter((n) => !n.read).length}
            </div>
            <p className="text-xs text-green-700">pending notifications</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {notifications.filter((n) => n.read).length}
            </div>
            <p className="text-xs text-yellow-700">read notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-100 to-pink-50 border-purple-300">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900">
            Recent Notifications
          </CardTitle>
          <CardDescription>
            All notifications from the last month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No notifications found.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg shadow-md border gap-2 ${
                    n.read
                      ? "bg-gradient-to-r from-green-50 to-green-100 border-green-300"
                      : "bg-gradient-to-r from-yellow-50 to-pink-50 border-pink-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2 md:mb-0">
                    {typeIcons[n.type as keyof typeof typeIcons]}
                    <div>
                      <div className="font-semibold text-lg">{n.type}</div>
                      <div className="text-sm text-gray-700">{n.message}</div>
                      <div className="text-xs text-gray-400">{n.date}</div>
                      {n.recipient && (
                        <div className="text-xs text-blue-500 mt-1">
                          To: {n.recipient}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!n.read && (
                      <button
                        className="bg-blue-200 text-blue-900 px-4 py-1 rounded font-semibold hover:bg-blue-300"
                        onClick={() => handleMarkRead(n.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                    {n.read && (
                      <Badge
                        variant="secondary"
                        className="bg-green-200 text-green-900"
                      >
                        Read
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
