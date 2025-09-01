import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  School,
  BookOpen,
  Users,
  Target,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { districtsAPI, reportsAPI } from "@/lib/api";
import html2pdf from "html2pdf.js";

// Types for report data
interface DetailedReportData {
  slNo: number;
  districtName?: string;
  isName?: string;
  schoolName?: string;
  class: string;
  enrollment: number;
  bookName: string;
  requirement: number;
  dispatched: number;
  availableStock: number;
}

interface ReportSummary {
  totalSchools: number;
  totalBlocks: number;
  totalEnrollment: number;
  totalBooksRequisitioned: number;
  totalBooksDistributed: number;
  pendingRequisitions: number;
  overallFulfillmentRate: string;
}

const Reports: React.FC = () => {
  const { toast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState<
    "district" | "is"
  >("district");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [districts, setDistricts] = useState<any[]>([]);
  const [districtWiseData, setDistrictWiseData] = useState<
    DetailedReportData[]
  >([]);
  const [isWiseData, setIsWiseData] = useState<DetailedReportData[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchDistricts();
    fetchReportSummary();
  }, []);

  useEffect(() => {
    if (selectedReportType === "district") {
      fetchDistrictWiseData();
    } else if (selectedReportType === "is") {
      fetchISWiseData();
    }
  }, [selectedReportType, selectedDistrict]);

  const fetchDistricts = async () => {
    try {
      const response = await districtsAPI.getAll();
      if (response.data.success) {
        setDistricts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch districts",
        variant: "destructive",
      });
    }
  };

  const fetchReportSummary = async () => {
    try {
      const response = await reportsAPI.getSummary();
      if (response.data.success) {
        setReportSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching report summary:", error);
    }
  };

  const fetchDistrictWiseData = async () => {
    setLoading(true);
    try {
      const params =
        selectedDistrict !== "all"
          ? { district: selectedDistrict.replace(/\s+/g, "_").toUpperCase() }
          : {};
      const response = await reportsAPI.getDetailedDistrictWise(params);

      if (response.data.success) {
        setDistrictWiseData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching district-wise data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch district-wise report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchISWiseData = async () => {
    setLoading(true);
    try {
      const params =
        selectedDistrict !== "all"
          ? { district: selectedDistrict.replace(/\s+/g, "_").toUpperCase() }
          : {};
      const response = await reportsAPI.getDetailedISWise(params);

      if (response.data.success) {
        setIsWiseData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching IS-wise data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch IS-wise report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    setGeneratingPDF(true);

    // Get current date and time in IST
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    const dateStr = istTime.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = istTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Create PDF content with proper headers
    const pdfContent = document.createElement("div");
    pdfContent.style.cssText = `
      font-family: Arial, sans-serif;
      padding: 20px;
      background: white;
      width: 100%;
      box-sizing: border-box;
    `;

    const reportTypeTitle =
      selectedReportType === "district"
        ? "District Wise Report"
        : "IS Wise Report";
    const selectedDistrictName =
      selectedDistrict === "all"
        ? "All Districts"
        : districts.find((d) => d.id === selectedDistrict)?.name ||
          selectedDistrict;

    pdfContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1a365d;">
          Government of Tripura
        </h1>
        <h2 style="margin: 10px 0; font-size: 20px; font-weight: 600; color: #2d3748;">
          ${reportTypeTitle}
        </h2>
        <div style="margin-top: 15px; font-size: 14px; color: #4a5568;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${dateStr}</p>
          <p style="margin: 5px 0;"><strong>Generated at:</strong> ${timeStr} IST</p>
          <p style="margin: 5px 0;"><strong>Scope:</strong> ${selectedDistrictName}</p>
        </div>
      </div>
      <div id="pdf-table-content"></div>
    `;

    // Create simplified table content for PDF
    const pdfTableContent = pdfContent.querySelector("#pdf-table-content");
    if (pdfTableContent) {
      // Apply responsive styles for PDF
      const style = document.createElement("style");
      style.textContent = `
        .pdf-table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 9px !important;
          margin: 20px 0 !important;
          background: white !important;
        }
        .pdf-table th {
          border: 1px solid #333 !important;
          padding: 8px 4px !important;
          text-align: center !important;
          background-color: #f0f0f0 !important;
          font-weight: bold !important;
          font-size: 10px !important;
          line-height: 1.2 !important;
          color: #000 !important;
        }
        .pdf-table td {
          border: 1px solid #333 !important;
          padding: 6px 4px !important;
          text-align: center !important;
          font-size: 9px !important;
          line-height: 1.2 !important;
          color: #000 !important;
          background: white !important;
        }
        .pdf-summary {
          margin-bottom: 20px !important;
          border: 1px solid #333 !important;
          padding: 15px !important;
          background: #f9f9f9 !important;
        }
        .pdf-summary h3 {
          font-size: 14px !important;
          font-weight: bold !important;
          margin: 0 0 10px 0 !important;
          color: #000 !important;
        }
        .pdf-summary-grid {
          display: flex !important;
          justify-content: space-around !important;
          flex-wrap: wrap !important;
        }
        .pdf-summary-item {
          text-align: center !important;
          margin: 5px !important;
          flex: 1 !important;
          min-width: 120px !important;
        }
        .pdf-summary-value {
          font-size: 16px !important;
          font-weight: bold !important;
          color: #000 !important;
        }
        .pdf-summary-label {
          font-size: 10px !important;
          color: #333 !important;
        }
      `;
      pdfContent.appendChild(style);

      // Generate simplified table HTML
      const data =
        selectedReportType === "district" ? districtWiseData : isWiseData;

      // Calculate totals
      const totals = data.reduce(
        (acc, item) => ({
          enrollment: acc.enrollment + item.enrollment,
          requirement: acc.requirement + item.requirement,
          dispatched: acc.dispatched + item.dispatched,
          availableStock: acc.availableStock + item.availableStock,
        }),
        { enrollment: 0, requirement: 0, dispatched: 0, availableStock: 0 },
      );

      const summaryHTML = `
        <div class="pdf-summary">
          <h3>${selectedReportType === "district" ? "District-wise" : "IS-wise"} Summary</h3>
          <div class="pdf-summary-grid">
            <div class="pdf-summary-item">
              <div class="pdf-summary-value">${totals.enrollment.toLocaleString()}</div>
              <div class="pdf-summary-label">Total Enrollment</div>
            </div>
            <div class="pdf-summary-item">
              <div class="pdf-summary-value">${totals.requirement.toLocaleString()}</div>
              <div class="pdf-summary-label">Total Requirement</div>
            </div>
            <div class="pdf-summary-item">
              <div class="pdf-summary-value">${totals.dispatched.toLocaleString()}</div>
              <div class="pdf-summary-label">Total Dispatched</div>
            </div>
            <div class="pdf-summary-item">
              <div class="pdf-summary-value">${totals.availableStock.toLocaleString()}</div>
              <div class="pdf-summary-label">Available Stock</div>
            </div>
          </div>
        </div>
      `;

      const tableHeaders =
        selectedReportType === "district"
          ? `<tr>
             <th>Sl. No.</th>
             <th>District</th>
             <th>IS Name</th>
             <th>Class</th>
             <th>Subject</th>
             <th>Title</th>
             <th>Enrollment</th>
             <th>Requirement</th>
             <th>Dispatched</th>
             <th>Available Stock</th>
           </tr>`
          : `<tr>
             <th>Sl. No.</th>
             <th>District</th>
             <th>IS Name</th>
             <th>School Name</th>
             <th>Class</th>
             <th>Subject</th>
             <th>Title</th>
             <th>Enrollment</th>
             <th>Requirement</th>
             <th>Dispatched</th>
             <th>Available Stock</th>
           </tr>`;

      const tableRows = data
        .map((item) => {
          const bookParts = item.bookName.split(" - ");
          const subject = bookParts[0] || "General";
          const title = bookParts[1] || item.bookName;

          return selectedReportType === "district"
            ? `<tr>
               <td>${item.slNo}</td>
               <td>${item.districtName}</td>
               <td>${item.isName}</td>
               <td>${item.class}</td>
               <td>${subject}</td>
               <td>${title}</td>
               <td>${item.enrollment.toLocaleString()}</td>
               <td>${item.requirement.toLocaleString()}</td>
               <td>${item.dispatched.toLocaleString()}</td>
               <td>${item.availableStock.toLocaleString()}</td>
             </tr>`
            : `<tr>
               <td>${item.slNo}</td>
               <td>${item.districtName}</td>
               <td>${item.isName}</td>
               <td>${item.schoolName}</td>
               <td>${item.class}</td>
               <td>${subject}</td>
               <td>${title}</td>
               <td>${item.enrollment.toLocaleString()}</td>
               <td>${item.requirement.toLocaleString()}</td>
               <td>${item.dispatched.toLocaleString()}</td>
               <td>${item.availableStock.toLocaleString()}</td>
             </tr>`;
        })
        .join("");

      pdfTableContent.innerHTML = `
        ${summaryHTML}
        <table class="pdf-table">
          <thead>
            ${tableHeaders}
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      `;
    }

    // Temporarily add to DOM for PDF generation
    document.body.appendChild(pdfContent);

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${reportTypeTitle.replace(" ", "_")}_${selectedDistrictName.replace(" ", "_")}_${dateStr.replace(/\//g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "landscape",
        compress: true,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(pdfContent)
      .save()
      .finally(() => {
        // Clean up
        document.body.removeChild(pdfContent);
        setGeneratingPDF(false);
        toast({
          title: "Success",
          description: "PDF generated successfully",
        });
      });
  };

  const renderDistrictWiseReport = () => {
    // Calculate totals
    const totals = districtWiseData.reduce(
      (acc, item) => ({
        enrollment: acc.enrollment + item.enrollment,
        requirement: acc.requirement + item.requirement,
        dispatched: acc.dispatched + item.dispatched,
        availableStock: acc.availableStock + item.availableStock,
      }),
      { enrollment: 0, requirement: 0, dispatched: 0, availableStock: 0 },
    );

    // Group data by district and IS for better organization
    const groupedData = districtWiseData.reduce(
      (acc, item) => {
        const districtKey = item.districtName || "Unknown District";
        const isKey = item.isName || "Unknown IS";

        if (!acc[districtKey]) {
          acc[districtKey] = {};
        }
        if (!acc[districtKey][isKey]) {
          acc[districtKey][isKey] = [];
        }
        acc[districtKey][isKey].push(item);
        return acc;
      },
      {} as Record<string, Record<string, DetailedReportData[]>>,
    );

    return (
      <div className="space-y-4">
        {/* Summary Section */}
        <div className="summary-section bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            District-wise Summary
          </h3>
          <div className="summary-grid grid grid-cols-4 gap-4 text-center">
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-blue-600">
                {totals.enrollment.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Total Enrollment
              </div>
            </div>
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-orange-600">
                {totals.requirement.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Total Requirement
              </div>
            </div>
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-green-600">
                {totals.dispatched.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Total Dispatched
              </div>
            </div>
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-yellow-600">
                {totals.availableStock.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Available Stock
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Sl. No.
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  District
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  IS Name
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Class
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Name of Subject
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Name of Title
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Enrollment
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Requirement
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Dispatched
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Available Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData)
                .map(([districtName, isData]) =>
                  Object.entries(isData)
                    .map(([isName, items], isIndex) =>
                      items.map((item, itemIndex) => {
                        const isFirstInDistrict =
                          isIndex === 0 && itemIndex === 0;
                        const isFirstInIS = itemIndex === 0;
                        const districtRowSpan =
                          Object.values(isData).flat().length;
                        const isRowSpan = items.length;

                        // Extract subject and title from book name
                        const bookParts = item.bookName.split(" - ");
                        const subject = bookParts[0] || "General";
                        const title = bookParts[1] || item.bookName;

                        return (
                          <tr
                            key={`${item.slNo}-${districtName}-${isName}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.slNo}
                            </td>
                            {isFirstInDistrict && (
                              <td
                                className="border border-gray-300 px-4 py-2 font-medium bg-blue-50 text-center align-top"
                                rowSpan={districtRowSpan}
                              >
                                {districtName}
                              </td>
                            )}
                            {isFirstInIS && (
                              <td
                                className="border border-gray-300 px-4 py-2 font-medium bg-green-50 text-center align-top"
                                rowSpan={isRowSpan}
                              >
                                {isName}
                              </td>
                            )}
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {item.class}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {subject}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 italic">
                              {title}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {item.enrollment.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.requirement.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center bg-green-100">
                              {item.dispatched.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  item.availableStock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {item.availableStock.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      }),
                    )
                    .flat(),
                )
                .flat()}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderISWiseReport = () => {
    // Calculate totals for IS-wise report
    const totals = isWiseData.reduce(
      (acc, item) => ({
        enrollment: acc.enrollment + item.enrollment,
        requirement: acc.requirement + item.requirement,
        dispatched: acc.dispatched + item.dispatched,
        availableStock: acc.availableStock + item.availableStock,
      }),
      { enrollment: 0, requirement: 0, dispatched: 0, availableStock: 0 },
    );

    // Group data by district, IS, and school for better organization
    const groupedData = isWiseData.reduce(
      (acc, item) => {
        const districtKey = item.districtName || "Unknown District";
        const isKey = item.isName || "Unknown IS";
        const schoolKey = item.schoolName || "Unknown School";

        if (!acc[districtKey]) {
          acc[districtKey] = {};
        }
        if (!acc[districtKey][isKey]) {
          acc[districtKey][isKey] = {};
        }
        if (!acc[districtKey][isKey][schoolKey]) {
          acc[districtKey][isKey][schoolKey] = [];
        }
        acc[districtKey][isKey][schoolKey].push(item);
        return acc;
      },
      {} as Record<
        string,
        Record<string, Record<string, DetailedReportData[]>>
      >,
    );

    return (
      <div className="space-y-4">
        {/* Summary Section */}
        <div className="summary-section bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            IS-wise Summary
          </h3>
          <div className="summary-grid grid grid-cols-4 gap-4 text-center">
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-blue-600">
                {totals.enrollment.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Total Enrollment
              </div>
            </div>
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-orange-600">
                {totals.requirement.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Total Requirement
              </div>
            </div>
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-green-600">
                {totals.dispatched.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Total Dispatched
              </div>
            </div>
            <div className="summary-card bg-white p-3 rounded shadow">
              <div className="summary-value text-2xl font-bold text-yellow-600">
                {totals.availableStock.toLocaleString()}
              </div>
              <div className="summary-label text-sm text-gray-600">
                Available Stock
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Sl. No.
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  District
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  IS Name
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  School Name
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Class
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Name of Subject
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                  Name of Title
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Enrollment
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Requirement
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Dispatched
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                  Available Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([districtName, isData]) =>
                Object.entries(isData).map(([isName, schoolData]) =>
                  Object.entries(schoolData).map(
                    ([schoolName, items], schoolIndex) =>
                      items.map((item, itemIndex) => {
                        const isFirstInDistrict =
                          Object.entries(isData)
                            .flatMap(([, schools]) =>
                              Object.entries(schools).flatMap(
                                ([, schoolItems]) => schoolItems,
                              ),
                            )
                            .indexOf(item) === 0;

                        const isFirstInIS =
                          Object.values(schoolData).flat().indexOf(item) === 0;
                        const isFirstInSchool = itemIndex === 0;

                        const districtRowSpan = Object.values(isData).flatMap(
                          (isEntry) => Object.values(isEntry).flat(),
                        ).length;

                        const isRowSpan =
                          Object.values(schoolData).flat().length;
                        const schoolRowSpan = items.length;

                        // Extract subject and title from book name
                        const bookParts = item.bookName.split(" - ");
                        const subject = bookParts[0] || "General";
                        const title = bookParts[1] || item.bookName;

                        return (
                          <tr
                            key={`${item.slNo}-${districtName}-${isName}-${schoolName}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.slNo}
                            </td>
                            {isFirstInDistrict && (
                              <td
                                className="border border-gray-300 px-4 py-2 font-medium bg-blue-50 text-center align-top"
                                rowSpan={districtRowSpan}
                              >
                                {districtName}
                              </td>
                            )}
                            {isFirstInIS && (
                              <td
                                className="border border-gray-300 px-4 py-2 font-medium bg-green-50 text-center align-top"
                                rowSpan={isRowSpan}
                              >
                                {isName}
                              </td>
                            )}
                            {isFirstInSchool && (
                              <td
                                className="border border-gray-300 px-4 py-2 font-medium bg-yellow-50 text-center align-top"
                                rowSpan={schoolRowSpan}
                              >
                                {schoolName}
                              </td>
                            )}
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {item.class}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {subject}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 italic">
                              {title}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                              {item.enrollment.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {item.requirement.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center bg-green-100">
                              {item.dispatched.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <span
                                className={`px-2 py-1 rounded text-sm font-medium ${
                                  item.availableStock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {item.availableStock.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      }),
                  ),
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Reports"
      description="Comprehensive reports on textbook distribution"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive reports on textbook distribution
            </p>
          </div>
          <Button
            onClick={generatePDF}
            disabled={generatingPDF || loading}
            className="flex items-center space-x-2"
          >
            {generatingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{generatingPDF ? "Generating..." : "Download PDF"}</span>
          </Button>
        </div>

        {/* Summary Cards */}
        {reportSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <School className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {reportSummary.totalSchools.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Schools</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {reportSummary.totalEnrollment.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Enrollment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {reportSummary.totalBooksDistributed.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Books Distributed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {reportSummary.overallFulfillmentRate}%
                    </p>
                    <p className="text-sm text-gray-600">Fulfillment Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Report Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Report Type
                </label>
                <Select
                  value={selectedReportType}
                  onValueChange={(value: "district" | "is") =>
                    setSelectedReportType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district">
                      District Wise Report
                    </SelectItem>
                    <SelectItem value="is">IS Wise Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  District
                </label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedReportType === "district"
                ? "District Wise Report"
                : "IS Wise Report"}
            </CardTitle>
            <CardDescription>
              {selectedReportType === "district"
                ? "District-wise textbook distribution statistics"
                : "IS-wise textbook distribution statistics"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div id="report-content">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : selectedReportType === "district" ? (
                renderDistrictWiseReport()
              ) : (
                renderISWiseReport()
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Reports;
