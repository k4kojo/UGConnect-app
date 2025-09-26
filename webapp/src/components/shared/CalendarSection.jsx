import { Calendar as CalendarComponent } from "../ui";

const CalendarSection = ({
  currentMonth,
  onMonthChange,
  events,
  onDayClick,
  title = "Calendar",
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <CalendarComponent
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
        events={events}
        onDayClick={onDayClick}
      />
    </div>
  );
};

export default CalendarSection;
