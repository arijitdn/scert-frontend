import { useState, useEffect } from "react";
import { requisitionWindowsAPI } from "@/lib/api";

interface WindowStatus {
  isOpen: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  startDate?: Date;
  endDate?: Date;
  message: string;
  loading: boolean;
  error?: string;
}

/**
 * Hook to check requisition window status for SCHOOL, DISTRICT, and BLOCK user types.
 * Note: STATE users should NOT be restricted by windows as they manage them.
 * This hook supports: SCHOOL, DISTRICT, BLOCK user types only.
 */
export const useRequisitionWindow = (
  userType: "SCHOOL" | "BLOCK" | "DISTRICT" | "STATE",
) => {
  const [status, setStatus] = useState<WindowStatus>({
    isOpen: false,
    hasStarted: false,
    hasEnded: false,
    message: "Checking requisition window status...",
    loading: true,
  });

  useEffect(() => {
    const checkWindowStatus = async () => {
      try {
        setStatus((prev) => ({ ...prev, loading: true, error: undefined }));

        const response = await requisitionWindowsAPI.checkStatus(userType);

        if (response.data.success) {
          const { isOpen, hasStarted, hasEnded, startDate, endDate, message } =
            response.data.data;

          setStatus({
            isOpen,
            hasStarted,
            hasEnded,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            message,
            loading: false,
          });
        } else {
          setStatus({
            isOpen: false,
            hasStarted: false,
            hasEnded: false,
            message: "Unable to check requisition window status",
            loading: false,
            error: "Failed to fetch window status",
          });
        }
      } catch (error: any) {
        setStatus({
          isOpen: false,
          hasStarted: false,
          hasEnded: false,
          message: "Error checking requisition window",
          loading: false,
          error: error.response?.data?.message || "Network error",
        });
      }
    };

    checkWindowStatus();
  }, [userType]);

  return status;
};
