import { Noticeboard } from "../ui";

const NoticeboardSection = ({
  notices,
  title = "Notifications",
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Noticeboard notices={notices} title={title} onViewAll={onViewAll} />
    </div>
  );
};

export default NoticeboardSection;
