import React from 'react';
import { Filter, Calendar, RotateCcw } from 'lucide-react';

export function OrderFilters({
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  hasActiveFilters,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date Filter */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
        <Calendar className="w-4 h-4 text-slate-500" />
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">Date:</span>
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="bg-transparent text-xs text-slate-900 font-medium focus:outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-white text-slate-900">All Dates</option>
          <option value="TODAY" className="bg-white text-slate-900">Today</option>
          <option value="YESTERDAY" className="bg-white text-slate-900">Yesterday</option>
        </select>
      </div>

      {/* Status Selector Dropdown */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="bg-transparent text-xs text-slate-900 font-medium focus:outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-white text-slate-900">All Statuses</option>
          <option value="New" className="bg-white text-slate-900">New</option>
          <option value="Accepted" className="bg-white text-slate-900">Accepted</option>
          <option value="Preparing" className="bg-white text-slate-900">Preparing</option>
          <option value="Ready" className="bg-white text-slate-900">Ready</option>
          <option value="Completed" className="bg-white text-slate-900">Completed</option>
          <option value="Rejected" className="bg-white text-slate-900">Rejected</option>
        </select>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 px-2 py-1.5 transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
