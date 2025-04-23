export default function HomepageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="w-full bg-black text-white overflow-hidden homepage-body"
      style={{
        height: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
