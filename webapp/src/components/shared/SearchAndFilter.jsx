import { Search } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  primaryAction,
  secondaryActions = [],
  className = ""
}) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex gap-3">
          {/* Filters */}
          {filters.map((filter, index) => (
            <select
              key={index}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size={action.size || "sm"}
              icon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}

          {/* Primary Action */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || "primary"}
              size={primaryAction.size || "sm"}
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
