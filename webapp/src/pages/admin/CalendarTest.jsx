import React, { useState } from 'react';
import { Calendar as CalendarComponent } from '../../components/ui';

const CalendarTest = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sample events for testing
  const sampleEvents = [
    {
      date: new Date(2024, 0, 15, 9, 0), // January 15, 2024 at 9:00 AM
      event: 'Patient Consultation',
      description: 'Regular checkup with John Doe',
      participants: 'Dr. Smith, John Doe'
    },
    {
      date: new Date(2024, 0, 15, 14, 30), // January 15, 2024 at 2:30 PM
      event: 'Lab Results Review',
      description: 'Review blood test results',
      participants: 'Dr. Smith, Lab Tech'
    },
    {
      date: new Date(2024, 0, 16, 10, 0), // January 16, 2024 at 10:00 AM
      event: 'Emergency Appointment',
      description: 'Urgent care consultation',
      participants: 'Dr. Smith, Emergency Patient'
    },
    {
      date: new Date(2024, 0, 18, 11, 0), // January 18, 2024 at 11:00 AM
      event: 'Follow-up Visit',
      description: 'Post-surgery follow-up',
      participants: 'Dr. Smith, Sarah Johnson'
    },
    {
      date: new Date(2024, 0, 20, 16, 0), // January 20, 2024 at 4:00 PM
      event: 'Staff Meeting',
      description: 'Weekly team meeting',
      participants: 'All Staff'
    }
  ];

  const handleDayClick = (day) => {
    console.log('Day clicked:', day);
    // You can add modal or navigation logic here
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Calendar Test Page</h1>
        <p className="text-gray-600">
          This page demonstrates the enhanced calendar functionality with week and day views.
          Try switching between Month, Week, and Day views using the buttons above the calendar.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CalendarComponent
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          events={sampleEvents}
          onDayClick={handleDayClick}
        />
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Events</h2>
        <div className="space-y-2">
          {sampleEvents.map((event, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 min-w-[120px]">
                {event.date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{event.event}</div>
                <div className="text-sm text-gray-600">{event.description}</div>
              </div>
              <div className="text-sm text-gray-500">
                {event.participants}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarTest;

