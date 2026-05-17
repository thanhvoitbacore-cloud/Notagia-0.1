import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { StoreProvider } from "@/lib/store";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="flex min-h-[100dvh] bg-black text-white">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </StoreProvider>
  );
}
