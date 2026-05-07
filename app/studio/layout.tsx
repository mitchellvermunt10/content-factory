import { Sidebar } from "@/components/studio/Sidebar";
import { MobileTopBar } from "@/components/studio/MobileTopBar";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
