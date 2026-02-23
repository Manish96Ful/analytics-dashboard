import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { analyticsAPI } from '../api/client';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-lg">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

export default function LineChartComponent({ data, selectedFeature }) {
  const handleMouseEnter = () => {
    analyticsAPI.track('line_chart_hover').catch(() => {});
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-white">Clicks Daily</h2>
        {selectedFeature && (
          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-3 py-1 font-mono">
            {selectedFeature}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        {selectedFeature
          ? `Time trend for "${selectedFeature}"`
          : 'Click a bar in the chart above to filter by feature'}
      </p>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p>No data for selected period</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300} onMouseEnter={handleMouseEnter}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 6, fill: '#60a5fa' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
