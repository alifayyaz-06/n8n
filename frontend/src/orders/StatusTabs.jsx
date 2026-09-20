import React from 'react';

export function StatusTabs({ activeTab, onTabChange, statusCounts = {} }) {
  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'New', label: 'New' },
    { id: 'Accepted', label: 'Accepted' },
    { id: 'Preparing', label: 'Preparing' },
    { id: 'Ready', label: 'Ready' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Rejected', label: 'Rejected' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = statusCounts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
