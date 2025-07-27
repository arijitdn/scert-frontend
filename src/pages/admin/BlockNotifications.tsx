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
import { Bell, FilePlus2, Info } from "lucide-react";

const dummyNotifications = [
  {
    id: 1,
    type: "Requisition Status",
    message: "School requisition for Maths for Class 3 is pending approval.",
    date: "2024-06-02",
    read: false,
  },
  {
    id: 2,
    type: "School Request",
    message: "New request from Green Valley School.",
    date: "2024-06-01",
    read: false,
  },
  {
    id: 3,
    type: "Info",
    message: "Block meeting scheduled for 7th June.",
    date: "2024-05-30",
    read: true,
  },
];

const typeIcons = {
  "School Request": <FilePlus2 className="h-4 w-4 text-blue-500" />,
  "Requisition Status": <FilePlus2 className="h-4 w-4 text-green-500" />,
  Info: <Info className="h-4 w-4 text-yellow-500" />,
};

export default function BlockNotifications() {
  const [notifications, setNotifications] = useState(dummyNotifications);

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <AdminLayout
      title="Notifications"
      description="Stay updated with the latest requisition status, school requests, and more"
      adminLevel="INSTITUTIONAL SUPERVISOR"
    >
      <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-purple-100 to-pink-50 border-purple-300">
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
