import AdminLayout from "@/components/AdminLayout";

export default function Reports() {
  return (
    <AdminLayout
      title="Reports"
      description="View and generate various reports."
    >
      <div className="p-6 border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Reports Dashboard</h3>
        <p>This page will contain various reporting functionalities.</p>
      </div>
    </AdminLayout>
  );
}
