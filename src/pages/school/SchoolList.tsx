import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function SchoolList() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const district = queryParams.get("district");
  const block = queryParams.get("block");

  // NOTE: The current hardcoded school data does not contain district/block information.
  // In a real application, you would fetch filtered data from an API based on district/block.
  const allSchools = [
    { udise: "16010100108", name: "DAKSHIN LANKAMURA J.B SCHOOL", district: "West Tripura", block: "Agartala Municipal Corporation", principal: "Mr. R.K. Sharma", principalPhoneNumber: "+91-9876543210", booksReceived: 1200, totalRequisition: 1350, studentsEnrolled: 450 },
    { udise: "16010100109", name: "LANKAMURA H.S. SCHOOL", district: "West Tripura", block: "Agartala Municipal Corporation", principal: "Ms. S. Devi", principalPhoneNumber: "+91-9876543211", booksReceived: 1500, totalRequisition: 1600, studentsEnrolled: 500 },
    { udise: "16010100110", name: "DAKSHIN NARAYANPUR SB SCHOOL", district: "West Tripura", block: "Agartala Municipal Corporation", principal: "Mr. A. Singh", principalPhoneNumber: "+91-9876543212", booksReceived: 900, totalRequisition: 980, studentsEnrolled: 300 },
    { udise: "16010100207", name: "MADHYA BHUBANBAN H.S SCHOOL", district: "West Tripura", block: "Dhukli", principal: "Mrs. P. Kaur", principalPhoneNumber: "+91-9876543213", booksReceived: 1100, totalRequisition: 1200, studentsEnrolled: 400 },
    { udise: "16010100209", name: "PASCHIM BHUBANBAN ENG.MED. SCHOOL", district: "West Tripura", block: "Dhukli", principal: "Mr. V. Singh", principalPhoneNumber: "+91-9876543214", booksReceived: 1300, totalRequisition: 1400, studentsEnrolled: 480 },
    { udise: "16010100223", name: "SANMURA S.B.SCHOOL", district: "West Tripura", block: "Dhukli", principal: "Ms. R. Begum", principalPhoneNumber: "+91-9876543215", booksReceived: 800, totalRequisition: 850, studentsEnrolled: 280 },
    { udise: "16010100224", name: "LANKAMURA WORD NO-3 J.B SCHOOL", district: "West Tripura", block: "Dhukli", principal: "Mr. K. Das", principalPhoneNumber: "+91-9876543216", booksReceived: 1000, totalRequisition: 1050, studentsEnrolled: 350 },
    { udise: "16010100225", name: "NARSINGARH HS SCHOOL", district: "West Tripura", block: "Mohanpur", principal: "Mrs. L. Devi", principalPhoneNumber: "+91-9876543217", booksReceived: 1400, totalRequisition: 1500, studentsEnrolled: 520 },
    { udise: "16010100226", name: "SUKHAMOY H.S SCHOOL", district: "West Tripura", block: "Mohanpur", principal: "Mr. S. Kumar", principalPhoneNumber: "+91-9876543218", booksReceived: 1600, totalRequisition: 1700, studentsEnrolled: 600 },
    { udise: "16010100227", name: "AMBEDKAR MEMORIAL HIGH SCHOOL.", district: "West Tripura", block: "Mohanpur", principal: "Ms. G. Rani", principalPhoneNumber: "+91-9876543219", booksReceived: 1250, totalRequisition: 1300, studentsEnrolled: 470 },
    { udise: "16010100306", name: "BARJALA HS SCHOOL", district: "West Tripura", block: "Hezamara", principal: "Mr. B. Roy", principalPhoneNumber: "+91-9876543220", booksReceived: 950, totalRequisition: 1000, studentsEnrolled: 330 },
    { udise: "16010100307", name: "DURJOYNAGAR SB SCHOOL", district: "West Tripura", block: "Hezamara", principal: "Ms. C. Ghosh", principalPhoneNumber: "+91-9876543221", booksReceived: 1050, totalRequisition: 1100, studentsEnrolled: 380 },
    { udise: "16010100419", name: "SOUTH BARJALA J.B SCHOOL", district: "West Tripura", block: "Mandai", principal: "Mr. D. Saha", principalPhoneNumber: "+91-9876543222", booksReceived: 700, totalRequisition: 750, studentsEnrolled: 250 },
    { udise: "16010101001", name: "SUKHAMOY H.S SCHOOL", district: "Dhalai", block: "Ambassa", principal: "Mr. E. Khan", principalPhoneNumber: "+91-9876543223", booksReceived: 600, totalRequisition: 650, studentsEnrolled: 200 },
    { udise: "16010101002", name: "DURJOYNAGAR SB SCHOOL", district: "Dhalai", block: "Ambassa", principal: "Ms. F. Begum", principalPhoneNumber: "+91-9876543224", booksReceived: 850, totalRequisition: 900, studentsEnrolled: 310 },
    { udise: "16010101003", name: "LANKAMURA WORD NO-3 J.B SCHOOL", district: "Dhalai", block: "Gandachera", principal: "Mr. G. Das", principalPhoneNumber: "+91-9876543225", booksReceived: 920, totalRequisition: 950, studentsEnrolled: 340 },
    { udise: "16010101004", name: "DAKSHIN NARAYANPUR SB SCHOOL", district: "Dhalai", block: "Gandachera", principal: "Ms. H. Devi", principalPhoneNumber: "+91-9876543226", booksReceived: 780, totalRequisition: 820, studentsEnrolled: 270 },
    { udise: "16010101005", name: "SUKHAMOY H.S SCHOOL", district: "Gomati", block: "Udaipur", principal: "Mr. I. Singh", principalPhoneNumber: "+91-9876543227", booksReceived: 1150, totalRequisition: 1200, studentsEnrolled: 420 },
    { udise: "16010101006", name: "PASCHIM BHUBANBAN ENG.MED. SCHOOL", district: "Gomati", block: "Udaipur", principal: "Ms. J. Kaur", principalPhoneNumber: "+91-9876543228", booksReceived: 1020, totalRequisition: 1080, studentsEnrolled: 360 },
    { udise: "16010101007", name: "SUKHAMOY H.S SCHOOL", district: "Gomati", block: "Amarpur", principal: "Mr. K. Sharma", principalPhoneNumber: "+91-9876543229", booksReceived: 890, totalRequisition: 930, studentsEnrolled: 320 },
    { udise: "16010101008", name: "DAKSHIN NARAYANPUR SB SCHOOL", district: "Gomati", block: "Amarpur", principal: "Ms. L. Devi", principalPhoneNumber: "+91-9876543230", booksReceived: 750, totalRequisition: 790, studentsEnrolled: 260 },
  ];

  const schools = allSchools.filter(school => {
    let match = true;
    if (district && school.district !== district) {
      match = false;
    }
    if (block && school.block !== block) {
      match = false;
    }
    return match;
  });

  let title = "School List";
  let description = "List of all schools with their UDISE codes.";

  if (district && block) {
    title = `Schools in ${block} (${district})`;
    description = `List of schools in ${block} block, ${district} district.`;
  } else if (district) {
    title = `Schools in ${district}`;
    description = `List of schools in ${district} district.`;
  } else if (block) {
    title = `Schools in ${block}`; // This case might not be reachable with current routing
    description = `List of schools in ${block} block.`;
  }

  return (
    <AdminLayout
      title={title}
      description={description}
    >
      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
          <CardDescription>
            Here you can view all registered schools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.length > 0 ? (
              schools.map((school, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{school.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      UDISE Code: {school.udise}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Principal: {school.principal} (Ph: {school.principalPhoneNumber})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Books Received: {school.booksReceived} | Total Requisition: {school.totalRequisition}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Students Enrolled: {school.studentsEnrolled}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/school-details/${school.udise}`, { state: { schoolName: school.name, studentsEnrolled: school.studentsEnrolled } })}
                  >
                    Manage
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No schools found for the selected criteria.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}