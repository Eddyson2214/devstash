import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <div className="flex flex-1">
        <aside className="w-64 shrink-0 border-r border-border p-4">
          <h2>Sidebar</h2>
        </aside>
        <main className="flex-1 p-6">
          <h2>Main</h2>
        </main>
      </div>
    </div>
  );
}
