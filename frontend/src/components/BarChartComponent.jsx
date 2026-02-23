import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-blue-400 font-mono text-sm">{label}</p>
        <p className="text-white font-bold text-lg">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

export default function BarChartComponent({ data, selectedFeature, onFeatureSelect }) {
  const handleBarClick = (entry) => {
    if (!entry) return;
    const feature = entry.activePayload?.[0]?.payload?.feature_name;
    if (feature) {
      onFeatureSelect(feature);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-white">Total Clicks by Feature</h2>
        <span className="text-xs text-gray-500 bg-gray-800 rounded px-2 py-1">Click a bar to drill down</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Feature usage across selected filters</p>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
            </svg>
            <p>No data yet — interact with the dashboard to see stats!</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="feature_name"
              stroke="#6b7280"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
            <Bar dataKey="total_clicks" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.feature_name === selectedFeature ? '#f59e0b' : COLORS[index % COLORS.length]}
                  opacity={selectedFeature && entry.feature_name !== selectedFeature ? 0.5 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
