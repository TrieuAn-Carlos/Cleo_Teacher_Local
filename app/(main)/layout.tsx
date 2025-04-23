import TopBar from "../../components/TopBar"; // Corrected path

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <main style={{ flexGrow: 1, width: "100%" }}>{children}</main>
    </>
  );
}
