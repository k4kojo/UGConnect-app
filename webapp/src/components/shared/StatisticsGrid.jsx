import { StatCard } from "../ui";

const StatisticsGrid = ({
  stats,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}) => {
  return (
    <div className={`grid ${columns} gap-6`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
};

export default StatisticsGrid;
