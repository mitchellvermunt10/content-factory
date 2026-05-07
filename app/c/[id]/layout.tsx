/**
 * Klantweergave layout — geen studio-sidebar, geen marketing-nav.
 * Alleen de campagne staat centraal. Print-vriendelijk.
 */
export default function ClientCampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-bg">{children}</div>;
}
