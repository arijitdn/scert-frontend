import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateProfile() {
  // Replace the districts state initialization with real Tripura data
  const tripuraDistricts = [
    {
      id: "DHALAI",
      name: "Dhalai",
      blocks: [
        { id: "AMBASSA", name: "Ambassa" },
        { id: "GANDACHERA", name: "Gandachera" },
      ],
    },
    {
      id: "GOMATI",
      name: "Gomati",
      blocks: [
        { id: "UDAIPUR", name: "Udaipur" },
        { id: "AMARPUR", name: "Amarpur" },
      ],
    },
    {
      id: "KHOWAI",
      name: "Khowai",
      blocks: [],
    },
    {
      id: "NORTH_TRIPURA",
      name: "North Tripura",
      blocks: [],
    },
    {
      id: "SEPAHIJALA",
      name: "Sepahijala",
      blocks: [],
    },
    {
      id: "SOUTH_TRIPURA",
      name: "South Tripura",
      blocks: [],
    },
    {
      id: "UNAKOTI",
      name: "Unakoti",
      blocks: [],
    },
    {
      id: "WEST_TRIPURA",
      name: "West Tripura",
      blocks: [
        { id: "AGARTALA_MC", name: "Agartala Municipal Corporation" },
        { id: "DHUKLI", name: "Dhukli" },
        { id: "MOHANPUR", name: "Mohanpur" },
        { id: "HEZAMARA", name: "Hezamara" },
        { id: "MANDAI", name: "Mandai" },
      ],
    },
  ];

  // School data from SchoolList
  const allSchools = [
    {
      udise: "16010100108",
      name: "DAKSHIN LANKAMURA J.B SCHOOL",
      district: "West Tripura",
      block: "Agartala Municipal Corporation",
    },
    {
      udise: "16010100109",
      name: "LANKAMURA H.S. SCHOOL",
      district: "West Tripura",
      block: "Agartala Municipal Corporation",
    },
    {
      udise: "16010100110",
      name: "DAKSHIN NARAYANPUR SB SCHOOL",
      district: "West Tripura",
      block: "Agartala Municipal Corporation",
    },
    {
      udise: "16010100207",
      name: "MADHYA BHUBANBAN H.S SCHOOL",
      district: "West Tripura",
      block: "Dhukli",
    },
    {
      udise: "16010100209",
      name: "PASCHIM BHUBANBAN ENG.MED. SCHOOL",
      district: "West Tripura",
      block: "Dhukli",
    },
    {
      udise: "16010100223",
      name: "SANMURA S.B.SCHOOL",
      district: "West Tripura",
      block: "Dhukli",
    },
    {
      udise: "16010100224",
      name: "LANKAMURA WORD NO-3 J.B SCHOOL",
      district: "West Tripura",
      block: "Dhukli",
    },
    {
      udise: "16010100225",
      name: "NARSINGARH HS SCHOOL",
      district: "West Tripura",
      block: "Mohanpur",
    },
    {
      udise: "16010100226",
      name: "SUKHAMOY H.S SCHOOL",
      district: "West Tripura",
      block: "Mohanpur",
    },
    {
      udise: "16010100227",
      name: "AMBEDKAR MEMORIAL HIGH SCHOOL.",
      district: "West Tripura",
      block: "Mohanpur",
    },
    {
      udise: "16010100306",
      name: "BARJALA HS SCHOOL",
      district: "West Tripura",
      block: "Hezamara",
    },
    {
      udise: "16010100307",
      name: "DURJOYNAGAR SB SCHOOL",
      district: "West Tripura",
      block: "Hezamara",
    },
    {
      udise: "16010100419",
      name: "SOUTH BARJALA J.B SCHOOL",
      district: "West Tripura",
      block: "Mandai",
    },
    {
      udise: "16010101001",
      name: "SUKHAMOY H.S SCHOOL",
      district: "Dhalai",
      block: "Ambassa",
    },
    {
      udise: "16010101002",
      name: "DURJOYNAGAR SB SCHOOL",
      district: "Dhalai",
      block: "Ambassa",
    },
    {
      udise: "16010101003",
      name: "LANKAMURA WORD NO-3 J.B SCHOOL",
      district: "Dhalai",
      block: "Gandachera",
    },
    {
      udise: "16010101004",
      name: "DAKSHIN NARAYANPUR SB SCHOOL",
      district: "Dhalai",
      block: "Gandachera",
    },
    {
      udise: "16010101005",
      name: "SUKHAMOY H.S SCHOOL",
      district: "Gomati",
      block: "Udaipur",
    },
    {
      udise: "16010101006",
      name: "PASCHIM BHUBANBAN ENG.MED. SCHOOL",
      district: "Gomati",
      block: "Udaipur",
    },
    {
      udise: "16010101007",
      name: "SUKHAMOY H.S SCHOOL",
      district: "Gomati",
      block: "Amarpur",
    },
    {
      udise: "16010101008",
      name: "DAKSHIN NARAYANPUR SB SCHOOL",
      district: "Gomati",
      block: "Amarpur",
    },
  ];

  const [districts, setDistricts] = useState(tripuraDistricts);

  // Add password state for each district
  const [districtPasswords, setDistrictPasswords] = useState(() =>
    Object.fromEntries(tripuraDistricts.map((d) => [d.id, "password123"])),
  );

  // Add password state for each block
  const getAllBlockIds = (districts) =>
    districts.flatMap((d) => d.blocks.map((b) => `${d.id}__${b.id}`));
  const [blockPasswords, setBlockPasswords] = useState(() =>
    Object.fromEntries(
      getAllBlockIds(tripuraDistricts).map((id) => [id, "password123"]),
    ),
  );

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [editingDistrictId, setEditingDistrictId] = useState(null);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editedPhoneNumber, setEditedPhoneNumber] = useState("");

  const navigate = useNavigate();

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
    setSelectedBlock(null); // Reset selected block when a new district is chosen
    setEditingDistrictId(null); // Exit edit mode for districts
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
    setEditingBlockId(null); // Exit edit mode for blocks
  };

  const handleBackToDistricts = () => {
    setSelectedDistrict(null);
    setSelectedBlock(null);
    setEditingDistrictId(null);
    setEditingBlockId(null);
  };

  const handleBackToBlocks = () => {
    setSelectedBlock(null);
    setEditingBlockId(null);
  };

  const handleEditDistrictPhone = (districtId, currentPhone) => {
    setEditingDistrictId(districtId);
    setEditedPhoneNumber(currentPhone);
  };

  const handleSaveDistrictPhone = (districtId) => {
    setDistricts((prevDistricts) =>
      prevDistricts.map((district) =>
        district.id === districtId
          ? { ...district, phone: editedPhoneNumber }
          : district,
      ),
    );
    setEditingDistrictId(null);
    setEditedPhoneNumber("");
  };

  const handleResetDistrictPassword = (districtId) => {
    setDistrictPasswords((prev) => ({ ...prev, [districtId]: "password123" }));
  };

  const handleResetBlockPassword = (districtId, blockId) => {
    setBlockPasswords((prev) => ({
      ...prev,
      [`${districtId}__${blockId}`]: "password123",
    }));
  };

  const handleEditBlockPhone = (blockId, currentPhone) => {
    setEditingBlockId(blockId);
    setEditedPhoneNumber(currentPhone);
  };

  const handleSaveBlockPhone = (blockId) => {
    setDistricts((prevDistricts) =>
      prevDistricts.map((district) =>
        district.id === selectedDistrict.id
          ? {
              ...district,
              blocks: district.blocks.map((block) =>
                block.id === blockId
                  ? { ...block, phone: editedPhoneNumber }
                  : block,
              ),
            }
          : district,
      ),
    );
    setEditingBlockId(null);
    setEditedPhoneNumber("");
  };

  return (
    <AdminLayout
      title="Create Profile"
      description="Select a district, block, and school to create a profile."
      adminLevel="STATE ADMIN"
    >
      <div className="space-y-8 py-8">
        {!selectedDistrict && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Select a District
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {districts.map((district) => (
                <Card
                  key={district.id}
                  className="shadow-md border-2 border-blue-300 cursor-pointer hover:bg-blue-50"
                  onClick={() => handleDistrictClick(district)}
                >
                  <CardHeader>
                    <CardTitle>{district.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <span>ID: {district.id}</span>
                        <span>Phone: 9876543210</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span>Password:</span>
                        <input
                          type="password"
                          value={districtPasswords[district.id]}
                          readOnly
                          className="p-1 border rounded w-32"
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetDistrictPassword(district.id);
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {selectedDistrict && !selectedBlock && (
          <>
            <Button onClick={handleBackToDistricts} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Districts
            </Button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Blocks in {selectedDistrict.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDistrict.blocks.map((block) => (
                <Card
                  key={block.id}
                  className="shadow-md border-2 border-green-300 cursor-pointer hover:bg-green-50"
                  onClick={() => handleBlockClick(block)}
                >
                  <CardHeader>
                    <CardTitle>{block.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <span>ID: {block.id}</span>
                        <span>Phone: 9876543210</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span>Password:</span>
                        <input
                          type="password"
                          value={
                            blockPasswords[
                              `${selectedDistrict.id}__${block.id}`
                            ]
                          }
                          readOnly
                          className="p-1 border rounded w-32"
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetBlockPassword(
                              selectedDistrict.id,
                              block.id,
                            );
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {selectedBlock && (
          <>
            <Button onClick={handleBackToBlocks} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back to Blocks
            </Button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Schools in {selectedBlock.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSchools
                .filter(
                  (school) =>
                    school.district === selectedDistrict.name &&
                    school.block === selectedBlock.name,
                )
                .map((school) => (
                  <Card
                    key={school.udise}
                    className="shadow-md border-2 border-pink-300"
                  >
                    <CardHeader>
                      <CardTitle>{school.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>UDISE: {school.udise}</p>
                      <Button
                        className="mt-2"
                        onClick={() => navigate("/admin/school/profile")}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
