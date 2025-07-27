import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const initialNotifications = [
  {
    id: 1,
    title: "Request for urgent books",
    message: "We need more Science books for Class 5.",
    date: "2024-06-01",
  },
  {
    id: 2,
    title: "Holiday Notice",
    message: "School will be closed on 10th June.",
    date: "2024-05-28",
  },
];

export default function SchoolNotificationsCreate() {
  const [notifications] = useState(initialNotifications);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !recipient) return;
    setNotifications((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title,
        message,
        date: new Date().toISOString().slice(0, 10),
        recipient,
      },
    ]);
    setTitle("");
    setMessage("");
    setRecipient("");
  };

  return (
    <AdminLayout
      title="Notifications"
      description="View notifications sent by State, DEO, or IS. School admins cannot create notifications."
      adminLevel="SCHOOL ADMIN"
    >
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-pink-100 to-pink-50 border-pink-300 mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-pink-900">Notifications</CardTitle>
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
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <div>
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-xs text-gray-500">{n.message}</div>
                    {n.recipient && (
                      <div className="text-xs text-blue-500 mt-1">
                        To: {n.recipient}
                      </div>
                    )}
                  </div>
                  <span className="text-pink-700 font-semibold">{n.date}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
