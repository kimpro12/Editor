import { Sidebar } from "@/components/nav/Sidebar";
import { Topbar } from "@/components/nav/Topbar";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen grid grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="min-w-0">
          <Topbar />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </QueryProvider>
  );
}
