import { Calendar } from "lucide-react";
import { Button } from "../../ui/button.jsx";
import { AppointmentCard } from "../ui";

const AppointmentsList = ({
  appointments,
  title = "Today's Appointments",
  emptyTitle = "No appointments scheduled",
  emptyDescription = "You have a clear schedule today.",
  emptyIcon: EmptyIcon = Calendar,
  onViewAll,
  onViewDetails,
  onStartSession,
  onReschedule,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onViewDetails={onViewDetails}
              onStartSession={onStartSession}
              onReschedule={onReschedule}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <EmptyIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {emptyTitle}
            </h4>
            <p className="text-sm text-gray-600 mb-4">{emptyDescription}</p>
            {onViewAll && (
              <Button
                variant="outline"
                onClick={onViewAll}
                className="inline-flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;
