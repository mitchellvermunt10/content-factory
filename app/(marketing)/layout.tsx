import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { SmoothScrollProvider } from "@/components/sites/SmoothScrollProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <Nav />
      <main className="relative">{children}</main>
      <Footer />
    </SmoothScrollProvider>
  );
}
