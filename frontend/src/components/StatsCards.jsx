export default function StatsCards({ summary, loading }) {
  const stats = [
    {
      label: 'Total Interactions',
      value: summary?.totalClicks ?? '—',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
        </svg>
      ),
      color: 'blue',
    },
    {
      label: 'Active Users',
      value: summary?.uniqueUsers ?? '—',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
        </svg>
      ),
      color: 'purple',
    },
    {
      label: 'Avg. Clicks / User',
      value: summary?.totalClicks && summary?.uniqueUsers
        ? (summary.totalClicks / summary.uniqueUsers).toFixed(1)
        : '—',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'green',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${colorMap[stat.color]}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${loading ? 'animate-pulse text-gray-600' : 'text-white'}`}>
              {loading ? '...' : stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
