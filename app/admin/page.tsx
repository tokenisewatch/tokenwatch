import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminGuard } from "@/components/AdminGuard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
