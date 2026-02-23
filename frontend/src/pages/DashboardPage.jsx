import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import FiltersPanel from '../components/FiltersPanel';
import BarChartComponent from '../components/BarChartComponent';
import LineChartComponent from '../components/LineChartComponent';
import StatsCards from '../components/StatsCards';
import { analyticsAPI } from '../api/client';
import { useFilters } from '../hooks/useFilters';

export default function DashboardPage() {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [analyticsData, setAnalyticsData] = useState({ barChart: [], lineChart: [], summary: null });
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filtersRef = useRef(filters);
  const featureRef = useRef(selectedFeature);
  filtersRef.current = filters;
  featureRef.current = selectedFeature;

  const fetchAnalytics = useCallback(async (currentFilters, feature) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...currentFilters,
        end_date: new Date().toISOString().split('T')[0],
      };
      if (feature) params.feature = feature;
      const res = await analyticsAPI.getAnalytics(params);
      setAnalyticsData(res.data);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAnalytics(filters, null);
  }, []);

  // Track AND refetch — used for actions that should update chart immediately
  const trackAndRefetch = useCallback(async (featureName) => {
    try {
      await analyticsAPI.track(featureName);
    } catch (err) {
      console.error('Track failed:', err);
    }
    await fetchAnalytics(filtersRef.current, featureRef.current);
  }, [fetchAnalytics]);

  // Track only — used for filter changes (saved to DB but chart updates on Apply)
  const trackOnly = useCallback((featureName) => {
    analyticsAPI.track(featureName).catch((err) => {
      console.error('Track failed:', err);
    });
  }, []);

  // Filter change — track immediately, refetch on Apply
  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
    const featureMap = {
      start_date: 'date_filter',
      end_date:   'date_filter',
      age:        'age_filter',
      gender:     'gender_filter',
    };
    const featureName = featureMap[key];
    if (featureName) trackOnly(featureName);
  };

  // Apply filters — track + refetch
  const handleApplyFilters = () => {
    trackAndRefetch('date_filter');
  };

  // Bar click — track + update line chart + refetch
  const handleFeatureSelect = (feature) => {
    const newFeature = selectedFeature === feature ? null : feature;
    setSelectedFeature(newFeature);
    featureRef.current = newFeature;
    trackAndRefetch('bar_chart_zoom');
  };

  const handleReset = () => {
    const defaultFilters = {
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      age: 'all',
      gender: 'all',
    };
    setSelectedFeature(null);
    featureRef.current = null;
    resetFilters();
    setTimeout(() => fetchAnalytics(defaultFilters, null), 0);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Product Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">This dashboard tracks its own usage in real-time</p>
          </div>
          <button onClick={handleReset} className="btn-secondary text-sm">
            Reset All
          </button>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <FiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onApply={handleApplyFilters}
        />

        <StatsCards summary={analyticsData.summary} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
            <>
              <div className="card h-80 animate-pulse bg-gray-800" />
              <div className="card h-80 animate-pulse bg-gray-800" />
            </>
          ) : (
            <>
              <BarChartComponent
                data={analyticsData.barChart}
                selectedFeature={selectedFeature}
                onFeatureSelect={handleFeatureSelect}
              />
              <LineChartComponent
                data={analyticsData.lineChart}
                selectedFeature={selectedFeature}
              />
            </>
          )}
        </div>

        <div className="card bg-blue-900/20 border-blue-800">
          <div className="flex items-start gap-3">
            <div className="text-blue-400 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-300 font-medium text-sm">Self-Referential Dashboard</p>
              <p className="text-blue-400/70 text-xs mt-1">
                Every filter change and chart click is tracked and saved to the database.
                Click "Apply Filters" or a bar to see the counts update!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
