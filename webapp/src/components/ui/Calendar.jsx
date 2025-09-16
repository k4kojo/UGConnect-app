import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import React, { useState } from 'react';

const Calendar = ({ 
  currentMonth, 
  onMonthChange, 
  events = [], 
  onDayClick,
  className = '' 
}) => {
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatWeek = (date) => {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = getEndOfWeek(date);
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    return new Date(d.setDate(diff));
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = getStartOfWeek(selectedDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const getDayEvents = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const eventDateString = eventDate.toISOString().split('T')[0];
      return eventDateString === dateString;
    });
  };

  const hasEvent = (day) => {
    if (viewMode === 'month') {
      return events.some(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonth.getMonth() && 
               eventDate.getFullYear() === currentMonth.getFullYear();
      });
    } else {
      const date = new Date(selectedDate);
      date.setDate(day);
      return getDayEvents(date).length > 0;
    }
  };

  const getEventForDay = (day) => {
    if (viewMode === 'month') {
      return events.find(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonth.getMonth() && 
               eventDate.getFullYear() === currentMonth.getFullYear();
      });
    } else {
      const date = new Date(selectedDate);
      date.setDate(day);
      const dayEvents = getDayEvents(date);
      return dayEvents.length > 0 ? dayEvents[0] : null;
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'week') {
      setSelectedDate(currentMonth);
    } else if (mode === 'day') {
      setSelectedDate(currentMonth);
    }
  };

  const handleNavigation = (direction) => {
    let newDate;
    
    if (viewMode === 'month') {
      newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction);
      onMonthChange(newDate);
    } else if (viewMode === 'week') {
      newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + (direction * 7));
      setSelectedDate(newDate);
    } else if (viewMode === 'day') {
      newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + direction);
      setSelectedDate(newDate);
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1 text-xs">
      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
        <div key={day} className="p-2 text-center font-medium text-gray-600">
          {day}
        </div>
      ))}
      
      {getCalendarDays().map((day, index) => (
        <div
          key={index}
          className={`p-2 text-center text-sm border border-gray-100 min-h-[40px] flex flex-col justify-center ${
            day ? 'hover:bg-gray-50 cursor-pointer' : ''
          } ${hasEvent(day) ? 'bg-blue-50 border-blue-200' : ''}`}
          onClick={() => day && onDayClick && onDayClick(day)}
        >
          {day && (
            <>
              <span className="font-medium">{day}</span>
              {hasEvent(day) && (
                <div className="text-xs text-blue-600 mt-1 truncate">
                  {getEventForDay(day)?.event}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="grid grid-cols-8 gap-1 text-xs">
        {/* Time column */}
        <div className="p-2 text-center font-medium text-gray-600">
          Time
        </div>
        
        {/* Day headers */}
        {weekDays.map((date) => (
          <div key={date.toISOString()} className="p-2 text-center font-medium text-gray-600">
            <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="text-lg font-bold">{date.getDate()}</div>
          </div>
        ))}
        
        {/* Time slots */}
        {Array.from({ length: 24 }, (_, hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 text-center text-gray-500 border-t border-gray-100">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            {weekDays.map((date) => {
              const dayEvents = getDayEvents(date);
              const hourEvents = dayEvents.filter(event => {
                const eventHour = new Date(event.date).getHours();
                return eventHour === hour;
              });
              
              return (
                <div key={`${date.toISOString()}-${hour}`} className="p-1 border-t border-gray-100 min-h-[60px]">
                  {hourEvents.map((event, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs p-1 rounded mb-1 truncate"
                      title={event.event}
                    >
                      {event.event}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getDayEvents(selectedDate);
    
    return (
      <div className="space-y-4">
        {/* Time slots for the day */}
        {Array.from({ length: 24 }, (_, hour) => {
          const hourEvents = dayEvents.filter(event => {
            const eventHour = new Date(event.date).getHours();
            return eventHour === hour;
          });
          
          return (
            <div key={hour} className="flex border-b border-gray-100 pb-2">
              <div className="w-20 text-sm text-gray-500 font-medium">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1 pl-4">
                {hourEvents.length > 0 ? (
                  hourEvents.map((event, index) => (
                    <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-blue-900">{event.event}</div>
                        <div className="text-sm text-blue-600">
                          {new Date(event.date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      {event.description && (
                        <div className="text-sm text-blue-700 mt-1">{event.description}</div>
                      )}
                      {event.participants && (
                        <div className="flex items-center mt-2 text-xs text-blue-600">
                          <User className="w-3 h-3 mr-1" />
                          {event.participants}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">No events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return formatMonth(currentMonth);
      case 'week':
        return formatWeek(selectedDate);
      case 'day':
        return formatDay(selectedDate);
      default:
        return formatMonth(currentMonth);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-900">Calendar Schedule</h3>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => handleViewModeChange('month')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'month' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => handleViewModeChange('week')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => handleViewModeChange('day')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'day' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => handleNavigation(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-lg font-medium">{getViewTitle()}</span>
        <button 
          onClick={() => handleNavigation(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default Calendar;
