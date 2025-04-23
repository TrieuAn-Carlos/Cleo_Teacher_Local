import "./styles.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout này chỉ áp dụng styles riêng và render nội dung của dashboard
  // Nó không bao gồm TopBar từ layout gốc
  return (
    <div className="dashboard-container" style={{ margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}
