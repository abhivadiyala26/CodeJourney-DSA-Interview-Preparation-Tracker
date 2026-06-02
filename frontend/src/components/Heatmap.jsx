import React from 'react';

export default function Heatmap({ heatmapData = {} }) {
  // Get date range for the past 365 days (adjusted to start at the nearest Sunday)
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    // Find the Sunday of the week 52 weeks ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Align to Sunday

    // Fill dates up to today
    const curr = new Date(startDate);
    while (curr <= today) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return { dates, startDate };
  };

  const { dates, startDate } = getDates();

  // Group dates by week (columns of 7 days)
  const weeks = [];
  let currentWeek = [];

  dates.forEach((date) => {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    // Fill remaining days of the last week with nulls or empty dates if needed,
    // but just push it to ensure we don't drop any dates
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Format Date to YYYY-MM-DD string helper
  const formatDateString = (date) => {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Decide colors based on solve count
  const getColorClass = (count) => {
    if (!count || count === 0) {
      return 'bg-slate-100 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/40';
    }
    if (count === 1) {
      return 'bg-brand-200 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-300/20 dark:border-brand-800/20';
    }
    if (count === 2) {
      return 'bg-brand-400 dark:bg-brand-700/60 text-brand-800 dark:text-brand-200 border-brand-500/20 dark:border-brand-600/20';
    }
    return 'bg-brand-600 dark:bg-brand-500 text-white border-brand-700/20 dark:border-brand-400/20';
  };

  // Compile monthly labels for the columns
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIdx) => {
      const firstDayOfWeek = week.find((day) => day !== null);
      if (firstDayOfWeek) {
        const currentMonth = firstDayOfWeek.getMonth();
        if (currentMonth !== lastMonth) {
          labels.push({ text: months[currentMonth], colIdx: weekIdx });
          lastMonth = currentMonth;
        }
      }
    });

    // Prevent overlapping of labels that are too close
    const filteredLabels = [];
    labels.forEach((label, i) => {
      if (i === 0 || label.colIdx - labels[i - 1].colIdx > 2) {
        filteredLabels.push(label);
      }
    });

    return filteredLabels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-xl transition-all duration-200 glass-panel shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Activity Calendar</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Your daily solved problems log over the last 365 days</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40"></div>
          <div className="w-3 h-3 rounded-sm bg-brand-200 dark:bg-brand-900/30 border border-brand-300/20 dark:border-brand-800/20"></div>
          <div className="w-3 h-3 rounded-sm bg-brand-400 dark:bg-brand-700/60 border border-brand-500/20 dark:border-brand-600/20"></div>
          <div className="w-3 h-3 rounded-sm bg-brand-600 dark:bg-brand-500 border border-brand-700/20 dark:border-brand-400/20"></div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="min-w-[700px] select-none">
          {/* Monthly Labels Grid */}
          <div className="h-6 flex text-[10px] text-slate-400 dark:text-slate-500 font-medium pl-8 relative">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="absolute"
                style={{ left: `${32 + label.colIdx * 15}px` }}
              >
                {label.text}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day name labels column */}
            <div className="flex flex-col justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium w-8 pr-2 h-[100px] pt-1">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Grid display */}
            <div className="flex gap-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    if (!day) {
                      return <div key={dayIdx} className="w-3 h-3 bg-transparent rounded-sm border border-transparent"></div>;
                    }
                    const dateStr = formatDateString(day);
                    const count = heatmapData[dateStr] || 0;
                    const tooltipText = `${count} problem${count === 1 ? '' : 's'} solved on ${day.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`;

                    return (
                      <div
                        key={dayIdx}
                        className={`w-3 h-3 rounded-sm border transition-colors cursor-pointer relative group ${getColorClass(count)}`}
                        title={tooltipText}
                      >
                        {/* Hover Tooltip - CSS standard overlay */}
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-[10px] font-semibold text-white px-2 py-1.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-50 transition-all origin-bottom">
                          {tooltipText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
