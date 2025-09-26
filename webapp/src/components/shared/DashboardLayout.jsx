import { TopLoadingBar } from "../ui";

const DashboardLayout = ({
  title,
  children,
  loading,
  loadingColor = "bg-blue-600",
}) => {
  return (
    <>
      <TopLoadingBar loading={loading} colorClass={loadingColor} />
      <div className="space-y-6">
        {title && (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </>
  );
};

export default DashboardLayout;
