import { useState, useEffect } from "react";
import { notificationsAPI } from "@/lib/api";

export interface Notification {
  id: string;
  notificationId: string;
  title: string;
  message: string;
  type:
    | "STOCK_ARRIVAL"
    | "REQUISITION_STATUS"
    | "SYSTEM_UPDATE"
    | "URGENT_NOTICE"
    | "INFO"
    | "WARNING"
    | "MAINTENANCE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  sentBy: string;
  sentFrom: "STATE" | "DISTRICT" | "BLOCK" | "SCHOOL";
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

interface UseNotificationsParams {
  userLevel: "STATE" | "DISTRICT" | "BLOCK" | "SCHOOL";
  userId: string;
  schoolId?: string;
  blockCode?: string;
  districtCode?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications({
  userLevel,
  userId,
  schoolId,
  blockCode,
  districtCode,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}: UseNotificationsParams) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        userLevel,
        userId,
        page: pageNum,
        limit: 20,
      };

      if (schoolId) params.schoolId = schoolId;
      if (blockCode) params.blockCode = blockCode;
      if (districtCode) params.districtCode = districtCode;

      const response = await notificationsAPI.getAll(params);

      if (response.data.success) {
        const newNotifications = response.data.data.notifications;

        if (reset || pageNum === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        const { pagination } = response.data.data;
        setHasMore(pageNum < pagination.totalPages);
      } else {
        setError("Failed to fetch notifications");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params: any = {
        userLevel,
        userId,
      };

      if (schoolId) params.schoolId = schoolId;
      if (blockCode) params.blockCode = blockCode;
      if (districtCode) params.districtCode = districtCode;

      const response = await notificationsAPI.getStats(params);

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notification stats:", err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId, {
        userId,
        userLevel,
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      // Refresh stats
      fetchStats();
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to mark notification as read",
      );
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchNotifications(1, true);
    fetchStats();
  };

  useEffect(() => {
    fetchNotifications(1, true);
    fetchStats();
  }, [userLevel, userId, schoolId, blockCode, districtCode]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [
    autoRefresh,
    refreshInterval,
    userLevel,
    userId,
    schoolId,
    blockCode,
    districtCode,
  ]);

  return {
    notifications,
    stats,
    loading,
    error,
    hasMore,
    markAsRead,
    loadMore,
    refresh,
  };
}
