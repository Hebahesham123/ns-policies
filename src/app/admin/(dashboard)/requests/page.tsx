import { RequestsList } from "@/features/admin/requests-list";
import { adminListRequests } from "@/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const requests = await adminListRequests();
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">طلبات المواضيع</h1>
        <p className="text-sm text-muted-foreground">{pending} معلّق · {requests.length} إجمالاً. اقبل أو ارفض أو حوّل إلى مقال مسودة.</p>
      </div>
      <RequestsList requests={requests} />
    </div>
  );
}
