// District mappings for Tripura state
export const TRIPURA_DISTRICTS: { [key: string]: string } = {
  "1601": "West Tripura",
  "1602": "South Tripura",
  "1603": "North Tripura",
  "1604": "Dhalai",
  "1605": "Khowai",
  "1606": "Gomati",
  "1607": "Sepahijala",
  "1608": "Unakoti",
};

// Block mappings for each district
export const TRIPURA_BLOCKS: {
  [districtCode: string]: { [blockCode: string]: string };
} = {
  "1601": {
    // West Tripura
    "160101": "Dhukli",
    "160102": "Agartala Municipal Corporation",
    "160103": "Mohanpur",
    "160104": "Hezamara",
    "160105": "Mandai",
    "160106": "Jirania",
    "160107": "Lefunga",
    "160108": "Belbari",
  },
  "1604": {
    // Dhalai
    "160401": "Ambassa",
    "160402": "Gandachera",
  },
  "1606": {
    // Gomati
    "160601": "Udaipur",
    "160602": "Amarpur",
  },
  // Add other districts and blocks as needed
};

// Utility functions
export const getDistrictName = (districtCode: string): string => {
  return TRIPURA_DISTRICTS[districtCode] || `District ${districtCode}`;
};

export const getBlockName = (
  districtCode: string,
  blockCode: string,
): string => {
  return TRIPURA_BLOCKS[districtCode]?.[blockCode] || `Block ${blockCode}`;
};

// Status color mappings
export const STATUS_COLORS = {
  PENDING: "text-yellow-700 bg-yellow-100",
  APPROVED: "text-blue-700 bg-blue-100",
  COMPLETED: "text-green-700 bg-green-100",
  REJECTED: "text-red-700 bg-red-100",
};

// Medium options for books
export const BOOK_MEDIUMS = [
  "English",
  "Bengali",
  "Hindi",
  "Kokborok",
  "Manipuri",
];

// Academic years
export const ACADEMIC_YEARS = ["2024-25", "2023-24", "2022-23", "2021-22"];

// Class options
export const CLASS_OPTIONS = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

// Helper function to calculate fulfillment percentage
export const calculateFulfillmentPercent = (
  received: number,
  requested: number,
): number => {
  if (requested === 0) return 0;
  return Math.round((received / requested) * 100);
};

// Helper function to format requisition ID
export const formatRequisitionId = (reqId: string): string => {
  return reqId.toUpperCase();
};

// Helper function to get status badge class
export const getStatusBadgeClass = (status: string): string => {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    "text-gray-700 bg-gray-100"
  );
};
