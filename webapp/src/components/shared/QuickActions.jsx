import { QuickActionCard } from "../ui";

const QuickActions = ({
  actions,
  title = "Quick Actions",
  columns = "grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className={`grid ${columns} gap-4`}>
        {actions.map((action, index) => (
          <QuickActionCard
            key={index}
            name={action.name}
            icon={action.icon}
            color={action.color}
            onClick={action.onClick}
            description={action.description}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
