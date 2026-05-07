import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
