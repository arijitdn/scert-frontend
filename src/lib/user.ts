// Temporary user context for notifications - replace with real auth when available

export interface User {
  id: string;
  level: "STATE" | "DISTRICT" | "BLOCK" | "SCHOOL";
  name?: string;
  schoolId?: string;
  blockCode?: string;
  districtCode?: string;
}

// Mock function to get current user - replace with real implementation
export function getCurrentUser(): User {
  // For development purposes, determine user based on URL path
  const path = window.location.pathname;

  if (path.includes("/state")) {
    return {
      id: "STATE_ADMIN",
      level: "STATE",
      name: "State Administrator",
    };
  } else if (path.includes("/district")) {
    return {
      id: "DISTRICT_ADMIN",
      level: "DISTRICT",
      name: "District Education Officer",
      districtCode: "1601", // Example district code
    };
  } else if (path.includes("/block")) {
    return {
      id: "BLOCK_ADMIN",
      level: "BLOCK",
      name: "Institutional Supervisor",
      blockCode: "160101", // Example block code
      districtCode: "1601",
    };
  } else {
    return {
      id: "SCHOOL_ADMIN",
      level: "SCHOOL",
      name: "School Administrator",
      schoolId: "12345",
      blockCode: "160101",
      districtCode: "1601",
    };
  }
}

// Get user parameters for API calls
export function getUserParams(user: User) {
  return {
    userLevel: user.level,
    userId: user.id,
    schoolId: user.schoolId,
    blockCode: user.blockCode,
    districtCode: user.districtCode,
  };
}
