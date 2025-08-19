import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronLeft, Edit2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { districtsAPI, blocksAPI, schoolsAPI } from "@/lib/api";

interface Block {
  id: string;
  name: string;
  phone?: string;
  schoolCount?: number;
}

interface District {
  id: string;
  name: string;
  blocks: Block[];
}

interface School {
  id: string;
  name: string;
  udise: string;
  district: string;
  block: string;
  category?: string;
  management?: string;
  type?: string;
}

export default function EditProfile() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add password state for each district
  const [districtPasswords, setDistrictPasswords] = useState<
    Record<string, string>
  >({});

  // Add password state for each block
  const [blockPasswords, setBlockPasswords] = useState<Record<string, string>>(
    {},
  );

  // Add password state for each school
  const [schoolPasswords, setSchoolPasswords] = useState<
    Record<string, string>
  >({});

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(
    null,
  );
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editedPhoneNumber, setEditedPhoneNumber] = useState("");

  const navigate = useNavigate();

  // Fetch districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        const response = await districtsAPI.getAll();
        if (response.data.success) {
          const districtsData = response.data.data;
          setDistricts(districtsData);

          // Initialize passwords
          const districtPwds: Record<string, string> = {};
          const blockPwds: Record<string, string> = {};

          districtsData.forEach((district: District) => {
            districtPwds[district.id] = "password123";
            district.blocks.forEach((block: Block) => {
              blockPwds[`${district.id}__${block.id}`] = "password123";
            });
          });

          setDistrictPasswords(districtPwds);
          setBlockPasswords(blockPwds);
        } else {
          setError("Failed to fetch districts");
        }
      } catch (err) {
        console.error("Error fetching districts:", err);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  // Fetch schools when a block is selected
  useEffect(() => {
    const fetchSchools = async () => {
      if (!selectedDistrict || !selectedBlock) return;

      try {
        setSchoolsLoading(true);
        const response = await schoolsAPI.getAll({
          district: selectedDistrict.name,
          block: selectedBlock.name,
        });

        if (response.data.success) {
          const schoolsData = response.data.data;
          setSchools(schoolsData);

          // Initialize school passwords
          const schoolPwds: Record<string, string> = {};
          schoolsData.forEach((school: School) => {
            schoolPwds[school.udise] = "password123";
          });
          setSchoolPasswords(schoolPwds);
        } else {
          setError("Failed to fetch schools");
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
        setError("Failed to fetch schools");
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, [selectedDistrict, selectedBlock]);

  const handleDistrictClick = (district: District) => {
    setSelectedDistrict(district);
    setSelectedBlock(null); // Reset selected block when a new district is chosen
    setSchools([]); // Clear schools
    setEditingDistrictId(null); // Exit edit mode for districts
  };

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block);
    setEditingBlockId(null); // Exit edit mode for blocks
  };

  const handleBackToDistricts = () => {
    setSelectedDistrict(null);
    setSelectedBlock(null);
    setSchools([]);
    setEditingDistrictId(null);
    setEditingBlockId(null);
  };

  const handleBackToBlocks = () => {
    setSelectedBlock(null);
    setSchools([]);
    setEditingBlockId(null);
  };
  const handleEditDistrictPhone = (
    districtId: string,
    currentPhone: string,
  ) => {
    setEditingDistrictId(districtId);
    setEditedPhoneNumber(currentPhone);
  };

  const handleSaveDistrictPhone = (districtId: string) => {
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

  const handleResetDistrictPassword = (districtId: string) => {
    setDistrictPasswords((prev) => ({ ...prev, [districtId]: "password123" }));
  };

  const handleResetBlockPassword = async (
    districtId: string,
    blockId: string,
  ) => {
    try {
      const response = await blocksAPI.updatePassword(blockId, "password123");
      if (response.data.success) {
        setBlockPasswords((prev) => ({
          ...prev,
          [`${districtId}__${blockId}`]: "password123",
        }));
      }
    } catch (err) {
      console.error("Error resetting block password:", err);
      setError("Failed to reset block password");
    }
  };

  const handleResetSchoolPassword = (udise: string) => {
    setSchoolPasswords((prev) => ({ ...prev, [udise]: "password123" }));
  };

  const handleEditBlockPhone = (blockId: string, currentPhone: string) => {
    setEditingBlockId(blockId);
    setEditedPhoneNumber(currentPhone);
  };

  const handleSaveBlockPhone = (blockId: string) => {
    if (!selectedDistrict) return;

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

  if (loading) {
    return (
      <AdminLayout
        title="Edit Profile"
        description="Loading districts and blocks..."
        adminLevel="STATE ADMIN"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="Edit Profile"
        description="Error loading data"
        adminLevel="STATE ADMIN"
      >
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Profile"
      description="Select a district, block, and school to edit a profile."
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
                        <span>
                          Phone: {district.blocks[0]?.phone || "9876543210"}
                        </span>
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
                        <span>Phone: {block.phone || "9876543210"}</span>
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
            {schoolsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading schools...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.length > 0 ? (
                  schools.map((school) => (
                    <Card
                      key={school.udise}
                      className="shadow-md border-2 border-pink-300"
                    >
                      <CardHeader>
                        <CardTitle>{school.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <span>UDISE: {school.udise}</span>
                            <span>Phone: 9876543210</span>
                          </div>
                          <p>Category: {school.category}</p>
                          <p>Type: {school.type}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span>Password:</span>
                            <input
                              type="password"
                              value={
                                schoolPasswords[school.udise] || "password123"
                              }
                              readOnly
                              className="p-1 border rounded w-32"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleResetSchoolPassword(school.udise)
                              }
                            >
                              Reset
                            </Button>
                          </div>
                          <Button
                            className="mt-2"
                            onClick={() => navigate("/admin/school/profile")}
                          >
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">
                      No schools found in this block.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
