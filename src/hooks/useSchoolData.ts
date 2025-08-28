import { useState, useEffect } from "react";
import { schoolsAPI } from "@/lib/api";
import { School, ClassEnrollment } from "@/types/database";

interface UseSchoolDataParams {
  udise?: string;
  schoolId?: string;
}

export function useSchoolData({ udise, schoolId }: UseSchoolDataParams) {
  const [school, setSchool] = useState<School | null>(null);
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolData = async () => {
    if (!udise && !schoolId) return;

    try {
      setLoading(true);
      setError(null);

      let schoolData: School;

      if (udise) {
        const response = await schoolsAPI.getByUdise(udise);
        if (response.data.success) {
          schoolData = response.data.data;
        } else {
          throw new Error(response.data.error || "Failed to fetch school data");
        }
      } else if (schoolId) {
        const response = await schoolsAPI.getById(schoolId);
        if (response.data.success) {
          schoolData = response.data.data;
        } else {
          throw new Error(response.data.error || "Failed to fetch school data");
        }
      } else {
        return;
      }

      setSchool(schoolData);

      // Fetch class enrollments if we have the school data
      if (schoolData.id) {
        await fetchEnrollments(schoolData.id);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch school data",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (schoolId: string) => {
    try {
      const response = await schoolsAPI.getClassEnrollments(schoolId);
      if (response.data.success) {
        setEnrollments(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    }
  };

  const updateEnrollment = async (className: string, studentCount: number) => {
    if (!school?.id) return false;

    try {
      const response = await schoolsAPI.updateClassEnrollment(school.id, {
        class: className,
        students: studentCount,
      });

      if (response.data.success) {
        // Refresh enrollments
        await fetchEnrollments(school.id);
        return true;
      } else {
        setError(response.data.error || "Failed to update enrollment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update enrollment");
      return false;
    }
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    if (!school?.id) return false;

    try {
      const response = await schoolsAPI.deleteClassEnrollment(
        school.id,
        enrollmentId,
      );

      if (response.data.success) {
        // Refresh enrollments
        await fetchEnrollments(school.id);
        return true;
      } else {
        setError(response.data.error || "Failed to delete enrollment");
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete enrollment");
      return false;
    }
  };

  const refreshData = () => {
    fetchSchoolData();
  };

  useEffect(() => {
    fetchSchoolData();
  }, [udise, schoolId]);

  return {
    school,
    enrollments,
    loading,
    error,
    updateEnrollment,
    deleteEnrollment,
    refreshData,
  };
}
