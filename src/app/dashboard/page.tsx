import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardPage() {
  return (
    <SidebarProvider className="min-h-screen">
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-6">
          <h2>Main</h2>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
