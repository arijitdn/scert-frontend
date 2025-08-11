import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Users,
  BookOpen,
  Building2,
  Package,
  Award,
  Clock,
  Info,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

export default function ChartsVisualization() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedMetric, setSelectedMetric] = useState("book-distribution");
  const [selectedDistrict, setSelectedDistrict] = useState("all-districts");

  // Enhanced district data with different metrics based on period and selection
  const getDistrictData = (period: string, metric: string) => {
    const baseData = [
      {
        name: "West Tripura",
        schools: 700,
        totalBooks: 280000,
        booksDistributed: 252000,
        distributionRate: 90.0,
        requisitions: 275000,
        pendingRequisitions: 23000,
        avgBooksPerSchool: 400,
        primarySchools: 420,
        secondarySchools: 280,
        efficiency: 92,
        inventoryTurnover: 85,
        monthlyDistribution: [18000, 19500, 21000, 22500, 24000],
        categories: {
          primary: 140000,
          upperPrimary: 70000,
          secondary: 42000,
          higherSecondary: 28000,
        },
      },
      {
        name: "South Tripura",
        schools: 600,
        totalBooks: 240000,
        booksDistributed: 216000,
        distributionRate: 90.0,
        requisitions: 245000,
        pendingRequisitions: 29000,
        avgBooksPerSchool: 360,
        primarySchools: 360,
        secondarySchools: 240,
        efficiency: 90,
        inventoryTurnover: 88,
        monthlyDistribution: [15000, 16200, 17500, 18800, 20000],
        categories: {
          primary: 120000,
          upperPrimary: 60000,
          secondary: 36000,
          higherSecondary: 24000,
        },
      },
      {
        name: "North Tripura",
        schools: 550,
        totalBooks: 220000,
        booksDistributed: 187000,
        distributionRate: 85.0,
        requisitions: 225000,
        pendingRequisitions: 38000,
        avgBooksPerSchool: 340,
        primarySchools: 330,
        secondarySchools: 220,
        efficiency: 85,
        inventoryTurnover: 82,
        monthlyDistribution: [13000, 14100, 15200, 16300, 17400],
        categories: {
          primary: 110000,
          upperPrimary: 55000,
          secondary: 33000,
          higherSecondary: 22000,
        },
      },
      {
        name: "Khowai",
        schools: 300,
        totalBooks: 120000,
        booksDistributed: 98400,
        distributionRate: 82.0,
        requisitions: 125000,
        pendingRequisitions: 26600,
        avgBooksPerSchool: 328,
        primarySchools: 180,
        secondarySchools: 120,
        efficiency: 82,
        inventoryTurnover: 79,
        monthlyDistribution: [7000, 7500, 8000, 8500, 9000],
        categories: {
          primary: 60000,
          upperPrimary: 30000,
          secondary: 18000,
          higherSecondary: 12000,
        },
      },
      {
        name: "Unakoti",
        schools: 250,
        totalBooks: 100000,
        booksDistributed: 77000,
        distributionRate: 77.0,
        requisitions: 105000,
        pendingRequisitions: 28000,
        avgBooksPerSchool: 308,
        primarySchools: 150,
        secondarySchools: 100,
        efficiency: 77,
        inventoryTurnover: 74,
        monthlyDistribution: [5500, 6000, 6500, 7000, 7500],
        categories: {
          primary: 50000,
          upperPrimary: 25000,
          secondary: 15000,
          higherSecondary: 10000,
        },
      },
      {
        name: "Gomati",
        schools: 450,
        totalBooks: 180000,
        booksDistributed: 122400,
        distributionRate: 68.0,
        requisitions: 185000,
        pendingRequisitions: 62600,
        avgBooksPerSchool: 272,
        primarySchools: 270,
        secondarySchools: 180,
        efficiency: 68,
        inventoryTurnover: 65,
        monthlyDistribution: [8000, 8500, 9000, 9500, 10000],
        categories: {
          primary: 90000,
          upperPrimary: 45000,
          secondary: 27000,
          higherSecondary: 18000,
        },
      },
      {
        name: "Sepahijala",
        schools: 400,
        totalBooks: 160000,
        booksDistributed: 72000,
        distributionRate: 45.0,
        requisitions: 170000,
        pendingRequisitions: 98000,
        avgBooksPerSchool: 180,
        primarySchools: 240,
        secondarySchools: 160,
        efficiency: 45,
        inventoryTurnover: 42,
        monthlyDistribution: [4000, 4200, 4500, 4800, 5000],
        categories: {
          primary: 80000,
          upperPrimary: 40000,
          secondary: 24000,
          higherSecondary: 16000,
        },
      },
      {
        name: "Dhalai",
        schools: 500,
        totalBooks: 200000,
        booksDistributed: 98000,
        distributionRate: 49.0,
        requisitions: 210000,
        pendingRequisitions: 112000,
        avgBooksPerSchool: 196,
        primarySchools: 300,
        secondarySchools: 200,
        efficiency: 49,
        inventoryTurnover: 46,
        monthlyDistribution: [6000, 6300, 6600, 6900, 7200],
        categories: {
          primary: 100000,
          upperPrimary: 50000,
          secondary: 30000,
          higherSecondary: 20000,
        },
      },
    ];

    // Modify data based on period selection
    if (period === "last-3-months") {
      return baseData.map((d) => ({
        ...d,
        distributionRate: d.distributionRate * 0.85,
        efficiency: d.efficiency * 0.87,
        booksDistributed: Math.round(d.booksDistributed * 0.75),
      }));
    } else if (period === "last-6-months") {
      return baseData.map((d) => ({
        ...d,
        distributionRate: d.distributionRate * 0.7,
        efficiency: d.efficiency * 0.72,
        booksDistributed: Math.round(d.booksDistributed * 0.6),
      }));
    } else if (period === "year-to-date") {
      return baseData.map((d) => ({
        ...d,
        distributionRate: d.distributionRate * 1.15,
        efficiency: d.efficiency * 1.12,
        booksDistributed: Math.round(d.booksDistributed * 1.25),
      }));
    }

    return baseData;
  };

  const districtData = getDistrictData(selectedPeriod, selectedMetric);

  // Enhanced monthly distribution data that responds to filters
  const getMonthlyData = (period: string, metric: string) => {
    const baseMonthly = [
      {
        month: "Jan",
        distributed: 145000,
        requisitioned: 160000,
        rank: {
          Dhalai: 4,
          "North Tripura": 2,
          "South Tripura": 4,
          "West Tripura": 3,
          Sepahijala: 3,
          Khowai: 4,
          Unakoti: 3,
          Gomati: 4,
        },
      },
      {
        month: "Feb",
        distributed: 167000,
        requisitioned: 175000,
        rank: {
          Dhalai: 4,
          "North Tripura": 2,
          "South Tripura": 5,
          "West Tripura": 3,
          Sepahijala: 2,
          Khowai: 4,
          Unakoti: 3,
          Gomati: 4,
        },
      },
      {
        month: "Mar",
        distributed: 189000,
        requisitioned: 195000,
        rank: {
          Dhalai: 3,
          "North Tripura": 3,
          "South Tripura": 4,
          "West Tripura": 3,
          Sepahijala: 3,
          Khowai: 4,
          Unakoti: 3,
          Gomati: 4,
        },
      },
      {
        month: "Apr",
        distributed: 203000,
        requisitioned: 210000,
        rank: {
          Dhalai: 2,
          "North Tripura": 2,
          "South Tripura": 4,
          "West Tripura": 3,
          Sepahijala: 3,
          Khowai: 4,
          Unakoti: 4,
          Gomati: 3,
        },
      },
      {
        month: "May",
        distributed: 218000,
        requisitioned: 225000,
        rank: {
          Dhalai: 1,
          "North Tripura": 1,
          "South Tripura": 3,
          "West Tripura": 3,
          Sepahijala: 1,
          Khowai: 4,
          Unakoti: 3,
          Gomati: 3,
        },
      },
    ];

    if (period === "last-3-months") {
      return baseMonthly.slice(-3);
    } else if (period === "last-6-months") {
      return [
        {
          month: "Aug",
          distributed: 120000,
          requisitioned: 140000,
          rank: {
            Dhalai: 5,
            "North Tripura": 3,
            "South Tripura": 4,
            "West Tripura": 2,
            Sepahijala: 4,
            Khowai: 5,
            Unakoti: 4,
            Gomati: 5,
          },
        },
        {
          month: "Sep",
          distributed: 128000,
          requisitioned: 145000,
          rank: {
            Dhalai: 4,
            "North Tripura": 3,
            "South Tripura": 4,
            "West Tripura": 2,
            Sepahijala: 3,
            Khowai: 4,
            Unakoti: 4,
            Gomati: 4,
          },
        },
        ...baseMonthly,
      ];
    }

    return baseMonthly;
  };

  const monthlyDistribution = getMonthlyData(selectedPeriod, selectedMetric);

  // Performance trend data for line chart
  const getPerformanceTrendData = () => {
    return monthlyDistribution.map((month) => ({
      month: month.month,
      districts: Object.entries(month.rank).map(([name, rank]) => ({
        name: name,
        rank: rank as number,
        value: districtData.find((d) => d.name === name)?.distributionRate || 0,
      })),
    }));
  };

  const performanceTrend = getPerformanceTrendData();

  // Top requesting schools/institutions - Enhanced with real school names from Tripura
  const topRequesters = [
    {
      name: "Maharaja Bir Bikram College",
      district: "West Tripura",
      booksRequested: 4500,
      category: "Higher Secondary",
      urgency: "high",
    },
    {
      name: "Ramakrishna Mission Vidyamandir",
      district: "West Tripura",
      booksRequested: 4200,
      category: "Secondary",
      urgency: "medium",
    },
    {
      name: "Iswar Chandra Vidyasagar Academy",
      district: "South Tripura",
      booksRequested: 3800,
      category: "Secondary",
      urgency: "high",
    },
    {
      name: "Netaji Subhas Vidyamandir",
      district: "North Tripura",
      booksRequested: 3600,
      category: "Higher Secondary",
      urgency: "medium",
    },
    {
      name: "Vivekananda Vidyapeeth",
      district: "Khowai",
      booksRequested: 3200,
      category: "Primary",
      urgency: "low",
    },
    {
      name: "Rabindranath High School",
      district: "Unakoti",
      booksRequested: 2900,
      category: "Secondary",
      urgency: "medium",
    },
    {
      name: "Gandhi Memorial School",
      district: "Gomati",
      booksRequested: 2750,
      category: "Primary",
      urgency: "high",
    },
    {
      name: "Tagore Memorial Academy",
      district: "Sepahijala",
      booksRequested: 2600,
      category: "Secondary",
      urgency: "high",
    },
    {
      name: "Shanti Niketan Vidyalaya",
      district: "Dhalai",
      booksRequested: 2400,
      category: "Primary",
      urgency: "medium",
    },
    {
      name: "Sardar Patel High School",
      district: "West Tripura",
      booksRequested: 2200,
      category: "Secondary",
      urgency: "low",
    },
    {
      name: "Birsa Munda Tribal School",
      district: "Dhalai",
      booksRequested: 2100,
      category: "Primary",
      urgency: "high",
    },
    {
      name: "Kanyashree Vidyalaya",
      district: "South Tripura",
      booksRequested: 2000,
      category: "Secondary",
      urgency: "medium",
    },
  ];

  // Enhanced book category distribution with subject-wise breakdown
  const bookCategories = [
    {
      category: "Class I-V (Primary)",
      quantity: 650000,
      percentage: 39.1,
      subjects: {
        Bengali: 162500,
        English: 130000,
        Mathematics: 130000,
        "Environmental Science": 97500,
        Hindi: 65000,
        "Drawing & Craft": 65000,
      },
      avgPerSchool: 245,
      distributionRate: 89.2,
    },
    {
      category: "Class VI-VIII (Upper Primary)",
      quantity: 465000,
      percentage: 28.0,
      subjects: {
        Bengali: 93000,
        English: 74400,
        Mathematics: 74400,
        Science: 74400,
        "Social Studies": 74400,
        Hindi: 46500,
        Sanskrit: 27900,
      },
      avgPerSchool: 175,
      distributionRate: 84.7,
    },
    {
      category: "Class IX-X (Secondary)",
      quantity: 390000,
      percentage: 23.5,
      subjects: {
        Bengali: 78000,
        English: 78000,
        Mathematics: 78000,
        Science: 78000,
        "Social Studies": 58500,
        Hindi: 19500,
      },
      avgPerSchool: 147,
      distributionRate: 78.9,
    },
    {
      category: "Class XI-XII (Higher Secondary)",
      quantity: 155000,
      percentage: 9.4,
      subjects: {
        Bengali: 31000,
        English: 31000,
        Mathematics: 24800,
        Physics: 24800,
        Chemistry: 24800,
        Biology: 18600,
      },
      avgPerSchool: 58,
      distributionRate: 71.3,
    },
  ];

  // Distribution efficiency metrics
  const distributionMetrics = [
    { metric: "Books in Transit", value: 45000, status: "warning" },
    { metric: "Delayed Shipments", value: 12000, status: "critical" },
    { metric: "Damaged Books", value: 3500, status: "critical" },
    { metric: "Returned Books", value: 8200, status: "warning" },
    { metric: "Lost in Transit", value: 1200, status: "critical" },
  ];

  // Enhanced subject-wise book distribution with detailed breakdown
  const subjectDistribution = [
    {
      subject: "Bengali (Mother Tongue)",
      primary: 162500,
      secondary: 109000,
      total: 271500,
      percentage: 16.3,
      priority: "critical",
      stockStatus: "adequate",
    },
    {
      subject: "English",
      primary: 130000,
      secondary: 152400,
      total: 282400,
      percentage: 17.0,
      priority: "high",
      stockStatus: "low",
    },
    {
      subject: "Mathematics",
      primary: 130000,
      secondary: 177200,
      total: 307200,
      percentage: 18.5,
      priority: "critical",
      stockStatus: "critical",
    },
    {
      subject: "Science (General/Physics/Chemistry/Biology)",
      primary: 97500,
      secondary: 175400,
      total: 272900,
      percentage: 16.4,
      priority: "high",
      stockStatus: "adequate",
    },
    {
      subject: "Social Studies/History/Geography",
      primary: 74400,
      secondary: 132900,
      total: 207300,
      percentage: 12.5,
      priority: "medium",
      stockStatus: "good",
    },
    {
      subject: "Hindi",
      primary: 65000,
      secondary: 65500,
      total: 130500,
      percentage: 7.9,
      priority: "medium",
      stockStatus: "good",
    },
    {
      subject: "Sanskrit/Drawing/Craft/Others",
      primary: 65000,
      secondary: 27900,
      total: 92900,
      percentage: 5.6,
      priority: "low",
      stockStatus: "adequate",
    },
    {
      subject: "Environmental Science",
      primary: 97500,
      secondary: 0,
      total: 97500,
      percentage: 5.9,
      priority: "medium",
      stockStatus: "good",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-red-600 bg-red-100";
      case "critical":
        return "text-red-600 bg-red-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDistributionStatusBadge = (distributionRate: number) => {
    if (distributionRate >= 85)
      return { label: "Excellent (≥85%)", color: "bg-green-500" };
    if (distributionRate >= 70)
      return { label: "Good (70-84%)", color: "bg-blue-500" };
    if (distributionRate >= 50)
      return { label: "Average (50-69%)", color: "bg-yellow-500" };
    return { label: "Poor (<50%)", color: "bg-red-500" };
  };

  // Modern Interactive Bar Chart Component with Gradients
  const InteractiveBarChart = ({
    data,
    title,
    description,
  }: {
    data: any[];
    title: string;
    description: string;
  }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedView, setSelectedView] = useState<
      "distribution" | "efficiency" | "books"
    >("distribution");
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile on mount
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }, []);

    // Chart configuration for different metrics
    const chartConfig = {
      distribution: {
        label: "Distribution Rate",
        color: "hsl(var(--chart-1))",
      },
      efficiency: {
        label: "Efficiency",
        color: "hsl(var(--chart-2))",
      },
      books: {
        label: "Books Distributed",
        color: "hsl(var(--chart-3))",
      },
    };

    // Enhanced data with proper formatting - memoized to prevent re-calculations
    const chartData = useMemo(
      () =>
        data.map((district, index) => ({
          name: district.name,
          shortName: district.name.split(" ")[0], // For mobile view
          distributionRate: district.distributionRate,
          efficiency: district.efficiency,
          booksDistributed: Math.round(district.booksDistributed / 1000), // In thousands
          totalBooks: Math.round(district.totalBooks / 1000),
          schools: district.schools,
          primarySchools: district.primarySchools,
          secondarySchools: district.secondarySchools,
          pendingRequisitions: Math.round(district.pendingRequisitions / 1000),
          color: getGradientColor(district.distributionRate, index),
        })),
      [data],
    );

    // Get current metric data - memoized
    const currentData = useMemo(() => {
      switch (selectedView) {
        case "efficiency":
          return chartData.map((d) => ({ ...d, value: d.efficiency }));
        case "books":
          return chartData.map((d) => ({ ...d, value: d.booksDistributed }));
        default:
          return chartData.map((d) => ({ ...d, value: d.distributionRate }));
      }
    }, [chartData, selectedView]);

    const maxValue = useMemo(
      () => Math.max(...currentData.map((d) => d.value)),
      [currentData],
    );

    // Memoized hover handlers to prevent re-renders
    const handleMouseEnter = useCallback((_, index) => {
      setHoveredIndex(index);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setHoveredIndex(null);
    }, []);

    function getGradientColor(rate: number, index: number) {
      if (rate >= 90) return `url(#excellent-gradient-${index})`;
      if (rate >= 80) return `url(#good-gradient-${index})`;
      if (rate >= 70) return `url(#average-gradient-${index})`;
      return `url(#poor-gradient-${index})`;
    }

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white/95 backdrop-blur-md p-5 border border-gray-200 rounded-xl shadow-2xl max-w-xs">
            <div className="border-b border-gray-100 pb-3 mb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                {data.name}
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Distribution Rate
                </span>
                <span className="font-bold text-blue-700 text-lg">
                  {data.distributionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Efficiency</span>
                <span className="font-bold text-green-700 text-lg">
                  {data.efficiency}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Books Distributed
                </span>
                <span className="font-bold text-purple-700 text-lg">
                  {data.booksDistributed}K
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Schools</span>
                <span className="font-bold text-orange-700 text-lg">
                  {data.schools}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 text-center">
                  <span className="font-medium">Primary:</span>{" "}
                  {data.primarySchools} |
                  <span className="font-medium"> Secondary:</span>{" "}
                  {data.secondarySchools}
                </div>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <Card className="overflow-hidden chart-animate">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {title}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {description}
                </CardDescription>
              </div>
            </div>

            {/* View Selector */}
            <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200 shadow-lg">
              {[
                {
                  key: "distribution",
                  label: "Distribution %",
                  icon: "📊",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  key: "efficiency",
                  label: "Efficiency %",
                  icon: "⚡",
                  color: "from-green-500 to-green-600",
                },
                {
                  key: "books",
                  label: "Books (K)",
                  icon: "📚",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setSelectedView(view.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedView === view.key
                      ? `bg-gradient-to-r ${view.color} text-white shadow-lg`
                      : "text-gray-600 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <span className="mr-2">{view.icon}</span>
                  <span className="hidden sm:inline">{view.label}</span>
                  <span className="sm:hidden">{view.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50">
          {/* Chart Container */}
          <div className="chart-responsive mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: isMobile ? 80 : 60,
                }}
                barCategoryGap="15%"
              >
                <defs>
                  {currentData.map((_, index) => (
                    <g key={index}>
                      <linearGradient
                        id={`excellent-gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="50%"
                          stopColor="#059669"
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor="#047857"
                          stopOpacity={0.75}
                        />
                      </linearGradient>
                      <linearGradient
                        id={`good-gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="50%"
                          stopColor="#2563eb"
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.75}
                        />
                      </linearGradient>
                      <linearGradient
                        id={`average-gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f59e0b"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="50%"
                          stopColor="#d97706"
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor="#b45309"
                          stopOpacity={0.75}
                        />
                      </linearGradient>
                      <linearGradient
                        id={`poor-gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ef4444"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="50%"
                          stopColor="#dc2626"
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor="#b91c1c"
                          stopOpacity={0.75}
                        />
                      </linearGradient>

                      {/* Glow effects for hover */}
                      <filter id={`glow-${index}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </g>
                  ))}
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 80 : 60}
                  interval={0}
                  axisLine={{ stroke: "#e2e8f0", strokeWidth: 2 }}
                  tickLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                  domain={[0, maxValue * 1.1]}
                  axisLine={{ stroke: "#e2e8f0", strokeWidth: 2 }}
                  tickLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                  tickFormatter={(value) => {
                    if (selectedView === "books") return `${value}K`;
                    return `${value}%`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="chart-bar-animate"
                >
                  {currentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={
                        hoveredIndex === index ? "#1f2937" : "transparent"
                      }
                      strokeWidth={hoveredIndex === index ? 3 : 0}
                      filter={
                        hoveredIndex === index
                          ? `url(#glow-${index})`
                          : undefined
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-5 rounded-xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-green-800">
                  Excellent (≥90%)
                </span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                {currentData.filter((d) => d.distributionRate >= 90).length}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Districts performing excellently
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 p-5 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-sky-500 rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-blue-800">
                  Good (80-89%)
                </span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-700 bg-clip-text text-transparent">
                {
                  currentData.filter(
                    (d) => d.distributionRate >= 80 && d.distributionRate < 90,
                  ).length
                }
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Districts with good performance
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-5 rounded-xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-orange-800">
                  Average (70-79%)
                </span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                {
                  currentData.filter(
                    (d) => d.distributionRate >= 70 && d.distributionRate < 80,
                  ).length
                }
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Districts with average performance
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 p-5 rounded-xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-rose-500 rounded-full shadow-md"></div>
                <span className="text-sm font-semibold text-red-800">
                  Needs Attention (&lt;70%)
                </span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">
                {currentData.filter((d) => d.distributionRate < 70).length}
              </div>
              <div className="text-xs text-red-600 mt-1">
                Districts requiring attention
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Info className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Quick Insights
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col space-y-2 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-gray-600 font-medium">
                  Average Distribution Rate
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {(
                    currentData.reduce(
                      (acc, d) => acc + d.distributionRate,
                      0,
                    ) / currentData.length
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex flex-col space-y-2 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-gray-600 font-medium">
                  Total Books Distributed
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  {currentData.reduce((acc, d) => acc + d.booksDistributed, 0)}K
                </span>
              </div>
              <div className="flex flex-col space-y-2 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-gray-600 font-medium">Total Schools</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  {currentData.reduce((acc, d) => acc + d.schools, 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Interactive Line Chart Component
  const InteractiveTrendChart = ({
    data,
    selectedDistrict,
  }: {
    data: any[];
    selectedDistrict: string;
  }) => {
    const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
    const [selectedDistrictLines, setSelectedDistrictLines] = useState<
      string[]
    >([
      "Dhalai",
      "North Tripura",
      "South Tripura",
      "West Tripura",
      "Sepahijala",
      "Khowai",
      "Unakoti",
      "Gomati",
    ]);

    const districtColors = {
      Dhalai: "#ef4444", // red
      "North Tripura": "#3b82f6", // blue
      "South Tripura": "#8b5cf6", // purple
      "West Tripura": "#06b6d4", // cyan
      Sepahijala: "#22c55e", // green
      Khowai: "#f59e0b", // orange
      Unakoti: "#06b6d4", // cyan
      Gomati: "#6366f1", // indigo
    };

    const toggleDistrictLine = (districtName: string) => {
      setSelectedDistrictLines((prev) =>
        prev.includes(districtName)
          ? prev.filter((d) => d !== districtName)
          : [...prev, districtName],
      );
    };

    if (!data || data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>District Performance Trendline</CardTitle>
            <CardDescription>Loading chart data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading performance data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>District Performance Trendline</CardTitle>
          <CardDescription>
            Rank tracking over time (Lower rank is better) - Click district
            names to toggle lines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart Area */}
            <div
              className="relative bg-white border rounded-lg p-6"
              style={{ height: "400px" }}
            >
              {/* Y-axis labels */}
              <div className="absolute left-2 top-6 bottom-12 flex flex-col justify-between text-sm text-gray-600">
                <span>#1</span>
                <span>#2</span>
                <span>#3</span>
                <span>#4</span>
                <span>#5</span>
              </div>

              {/* Chart container */}
              <div className="ml-8 mr-4 mt-4 mb-16 h-full relative">
                {/* Horizontal grid lines */}
                {[0, 1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="absolute w-full border-t border-gray-200"
                    style={{ top: `${(line / 4) * 100}%` }}
                  ></div>
                ))}

                {/* Vertical grid lines */}
                {data.map((_, index) => (
                  <div
                    key={index}
                    className="absolute h-full border-l border-gray-200"
                    style={{
                      left: `${(index / Math.max(data.length - 1, 1)) * 100}%`,
                    }}
                  ></div>
                ))}

                {/* SVG for trend lines */}
                <svg className="absolute inset-0 w-full h-full overflow-visible">
                  {selectedDistrictLines.map((districtName) => {
                    const points = data
                      .map((month, monthIndex) => {
                        const district = month.districts.find(
                          (d) => d.name === districtName,
                        );
                        if (!district) return null;

                        const x =
                          (monthIndex / Math.max(data.length - 1, 1)) * 100;
                        const y = ((district.rank - 1) / 4) * 100;
                        return {
                          x,
                          y,
                          rank: district.rank,
                          value: district.value,
                          month: month.month,
                        };
                      })
                      .filter(Boolean);

                    if (points.length === 0) return null;

                    // Create path data for smooth lines
                    const pathData = points
                      .map((p, index) => {
                        const command = index === 0 ? "M" : "L";
                        return `${command} ${p!.x}% ${p!.y}%`;
                      })
                      .join(" ");

                    return (
                      <g key={districtName}>
                        {/* Line path */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={
                            districtColors[
                              districtName as keyof typeof districtColors
                            ]
                          }
                          strokeWidth="3"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="transition-all duration-300"
                          style={{
                            filter:
                              hoveredDistrict === districtName
                                ? "drop-shadow(0 2px 6px rgba(0,0,0,0.3))"
                                : "none",
                            opacity: selectedDistrictLines.includes(
                              districtName,
                            )
                              ? 1
                              : 0.3,
                          }}
                        />

                        {/* Data points */}
                        {points.map((point, pointIndex) => (
                          <circle
                            key={`${districtName}-${pointIndex}`}
                            cx={`${point!.x}%`}
                            cy={`${point!.y}%`}
                            r={hoveredDistrict === districtName ? "6" : "4"}
                            fill={
                              districtColors[
                                districtName as keyof typeof districtColors
                              ]
                            }
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-pointer transition-all duration-200"
                            style={{
                              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))",
                              opacity: selectedDistrictLines.includes(
                                districtName,
                              )
                                ? 1
                                : 0.5,
                            }}
                            onMouseEnter={() => {
                              setHoveredDistrict(districtName);
                              setHoveredMonth(point!.month);
                            }}
                            onMouseLeave={() => {
                              setHoveredDistrict(null);
                              setHoveredMonth(null);
                            }}
                          />
                        ))}
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute -bottom-8 inset-x-0 flex justify-between text-sm text-gray-600">
                  {data.map((month, index) => (
                    <div
                      key={month.month}
                      className="text-center"
                      style={{
                        width: "60px",
                        marginLeft: index === 0 ? "0" : "-30px",
                      }}
                    >
                      {month.month}
                    </div>
                  ))}
                </div>

                {/* Hover tooltip */}
                {hoveredDistrict && hoveredMonth && (
                  <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-20">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-1">
                        Month: {hoveredMonth}
                      </div>
                      {data
                        .find((d) => d.month === hoveredMonth)
                        ?.districts.filter(
                          (d: any) => d.name === hoveredDistrict,
                        )
                        .map((district: any) => (
                          <div
                            key={district.name}
                            className="flex items-center gap-2 text-xs mb-1"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  districtColors[
                                    district.name as keyof typeof districtColors
                                  ],
                              }}
                            ></div>
                            <span
                              style={{
                                color:
                                  districtColors[
                                    district.name as keyof typeof districtColors
                                  ],
                              }}
                            >
                              {district.name}: Rank #{district.rank}
                            </span>
                            <span className="text-gray-500">
                              ({district.value.toFixed(1)}% efficiency)
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Y-axis label */}
              <div
                className="absolute left-0 top-1/2 transform -rotate-90 text-sm text-gray-600 font-medium"
                style={{ transformOrigin: "center", marginTop: "-40px" }}
              >
                Rank (Lower is Better)
              </div>
            </div>

            {/* Legend with enhanced visual feedback */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(districtColors).map(([district, color]) => (
                <button
                  key={district}
                  onClick={() => toggleDistrictLine(district)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedDistrictLines.includes(district)
                      ? "bg-white border-2 shadow-sm scale-105"
                      : "bg-gray-50 border border-gray-200 opacity-60 hover:opacity-80 hover:scale-102"
                  }`}
                  style={{
                    borderColor: selectedDistrictLines.includes(district)
                      ? color
                      : "#d1d5db",
                    color: selectedDistrictLines.includes(district)
                      ? color
                      : "#6b7280",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span>{district}</span>
                </button>
              ))}
            </div>

            {/* Performance Insights */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>
                  {data.length > 0 &&
                    (() => {
                      const firstMonth = data[0];
                      const lastMonth = data[data.length - 1];

                      // Find district with best improvement (lowest rank in last month)
                      const bestPerformer = lastMonth.districts.reduce(
                        (best: any, current: any) =>
                          selectedDistrictLines.includes(current.name) &&
                          current.rank < (best?.rank || 6)
                            ? current
                            : best,
                        null,
                      );

                      return bestPerformer ? `${bestPerformer.name}` : "Dhalai";
                    })()}
                </strong>{" "}
                shows the best consistent performance improvement over the
                selected period, demonstrating effective distribution
                strategies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout
      title="Charts & Visualization Dashboard"
      description="Comprehensive analytics and performance insights across all districts"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="year-to-date">Year to Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="book-distribution">
                  Book Distribution
                </SelectItem>
                <SelectItem value="school-requisitions">
                  School Requisitions
                </SelectItem>
                <SelectItem value="inventory-levels">
                  Inventory Levels
                </SelectItem>
                <SelectItem value="distribution-efficiency">
                  Distribution Efficiency
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDistrict}
              onValueChange={setSelectedDistrict}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-districts">All Districts</SelectItem>
                {districtData.map((district) => (
                  <SelectItem
                    key={district.name}
                    value={district.name.toLowerCase().replace(" ", "-")}
                  >
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live Data</span>
            </div>
            <span>•</span>
            <span>Updated {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Requesting Schools */}
            <Card>
              <CardHeader>
                <CardTitle>Top Requesting Schools & Institutions</CardTitle>
                <CardDescription>
                  Schools with highest book requisitions - Updated for{" "}
                  {selectedPeriod}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRequesters.slice(0, 8).map((school, index) => {
                    const urgencyColors = {
                      high: "border-l-red-500 bg-red-50",
                      medium: "border-l-yellow-500 bg-yellow-50",
                      low: "border-l-green-500 bg-green-50",
                    };

                    const urgencyTextColors = {
                      high: "text-red-700",
                      medium: "text-yellow-700",
                      low: "text-green-700",
                    };

                    return (
                      <div
                        key={school.name}
                        className={`p-4 border-l-4 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer group ${urgencyColors[school.urgency as keyof typeof urgencyColors]}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800 group-hover:text-gray-900">
                                #{index + 1} {school.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${urgencyTextColors[school.urgency as keyof typeof urgencyTextColors]}`}
                              >
                                {school.urgency.toUpperCase()} PRIORITY
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">District:</span>
                                <div className="font-medium">
                                  {school.district}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Category:</span>
                                <div className="font-medium">
                                  {school.category}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Books Requested:
                                </span>
                                <div className="font-bold text-lg text-blue-600">
                                  {school.booksRequested.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar showing relative request size */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Request Volume</span>
                            <span>
                              {(
                                (school.booksRequested /
                                  topRequesters[0].booksRequested) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${(school.booksRequested / topRequesters[0].booksRequested) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Request Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total Requests:</span>
                      <div className="font-bold text-blue-800">
                        {topRequesters
                          .reduce(
                            (sum, school) => sum + school.booksRequested,
                            0,
                          )
                          .toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700">Avg per School:</span>
                      <div className="font-bold text-blue-800">
                        {Math.round(
                          topRequesters.reduce(
                            (sum, school) => sum + school.booksRequested,
                            0,
                          ) / topRequesters.length,
                        ).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700">High Priority:</span>
                      <div className="font-bold text-blue-800">
                        {
                          topRequesters.filter((s) => s.urgency === "high")
                            .length
                        }{" "}
                        schools
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive District Performance Chart */}
            <InteractiveBarChart
              data={
                selectedDistrict === "all-districts"
                  ? districtData
                  : districtData.filter(
                      (d) =>
                        d.name.toLowerCase().replace(" ", "-") ===
                        selectedDistrict,
                    )
              }
              title={`District-wise ${selectedMetric.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Analysis`}
              description={`Performance metrics for ${selectedPeriod.replace("-", " ")} across ${
                selectedDistrict === "all-districts"
                  ? "all districts"
                  : selectedDistrict.replace("-", " ")
              }`}
            />

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Schools
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {districtData
                      .reduce((sum, d) => sum + d.schools, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12 schools</span> added
                    this month
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    Primary:{" "}
                    {districtData
                      .reduce((sum, d) => sum + d.primarySchools, 0)
                      .toLocaleString()}{" "}
                    | Secondary:{" "}
                    {districtData
                      .reduce((sum, d) => sum + d.secondarySchools, 0)
                      .toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Books Distributed
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {(
                      districtData.reduce(
                        (sum, d) => sum + d.booksDistributed,
                        0,
                      ) / 1000000
                    ).toFixed(1)}
                    M
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+15.3%</span> from last
                    month
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full"
                      style={{
                        width: `${
                          (districtData.reduce(
                            (sum, d) => sum + d.booksDistributed,
                            0,
                          ) /
                            districtData.reduce(
                              (sum, d) => sum + d.totalBooks,
                              0,
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Distribution Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {(
                      districtData.reduce(
                        (sum, d) => sum + d.distributionRate,
                        0,
                      ) / districtData.length
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+4.2%</span> improvement
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Trending up</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Requisitions
                  </CardTitle>
                  <Package className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {(
                      districtData.reduce(
                        (sum, d) => sum + d.pendingRequisitions,
                        0,
                      ) / 1000
                    ).toFixed(0)}
                    K
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600">High priority</span> - needs
                    attention
                  </p>
                  <div className="mt-2 text-xs text-gray-600">
                    {
                      districtData.filter((d) => d.pendingRequisitions > 50000)
                        .length
                    }{" "}
                    districts need urgent action
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Dynamic analysis based on selected filters: {selectedPeriod} |{" "}
                  {selectedMetric}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      Top Performers
                    </h4>
                    <div className="space-y-1 text-sm">
                      {districtData
                        .sort((a, b) => b.distributionRate - a.distributionRate)
                        .slice(0, 3)
                        .map((district, index) => (
                          <div
                            key={district.name}
                            className="flex justify-between"
                          >
                            <span>
                              #{index + 1} {district.name}
                            </span>
                            <span className="font-medium">
                              {district.distributionRate.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">
                      Needs Attention
                    </h4>
                    <div className="space-y-1 text-sm">
                      {districtData
                        .sort((a, b) => a.distributionRate - b.distributionRate)
                        .slice(0, 3)
                        .map((district) => (
                          <div
                            key={district.name}
                            className="flex justify-between"
                          >
                            <span>{district.name}</span>
                            <span className="font-medium">
                              {district.distributionRate.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Key Statistics
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Books/School</span>
                        <span className="font-medium">
                          {Math.round(
                            districtData.reduce(
                              (sum, d) => sum + d.avgBooksPerSchool,
                              0,
                            ) / districtData.length,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Inventory</span>
                        <span className="font-medium">
                          {(
                            districtData.reduce(
                              (sum, d) => sum + d.totalBooks,
                              0,
                            ) / 1000000
                          ).toFixed(1)}
                          M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency Rate</span>
                        <span className="font-medium">
                          {(
                            districtData.reduce(
                              (sum, d) => sum + d.efficiency,
                              0,
                            ) / districtData.length
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            {/* Interactive Trend Analysis */}
            <InteractiveTrendChart
              data={performanceTrend}
              selectedDistrict={selectedDistrict}
            />

            <Card>
              <CardHeader>
                <CardTitle>Monthly Book Distribution Trend</CardTitle>
                <CardDescription>
                  Books distributed vs requisitioned over the selected period
                  with interactive charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Enhanced Monthly Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthlyDistribution.map((month, index) => {
                      const fulfillmentRate =
                        (month.distributed / month.requisitioned) * 100;
                      const isLatest = index === monthlyDistribution.length - 1;

                      return (
                        <Card
                          key={month.month}
                          className={`transition-all duration-300 hover:shadow-xl group cursor-pointer ${
                            isLatest
                              ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100"
                              : "hover:scale-105"
                          }`}
                        >
                          <CardContent className="p-5">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg">
                                  {month.month} 2025
                                </h4>
                                {isLatest && (
                                  <Badge className="bg-blue-500 text-white text-xs font-medium px-2 py-1">
                                    Latest
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    Distributed:
                                  </span>
                                  <span className="font-bold text-green-600 text-lg">
                                    {(month.distributed / 1000).toFixed(0)}K
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    Requisitioned:
                                  </span>
                                  <span className="font-bold text-blue-600 text-lg">
                                    {(month.requisitioned / 1000).toFixed(0)}K
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    Fulfillment Rate:
                                  </span>
                                  <span
                                    className={`font-bold text-lg ${
                                      fulfillmentRate >= 90
                                        ? "text-green-600"
                                        : fulfillmentRate >= 75
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {fulfillmentRate.toFixed(1)}%
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Progress
                                  value={fulfillmentRate}
                                  className="h-3"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>0%</span>
                                  <span className="font-medium">
                                    {fulfillmentRate >= 90
                                      ? "Excellent"
                                      : fulfillmentRate >= 75
                                        ? "Good"
                                        : "Needs Improvement"}
                                  </span>
                                  <span>100%</span>
                                </div>
                              </div>

                              {/* Visual comparison chart */}
                              <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden">
                                <div className="absolute inset-0 flex items-end p-2 gap-1">
                                  <div className="flex-1 flex flex-col items-center">
                                    <div
                                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-700 group-hover:from-green-600 group-hover:to-green-500"
                                      style={{
                                        height: `${Math.max((month.distributed / month.requisitioned) * 100, 10)}%`,
                                        minHeight: "12px",
                                      }}
                                    ></div>
                                    <div className="text-xs text-green-700 font-medium mt-1">
                                      Distributed
                                    </div>
                                  </div>
                                  <div className="flex-1 flex flex-col items-center">
                                    <div
                                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-700 group-hover:from-blue-600 group-hover:to-blue-500"
                                      style={{ height: "100%" }}
                                    ></div>
                                    <div className="text-xs text-blue-700 font-medium mt-1">
                                      Required
                                    </div>
                                  </div>
                                </div>

                                {/* Hover details */}
                                <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="text-white text-center">
                                    <div className="text-xs">
                                      Gap:{" "}
                                      {(
                                        (month.requisitioned -
                                          month.distributed) /
                                        1000
                                      ).toFixed(0)}
                                      K books
                                    </div>
                                    <div className="text-xs">
                                      Efficiency: {fulfillmentRate.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Comprehensive Trend Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart for Monthly Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Distribution vs Requisition Trend
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Monthly comparison over selected period
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
                          <svg className="w-full h-full">
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map((line) => (
                              <line
                                key={line}
                                x1="0"
                                y1={`${line}%`}
                                x2="100%"
                                y2={`${line}%`}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                                strokeDasharray="2,2"
                              />
                            ))}

                            {/* Distributed line */}
                            <polyline
                              points={monthlyDistribution
                                .map((month, index) => {
                                  const x =
                                    (index /
                                      Math.max(
                                        monthlyDistribution.length - 1,
                                        1,
                                      )) *
                                    100;
                                  const maxValue = Math.max(
                                    ...monthlyDistribution.map(
                                      (m) => m.requisitioned,
                                    ),
                                  );
                                  const y =
                                    100 - (month.distributed / maxValue) * 80; // Use 80% of chart height
                                  return `${x},${y}`;
                                })
                                .join(" ")}
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="3"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />

                            {/* Requisitioned line */}
                            <polyline
                              points={monthlyDistribution
                                .map((month, index) => {
                                  const x =
                                    (index /
                                      Math.max(
                                        monthlyDistribution.length - 1,
                                        1,
                                      )) *
                                    100;
                                  const maxValue = Math.max(
                                    ...monthlyDistribution.map(
                                      (m) => m.requisitioned,
                                    ),
                                  );
                                  const y =
                                    100 - (month.requisitioned / maxValue) * 80; // Use 80% of chart height
                                  return `${x},${y}`;
                                })
                                .join(" ")}
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="3"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />

                            {/* Data points for distributed */}
                            {monthlyDistribution.map((month, index) => {
                              const x =
                                (index /
                                  Math.max(monthlyDistribution.length - 1, 1)) *
                                100;
                              const maxValue = Math.max(
                                ...monthlyDistribution.map(
                                  (m) => m.requisitioned,
                                ),
                              );
                              const distY =
                                100 - (month.distributed / maxValue) * 80;
                              const reqY =
                                100 - (month.requisitioned / maxValue) * 80;

                              return (
                                <g key={index}>
                                  <circle
                                    cx={x}
                                    cy={distY}
                                    r="4"
                                    fill="#22c55e"
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                  <circle
                                    cx={x}
                                    cy={reqY}
                                    r="4"
                                    fill="#3b82f6"
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                </g>
                              );
                            })}
                          </svg>

                          {/* Chart labels */}
                          <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-gray-600 px-2">
                            {monthlyDistribution.map((month) => (
                              <span key={month.month}>{month.month}</span>
                            ))}
                          </div>

                          {/* Legend */}
                          <div className="absolute top-2 right-2 bg-white p-2 rounded shadow-sm border text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span>Distributed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span>Requisitioned</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Performance Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Performance Metrics
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Key indicators for the selected period
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Average Fulfillment Rate",
                              value: `${((monthlyDistribution.reduce((sum, m) => sum + m.distributed / m.requisitioned, 0) / monthlyDistribution.length) * 100).toFixed(1)}%`,
                              trend: "+3.2%",
                              color: "text-green-600",
                              bgColor: "bg-green-50",
                            },
                            {
                              label: "Total Books Distributed",
                              value: `${(monthlyDistribution.reduce((sum, m) => sum + m.distributed, 0) / 1000).toFixed(0)}K`,
                              trend: "+12.8%",
                              color: "text-blue-600",
                              bgColor: "bg-blue-50",
                            },
                            {
                              label: "Pending Requisitions",
                              value: `${(monthlyDistribution.reduce((sum, m) => sum + (m.requisitioned - m.distributed), 0) / 1000).toFixed(0)}K`,
                              trend: "-5.4%",
                              color: "text-orange-600",
                              bgColor: "bg-orange-50",
                            },
                            {
                              label: "Distribution Efficiency",
                              value: `${Math.min((monthlyDistribution.reduce((sum, m) => sum + m.distributed / m.requisitioned, 0) / monthlyDistribution.length) * 100, 100).toFixed(1)}%`,
                              trend: "+7.1%",
                              color: "text-purple-600",
                              bgColor: "bg-purple-50",
                            },
                          ].map((metric, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg ${metric.bgColor} border`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm text-gray-600">
                                    {metric.label}
                                  </div>
                                  <div
                                    className={`text-xl font-bold ${metric.color}`}
                                  >
                                    {metric.value}
                                  </div>
                                </div>
                                <div
                                  className={`text-sm font-medium ${metric.color}`}
                                >
                                  {metric.trend}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">
                          Distribution Trend Analysis
                        </h4>
                        <p className="text-sm text-blue-700">
                          <strong>Performance Improvement:</strong>{" "}
                          {monthlyDistribution.length > 1 && (
                            <>
                              {monthlyDistribution[
                                monthlyDistribution.length - 1
                              ].distributed /
                                monthlyDistribution[
                                  monthlyDistribution.length - 1
                                ].requisitioned >
                              monthlyDistribution[0].distributed /
                                monthlyDistribution[0].requisitioned
                                ? "Positive upward trend"
                                : "Declining trend"}{" "}
                              observed over the selected period with{" "}
                              {(
                                (monthlyDistribution[
                                  monthlyDistribution.length - 1
                                ].distributed /
                                  monthlyDistribution[
                                    monthlyDistribution.length - 1
                                  ].requisitioned -
                                  monthlyDistribution[0].distributed /
                                    monthlyDistribution[0].requisitioned) *
                                100
                              ).toFixed(1)}
                              % change in fulfillment rate.
                            </>
                          )}
                          {selectedPeriod === "current-month" &&
                            " Current month showing strong performance with improved distribution efficiency."}
                          {selectedPeriod === "year-to-date" &&
                            " Year-to-date showing consistent growth in book distribution across all districts."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Book Distribution by Category</CardTitle>
                <CardDescription>
                  Interactive distribution of books across different class
                  levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Visual Chart Area - Enhanced Pie Chart */}
                  <div className="relative">
                    <div className="relative w-64 h-64 mx-auto">
                      {/* SVG Pie Chart */}
                      <svg className="w-full h-full" viewBox="0 0 200 200">
                        {bookCategories.map((category, index) => {
                          const colors = [
                            "#3b82f6",
                            "#22c55e",
                            "#f59e0b",
                            "#8b5cf6",
                          ];
                          const total = 100;
                          const startAngle =
                            bookCategories
                              .slice(0, index)
                              .reduce((sum, cat) => sum + cat.percentage, 0) *
                            3.6;
                          const endAngle =
                            startAngle + category.percentage * 3.6;

                          const startAngleRad =
                            (startAngle - 90) * (Math.PI / 180);
                          const endAngleRad = (endAngle - 90) * (Math.PI / 180);

                          const x1 = 100 + 80 * Math.cos(startAngleRad);
                          const y1 = 100 + 80 * Math.sin(startAngleRad);
                          const x2 = 100 + 80 * Math.cos(endAngleRad);
                          const y2 = 100 + 80 * Math.sin(endAngleRad);

                          const largeArcFlag = category.percentage > 50 ? 1 : 0;

                          const pathData = [
                            "M",
                            100,
                            100,
                            "L",
                            x1,
                            y1,
                            "A",
                            80,
                            80,
                            0,
                            largeArcFlag,
                            1,
                            x2,
                            y2,
                            "Z",
                          ].join(" ");

                          return (
                            <path
                              key={index}
                              d={pathData}
                              fill={colors[index]}
                              stroke="white"
                              strokeWidth="2"
                              className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                            />
                          );
                        })}

                        {/* Center circle */}
                        <circle
                          cx="100"
                          cy="100"
                          r="40"
                          fill="white"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />

                        {/* Center text */}
                        <text
                          x="100"
                          y="95"
                          textAnchor="middle"
                          className="text-sm font-bold fill-gray-800"
                        >
                          {(
                            bookCategories.reduce(
                              (sum, cat) => sum + cat.quantity,
                              0,
                            ) / 1000000
                          ).toFixed(1)}
                          M
                        </text>
                        <text
                          x="100"
                          y="110"
                          textAnchor="middle"
                          className="text-xs fill-gray-600"
                        >
                          Total Books
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Category Details */}
                  <div className="space-y-4">
                    {bookCategories.map((category, index) => {
                      const colors = [
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-yellow-500",
                        "bg-purple-500",
                      ];
                      const textColors = [
                        "text-blue-600",
                        "text-green-600",
                        "text-yellow-600",
                        "text-purple-600",
                      ];

                      return (
                        <div
                          key={category.category}
                          className="group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded ${colors[index]}`}
                              ></div>
                              <span className="font-medium text-sm">
                                {category.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-bold text-lg ${textColors[index]}`}
                              >
                                {category.percentage}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {(category.quantity / 1000).toFixed(0)}K books
                              </div>
                            </div>
                          </div>

                          <div className="relative">
                            <Progress
                              value={category.percentage}
                              className="h-2"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded-full"></div>
                          </div>

                          {/* Additional info on hover */}
                          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="text-xs text-gray-600 flex justify-between">
                              <span>
                                Distribution rate:{" "}
                                {(85 + Math.random() * 15).toFixed(1)}%
                              </span>
                              <span>
                                Avg per school:{" "}
                                {Math.round(
                                  category.quantity /
                                    (districtData.reduce(
                                      (sum, d) => sum + d.schools,
                                      0,
                                    ) *
                                      0.25),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">
                        Category Insights
                      </h4>
                      <p className="text-sm text-blue-700">
                        Primary education books (Class I-V) represent the
                        largest segment at 35.7%.
                        {selectedPeriod !== "current-month" &&
                          " Historical data shows consistent demand patterns."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requisitions Tab */}
          <TabsContent value="requisitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Requesting Schools/Institutions
                </CardTitle>
                <CardDescription>
                  Schools with highest book requisition volumes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRequesters.map((school, index) => (
                    <div
                      key={school.name}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{school.name}</h4>
                            <p className="text-sm text-gray-600">
                              {school.district} • {school.category} School
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {school.booksRequested.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          books requested
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Agartala Girls School</strong> has the highest book
                    requisition (2,500 books), followed by Dharmanagar High
                    School. Secondary schools show higher demand than primary
                    schools.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* District Requisition Overview */}
            <Card>
              <CardHeader>
                <CardTitle>District-wise Requisition Status</CardTitle>
                <CardDescription>
                  Pending vs completed requisitions by district
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {districtData.map((district) => {
                    const completionRate =
                      ((district.requisitions - district.pendingRequisitions) /
                        district.requisitions) *
                      100;
                    return (
                      <Card key={district.name}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">
                              {district.name}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Total:</span>
                                <span>
                                  {district.requisitions.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Pending:</span>
                                <span className="text-red-600">
                                  {district.pendingRequisitions.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Completion:</span>
                                <span
                                  className={
                                    completionRate >= 85
                                      ? "text-green-600"
                                      : completionRate >= 70
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }
                                >
                                  {completionRate.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Progress value={completionRate} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Inventory Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Stock",
                  value: "2.4M",
                  change: "+5.2%",
                  color: "blue",
                  description: "Books in inventory",
                  icon: Package,
                },
                {
                  label: "Low Stock",
                  value: "12",
                  change: "-8%",
                  color: "orange",
                  description: "Districts below threshold",
                  icon: AlertTriangle,
                },
                {
                  label: "Out of Stock",
                  value: "3",
                  change: "+2",
                  color: "red",
                  description: "Categories unavailable",
                  icon: AlertCircle,
                },
                {
                  label: "Optimal",
                  value: "85%",
                  change: "+2.1%",
                  color: "green",
                  description: "Inventory health score",
                  icon: TrendingUp,
                },
              ].map((metric, index) => (
                <Card
                  key={metric.label}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                        <metric.icon
                          className={`w-5 h-5 text-${metric.color}-600`}
                        />
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          metric.change.includes("+")
                            ? "bg-green-100 text-green-600"
                            : metric.change.includes("-")
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {metric.change}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-sm font-medium text-gray-700">
                        {metric.label}
                      </p>
                      <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {metric.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Interactive Stock Levels Chart */}
            <Card>
              <CardHeader>
                <CardTitle>District-wise Stock Levels</CardTitle>
                <CardDescription>
                  Real-time inventory status across all districts with
                  interactive controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Chart Controls */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Select
                      value={selectedMetric}
                      onValueChange={setSelectedMetric}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total-books">Total Stock</SelectItem>
                        <SelectItem value="distributed">Distributed</SelectItem>
                        <SelectItem value="remaining">Remaining</SelectItem>
                        <SelectItem value="required">Required</SelectItem>
                      </SelectContent>
                    </Select>

                    <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      Export Data
                    </button>
                  </div>

                  {/* Interactive Bar Chart for Stock Levels */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border">
                    <div className="flex items-end justify-between h-80 gap-4">
                      {getDistrictData(selectedPeriod, selectedMetric).map(
                        (district, index) => {
                          const totalBooks = district.totalBooks;
                          const distributed = district.booksDistributed;
                          const remaining = totalBooks - distributed;
                          const distributionRate =
                            (distributed / totalBooks) * 100;

                          // Calculate heights for bars
                          const maxValue = Math.max(
                            ...getDistrictData(
                              selectedPeriod,
                              selectedMetric,
                            ).map((d) => d.totalBooks),
                          );
                          const totalHeight = (totalBooks / maxValue) * 100;
                          const distributedHeight =
                            (distributed / maxValue) * 100;

                          // Status colors based on distribution rate
                          const getStatusColor = (rate: number) => {
                            if (rate >= 80)
                              return {
                                bg: "bg-green-500",
                                text: "text-green-600",
                                label: "Healthy",
                              };
                            if (rate >= 50)
                              return {
                                bg: "bg-yellow-500",
                                text: "text-yellow-600",
                                label: "Low",
                              };
                            return {
                              bg: "bg-red-500",
                              text: "text-red-600",
                              label: "Critical",
                            };
                          };

                          const status = getStatusColor(distributionRate);

                          return (
                            <div
                              key={district.name}
                              className="flex flex-col items-center group relative"
                            >
                              {/* Bar chart container */}
                              <div className="relative flex-1 w-16 flex items-end mb-4">
                                {/* Total stock bar (background) */}
                                <div className="relative w-full">
                                  <div
                                    className="w-full bg-gray-300 rounded-t-lg transition-all duration-700 ease-out group-hover:shadow-lg"
                                    style={{ height: `${totalHeight}%` }}
                                  >
                                    {/* Distributed portion (overlay) */}
                                    <div
                                      className={`w-full ${status.bg} rounded-t-lg transition-all duration-700 ease-out`}
                                      style={{
                                        height: `${(distributedHeight / totalHeight) * 100}%`,
                                      }}
                                    ></div>
                                  </div>

                                  {/* Hover tooltip */}
                                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                    <div className="text-center">
                                      <div className="font-bold">
                                        {district.name}
                                      </div>
                                      <div className="text-gray-300">
                                        Total: {totalBooks.toLocaleString()}
                                      </div>
                                      <div className="text-gray-300">
                                        Distributed:{" "}
                                        {distributed.toLocaleString()}
                                      </div>
                                      <div className="text-gray-300">
                                        Rate: {distributionRate.toFixed(1)}%
                                      </div>
                                      <div
                                        className={`font-bold ${status.text.replace("text-", "text-")}`}
                                      >
                                        {status.label}
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                  </div>
                                </div>
                              </div>

                              {/* District label */}
                              <div className="text-center">
                                <div className="text-xs font-medium text-gray-700 writing-mode-vertical transform rotate-0 mb-2">
                                  {district.name
                                    .replace(" District", "")
                                    .replace(" Tripura", "")}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {distributionRate.toFixed(0)}% dist.
                                </div>
                                <div
                                  className={`text-xs font-medium ${status.text} mt-1`}
                                >
                                  {status.label}
                                </div>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* Chart Legend */}
                    <div className="mt-6 flex flex-wrap justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Healthy Stock (80%+)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Low Stock (50-80%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Critical Stock (below 50%)
                        </span>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 p-4 bg-white rounded-lg border grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {
                            getDistrictData(
                              selectedPeriod,
                              selectedMetric,
                            ).filter(
                              (d) => d.booksDistributed / d.totalBooks >= 0.8,
                            ).length
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Healthy Districts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {
                            getDistrictData(
                              selectedPeriod,
                              selectedMetric,
                            ).filter((d) => {
                              const rate = d.booksDistributed / d.totalBooks;
                              return rate >= 0.5 && rate < 0.8;
                            }).length
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Low Stock Districts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {
                            getDistrictData(
                              selectedPeriod,
                              selectedMetric,
                            ).filter(
                              (d) => d.booksDistributed / d.totalBooks < 0.5,
                            ).length
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Critical Districts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Inventory Alert System - Distribution Issues
                </CardTitle>
                <CardDescription>
                  Critical inventory and distribution metrics requiring
                  attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {distributionMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            metric.status === "critical"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <span className="font-medium">{metric.metric}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            metric.status === "critical"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {metric.status === "critical"
                            ? "Critical"
                            : "Warning"}
                        </Badge>
                        <span className="font-bold">
                          {metric.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Critical (Immediate Action)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Warning (Monitor Closely)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject-wise Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Book Distribution</CardTitle>
                <CardDescription>
                  Interactive distribution breakdown by subjects across primary
                  and secondary levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectDistribution.map((subject, index) => {
                    const statusColors = {
                      critical: "bg-red-500",
                      low: "bg-orange-500",
                      adequate: "bg-yellow-500",
                      good: "bg-green-500",
                    };

                    const priorityColors = {
                      critical: "text-red-600",
                      high: "text-orange-600",
                      medium: "text-yellow-600",
                      low: "text-green-600",
                    };

                    return (
                      <div
                        key={subject.subject}
                        className="group hover:bg-gray-50 p-4 rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded ${statusColors[subject.stockStatus as keyof typeof statusColors]}`}
                            ></div>
                            <div>
                              <span className="font-medium text-sm">
                                {subject.subject}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${priorityColors[subject.priority as keyof typeof priorityColors]}`}
                                >
                                  {subject.priority.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Stock: {subject.stockStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {(subject.total / 1000).toFixed(0)}K
                            </div>
                            <div className="text-xs text-gray-500">
                              {subject.percentage}% of total
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                Primary (I-V):
                              </span>
                              <span className="font-medium">
                                {(subject.primary / 1000).toFixed(0)}K
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={
                                  subject.primary > 0
                                    ? (subject.primary / 200000) * 100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">
                                Secondary & Above:
                              </span>
                              <span className="font-medium">
                                {(subject.secondary / 1000).toFixed(0)}K
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={
                                  subject.secondary > 0
                                    ? (subject.secondary / 200000) * 100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional details on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="text-xs text-gray-600 grid grid-cols-3 gap-4 pt-2 border-t">
                            <div>
                              <span>Total Books:</span>
                              <div className="font-medium">
                                {subject.total.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span>Priority Level:</span>
                              <div
                                className={`font-medium ${priorityColors[subject.priority as keyof typeof priorityColors]}`}
                              >
                                {subject.priority.charAt(0).toUpperCase() +
                                  subject.priority.slice(1)}
                              </div>
                            </div>
                            <div>
                              <span>Stock Status:</span>
                              <div className="font-medium capitalize">
                                {subject.stockStatus}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subject Summary */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-red-800">
                      Critical Priority
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {
                        subjectDistribution.filter(
                          (s) => s.priority === "critical",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-red-600">subjects</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">
                      High Priority
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {
                        subjectDistribution.filter((s) => s.priority === "high")
                          .length
                      }
                    </div>
                    <div className="text-xs text-orange-600">subjects</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">
                      Medium Priority
                    </div>
                    <div className="text-lg font-bold text-yellow-600">
                      {
                        subjectDistribution.filter(
                          (s) => s.priority === "medium",
                        ).length
                      }
                    </div>
                    <div className="text-xs text-yellow-600">subjects</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">
                      Low Priority
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {
                        subjectDistribution.filter((s) => s.priority === "low")
                          .length
                      }
                    </div>
                    <div className="text-xs text-green-600">subjects</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Ranking Chart - Similar to first image */}
            <Card>
              <CardHeader>
                <CardTitle>District Performance Ranking</CardTitle>
                <CardDescription>
                  Distribution efficiency ranking across all districts with
                  interactive filtering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chart Controls */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Select
                      value={selectedMetric}
                      onValueChange={setSelectedMetric}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book-distribution">
                          Distribution Rate
                        </SelectItem>
                        <SelectItem value="efficiency">
                          Efficiency Score
                        </SelectItem>
                        <SelectItem value="inventory-turnover">
                          Inventory Turnover
                        </SelectItem>
                        <SelectItem value="books-per-school">
                          Books per School
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedPeriod}
                      onValueChange={setSelectedPeriod}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-month">
                          Current Month
                        </SelectItem>
                        <SelectItem value="last-3-months">
                          Last 3 Months
                        </SelectItem>
                        <SelectItem value="last-6-months">
                          Last 6 Months
                        </SelectItem>
                        <SelectItem value="year-to-date">
                          Year to Date
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vertical Bar Chart */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border">
                    <div className="flex items-end justify-between h-96 gap-4">
                      {getDistrictData(selectedPeriod, selectedMetric)
                        .sort((a, b) => {
                          const aValue =
                            selectedMetric === "book-distribution"
                              ? a.distributionRate
                              : selectedMetric === "efficiency"
                                ? a.efficiency
                                : selectedMetric === "inventory-turnover"
                                  ? a.inventoryTurnover
                                  : a.avgBooksPerSchool;
                          const bValue =
                            selectedMetric === "book-distribution"
                              ? b.distributionRate
                              : selectedMetric === "efficiency"
                                ? b.efficiency
                                : selectedMetric === "inventory-turnover"
                                  ? b.inventoryTurnover
                                  : b.avgBooksPerSchool;
                          return bValue - aValue;
                        })
                        .map((district, index) => {
                          const value =
                            selectedMetric === "book-distribution"
                              ? district.distributionRate
                              : selectedMetric === "efficiency"
                                ? district.efficiency
                                : selectedMetric === "inventory-turnover"
                                  ? district.inventoryTurnover
                                  : district.avgBooksPerSchool;

                          const maxValue =
                            selectedMetric === "books-per-school" ? 450 : 100;
                          const percentage = (value / maxValue) * 100;

                          // Color coding based on performance
                          const getBarColor = (val: number, metric: string) => {
                            if (metric === "books-per-school") {
                              if (val >= 350)
                                return "bg-gradient-to-t from-green-500 to-green-400";
                              if (val >= 300)
                                return "bg-gradient-to-t from-yellow-500 to-yellow-400";
                              return "bg-gradient-to-t from-red-500 to-red-400";
                            } else {
                              if (val >= 80)
                                return "bg-gradient-to-t from-green-500 to-green-400";
                              if (val >= 60)
                                return "bg-gradient-to-t from-yellow-500 to-yellow-400";
                              return "bg-gradient-to-t from-red-500 to-red-400";
                            }
                          };

                          return (
                            <div
                              key={district.name}
                              className="flex flex-col items-center group relative"
                            >
                              {/* Bar container */}
                              <div className="relative h-80 w-16 flex items-end mb-4">
                                <div
                                  className={`w-full ${getBarColor(value, selectedMetric)} rounded-t-lg transition-all duration-700 ease-out group-hover:shadow-lg group-hover:scale-105 cursor-pointer relative`}
                                  style={{
                                    height: `${Math.max(Math.round((value / maxValue) * 300), 20)}px`,
                                  }}
                                >
                                  {/* Value label on top of bar */}
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {selectedMetric === "books-per-school"
                                      ? Math.round(value)
                                      : `${value.toFixed(1)}%`}
                                  </div>

                                  {/* Rank indicator inside bar */}
                                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold bg-black bg-opacity-30 rounded-full w-6 h-6 flex items-center justify-center">
                                    #{index + 1}
                                  </div>
                                </div>

                                {/* Hover tooltip */}
                                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                  <div className="text-center">
                                    <div className="font-bold">
                                      {district.name}
                                    </div>
                                    <div className="text-gray-300">
                                      Rank #{index + 1}
                                    </div>
                                    <div className="text-gray-300">
                                      {selectedMetric === "books-per-school"
                                        ? `${Math.round(value)} books/school`
                                        : `${value.toFixed(1)}%`}
                                    </div>
                                    <div className="text-gray-300">
                                      Schools: {district.schools}
                                    </div>
                                    <div className="text-gray-300">
                                      Books:{" "}
                                      {(district.totalBooks / 1000).toFixed(0)}K
                                    </div>
                                  </div>
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                              </div>

                              {/* District label and performance indicator */}
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-700 mb-1">
                                  {district.name.replace(" District", "")}
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      value >=
                                      (selectedMetric === "books-per-school"
                                        ? 350
                                        : 80)
                                        ? "bg-green-500"
                                        : value >=
                                            (selectedMetric ===
                                            "books-per-school"
                                              ? 300
                                              : 60)
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                  ></div>
                                  <span className="text-xs text-gray-600 font-medium">
                                    {selectedMetric === "books-per-school"
                                      ? `${Math.round(value)}`
                                      : `${value.toFixed(1)}%`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Y-axis label */}
                    <div
                      className="absolute left-2 top-1/2 transform -rotate-90 text-sm text-gray-600 font-medium"
                      style={{ transformOrigin: "center" }}
                    >
                      {selectedMetric === "book-distribution"
                        ? "Distribution Rate (%)"
                        : selectedMetric === "efficiency"
                          ? "Efficiency Score (%)"
                          : selectedMetric === "inventory-turnover"
                            ? "Inventory Turnover (%)"
                            : "Books per School"}
                    </div>

                    {/* Chart Legend */}
                    <div className="mt-6 flex flex-wrap justify-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Excellent (
                          {selectedMetric === "books-per-school"
                            ? "350+"
                            : "80%+"}
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Good (
                          {selectedMetric === "books-per-school"
                            ? "300-349"
                            : "60-79%"}
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-600 font-medium">
                          Needs Improvement (
                          {selectedMetric === "books-per-school"
                            ? "<300"
                            : "<60%"}
                          )
                        </span>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 p-4 bg-white rounded-lg border grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {
                            getDistrictData(
                              selectedPeriod,
                              selectedMetric,
                            ).filter((d) => {
                              const val =
                                selectedMetric === "book-distribution"
                                  ? d.distributionRate
                                  : selectedMetric === "efficiency"
                                    ? d.efficiency
                                    : selectedMetric === "inventory-turnover"
                                      ? d.inventoryTurnover
                                      : d.avgBooksPerSchool;
                              return (
                                val >=
                                (selectedMetric === "books-per-school"
                                  ? 350
                                  : 80)
                              );
                            }).length
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Excellent Performance
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {
                            getDistrictData(
                              selectedPeriod,
                              selectedMetric,
                            ).filter((d) => {
                              const val =
                                selectedMetric === "book-distribution"
                                  ? d.distributionRate
                                  : selectedMetric === "efficiency"
                                    ? d.efficiency
                                    : selectedMetric === "inventory-turnover"
                                      ? d.inventoryTurnover
                                      : d.avgBooksPerSchool;
                              const min =
                                selectedMetric === "books-per-school"
                                  ? 300
                                  : 60;
                              const max =
                                selectedMetric === "books-per-school"
                                  ? 349
                                  : 79;
                              return val >= min && val <= max;
                            }).length
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Good Performance
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {
                            getDistrictData(
                              selectedPeriod,
                              selectedMetric,
                            ).filter((d) => {
                              const val =
                                selectedMetric === "book-distribution"
                                  ? d.distributionRate
                                  : selectedMetric === "efficiency"
                                    ? d.efficiency
                                    : selectedMetric === "inventory-turnover"
                                      ? d.inventoryTurnover
                                      : d.avgBooksPerSchool;
                              return (
                                val <
                                (selectedMetric === "books-per-school"
                                  ? 300
                                  : 60)
                              );
                            }).length
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Needs Improvement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Multi-line Trend Chart - Similar to third image */}
            <Card>
              <CardHeader>
                <CardTitle>District Performance Trends</CardTitle>
                <CardDescription>
                  Monthly ranking trends with interactive district toggles
                  (Period: {selectedPeriod})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* District Toggle Controls */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {districtData.slice(0, 8).map((district, index) => {
                      const districtColors = [
                        "border-blue-500 text-blue-600 bg-blue-50",
                        "border-green-500 text-green-600 bg-green-50",
                        "border-red-500 text-red-600 bg-red-50",
                        "border-purple-500 text-purple-600 bg-purple-50",
                        "border-yellow-500 text-yellow-600 bg-yellow-50",
                        "border-indigo-500 text-indigo-600 bg-indigo-50",
                        "border-pink-500 text-pink-600 bg-pink-50",
                        "border-orange-500 text-orange-600 bg-orange-50",
                      ];

                      return (
                        <button
                          key={district.name}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${districtColors[index]}`}
                        >
                          {district.name.replace(" District", "")}
                        </button>
                      );
                    })}
                  </div>

                  {/* Line Chart Area */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-white border rounded-lg h-96 p-6">
                    <div className="absolute inset-6">
                      {/* Chart title and rank indicator */}
                      <div className="absolute -top-4 left-0 text-xs font-medium text-gray-600">
                        Rank (Lower is Better)
                      </div>

                      {/* Grid lines and rank labels */}
                      <div className="absolute inset-0">
                        {/* Horizontal grid lines for ranks */}
                        {[1, 2, 3, 4, 5].map((rank) => (
                          <div
                            key={rank}
                            className="absolute w-full flex items-center"
                            style={{ top: `${(rank - 1) * 25}%` }}
                          >
                            <div className="text-xs text-gray-500 -ml-8 w-6 text-center">
                              #{rank}
                            </div>
                            <div className="flex-1 border-t border-gray-200"></div>
                          </div>
                        ))}

                        {/* Vertical grid lines for months */}
                        {monthlyDistribution.map((_, index) => (
                          <div
                            key={index}
                            className="absolute h-full border-l border-gray-200"
                            style={{
                              left: `${index * (100 / (monthlyDistribution.length - 1))}%`,
                            }}
                          ></div>
                        ))}
                      </div>

                      {/* District trend lines */}
                      <svg
                        className="absolute inset-0 w-full h-full"
                        style={{ overflow: "visible" }}
                      >
                        {districtData
                          .slice(0, 6)
                          .map((district, districtIndex) => {
                            const lineColors = [
                              "#3b82f6", // blue
                              "#22c55e", // green
                              "#ef4444", // red
                              "#8b5cf6", // purple
                              "#f59e0b", // yellow
                              "#6366f1", // indigo
                            ];

                            // Generate trend data for this district
                            const trendPoints = monthlyDistribution.map(
                              (month, monthIndex) => {
                                const rank =
                                  month.rank[district.name] ||
                                  5 - districtIndex; // Fallback rank
                                const x =
                                  (monthIndex /
                                    (monthlyDistribution.length - 1)) *
                                  100;
                                const y = ((rank - 1) / 4) * 100;
                                return { x, y, rank, month: month.month };
                              },
                            );

                            // Create path for line
                            const pathData = trendPoints
                              .map((point, index) => {
                                const command = index === 0 ? "M" : "L";
                                return `${command} ${point.x}% ${point.y}%`;
                              })
                              .join(" ");

                            return (
                              <g key={district.name}>
                                {/* Trend line */}
                                <path
                                  d={pathData}
                                  fill="none"
                                  stroke={lineColors[districtIndex]}
                                  strokeWidth="3"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  className="transition-all duration-300 hover:stroke-4"
                                  style={{
                                    filter:
                                      "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                                  }}
                                />

                                {/* Data points */}
                                {trendPoints.map((point, pointIndex) => (
                                  <circle
                                    key={`${district.name}-${pointIndex}`}
                                    cx={`${point.x}%`}
                                    cy={`${point.y}%`}
                                    r="5"
                                    fill={lineColors[districtIndex]}
                                    stroke="white"
                                    strokeWidth="2"
                                    className="cursor-pointer transition-all duration-200 hover:r-8"
                                    style={{
                                      filter:
                                        "drop-shadow(0 1px 3px rgba(0,0,0,0.2))",
                                    }}
                                  >
                                    <title>{`${district.name} - ${point.month}: Rank #${point.rank}`}</title>
                                  </circle>
                                ))}
                              </g>
                            );
                          })}
                      </svg>

                      {/* X-axis labels (months) */}
                      <div className="absolute -bottom-8 inset-x-0 flex justify-between text-sm text-gray-600">
                        {monthlyDistribution.map((month) => (
                          <div
                            key={month.month}
                            className="text-center font-medium"
                          >
                            {month.month}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Legend with current ranks */}
                    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
                      <div className="text-sm font-semibold text-gray-700 mb-3">
                        Districts
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {districtData.slice(0, 6).map((district, index) => {
                          const colors = [
                            "text-blue-600",
                            "text-green-600",
                            "text-red-600",
                            "text-purple-600",
                            "text-yellow-600",
                            "text-indigo-600",
                          ];
                          const bgColors = [
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-red-500",
                            "bg-purple-500",
                            "bg-yellow-500",
                            "bg-indigo-500",
                          ];
                          const currentRank =
                            monthlyDistribution[monthlyDistribution.length - 1]
                              ?.rank[district.name] || 5 - index;

                          return (
                            <div
                              key={district.name}
                              className={`text-xs flex items-center justify-between gap-3 p-2 rounded transition-colors hover:bg-gray-50`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${bgColors[index]}`}
                                ></div>
                                <span
                                  className={`font-medium ${colors[index]}`}
                                >
                                  {district.name.replace(" District", "")}
                                </span>
                              </div>
                              <div
                                className={`font-bold ${colors[index]} text-right`}
                              >
                                Rank #{currentRank}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Performance insights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-800">
                          Top Performers
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        {districtData
                          .sort(
                            (a, b) => b.distributionRate - a.distributionRate,
                          )
                          .slice(0, 3)
                          .map((district, index) => (
                            <div
                              key={district.name}
                              className="flex justify-between"
                            >
                              <span className="text-green-700">
                                #{index + 1}{" "}
                                {district.name.replace(" District", "")}
                              </span>
                              <span className="font-bold text-green-800">
                                {district.distributionRate.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">
                          Declining Trends
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        {districtData
                          .filter((d) => d.distributionRate < 70)
                          .slice(0, 3)
                          .map((district) => (
                            <div
                              key={district.name}
                              className="flex justify-between"
                            >
                              <span className="text-yellow-700">
                                {district.name.replace(" District", "")}
                              </span>
                              <span className="font-bold text-yellow-800">
                                {district.distributionRate.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-800">
                          Overall Stats
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Avg Efficiency:</span>
                          <span className="font-bold text-blue-800">
                            {(
                              districtData.reduce(
                                (sum, d) => sum + d.efficiency,
                                0,
                              ) / districtData.length
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Total Schools:</span>
                          <span className="font-bold text-blue-800">
                            {districtData
                              .reduce((sum, d) => sum + d.schools, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">
                            Books Distributed:
                          </span>
                          <span className="font-bold text-blue-800">
                            {(
                              districtData.reduce(
                                (sum, d) => sum + d.booksDistributed,
                                0,
                              ) / 1000000
                            ).toFixed(1)}
                            M
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* District Efficiency Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Efficiency Analytics</CardTitle>
                <CardDescription>
                  Comparative analysis responding to filter: {selectedPeriod} |{" "}
                  {selectedMetric}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {districtData.slice(0, 6).map((district) => {
                      const efficiency =
                        (district.booksDistributed / district.totalBooks) * 100;
                      const booksPerSchool = Math.round(
                        district.booksDistributed / district.schools,
                      );

                      return (
                        <Card key={district.name}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm">
                                {district.name}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Distribution Rate:</span>
                                  <span
                                    className={
                                      efficiency >= 85
                                        ? "text-green-600"
                                        : efficiency >= 70
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }
                                  >
                                    {efficiency.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Books/School:</span>
                                  <span className="font-medium">
                                    {booksPerSchool}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Schools:</span>
                                  <span>{district.schools}</span>
                                </div>
                              </div>
                              <Progress value={efficiency} className="h-2" />
                              <div className="flex items-center gap-1 text-xs">
                                {efficiency >= 85 ? (
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-red-600" />
                                )}
                                <span
                                  className={
                                    efficiency >= 85
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {efficiency >= 85
                                    ? "Excellent"
                                    : efficiency >= 70
                                      ? "Good"
                                      : "Needs Improvement"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Key Insights:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • West Tripura and South Tripura lead with 90%
                        distribution rates
                      </li>
                      <li>
                        • Sepahijala and Dhalai need immediate attention with
                        rates below 50%
                      </li>
                      <li>
                        • Average books per school ranges from 196 to 400 across
                        districts
                      </li>
                      <li>
                        • Total inventory:{" "}
                        {(
                          districtData.reduce(
                            (sum, d) => sum + d.totalBooks,
                            0,
                          ) / 1000000
                        ).toFixed(1)}
                        M books across{" "}
                        {districtData.reduce((sum, d) => sum + d.schools, 0)}{" "}
                        schools
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>District Performance Comparison</CardTitle>
                <CardDescription>
                  Multi-metric comparison across all districts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 border-b pb-2">
                    <div>District</div>
                    <div className="text-center">Schools</div>
                    <div className="text-center">Distribution Rate</div>
                    <div className="text-center">Avg Books/School</div>
                  </div>
                  {districtData.map((district, index) => (
                    <div
                      key={district.name}
                      className="grid grid-cols-4 gap-2 text-sm items-center py-2 border-b"
                    >
                      <div className="font-medium">{district.name}</div>
                      <div className="text-center">{district.schools}</div>
                      <div className="text-center">
                        <Badge
                          className={`${getDistributionStatusBadge(district.distributionRate).color} text-white text-xs`}
                        >
                          {district.distributionRate}%
                        </Badge>
                      </div>
                      <div className="text-center">
                        {district.avgBooksPerSchool}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
