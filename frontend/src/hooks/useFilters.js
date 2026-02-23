import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const COOKIE_KEY = 'dashboard_filters';
const COOKIE_EXPIRES = 30;

function getDefaultFilters() {
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
  return {
    start_date: monthAgo,
    end_date: today,   // always today
    age: 'all',
    gender: 'all',
  };
}

export function useFilters() {
  const [filters, setFilters] = useState(() => {
    try {
      const saved = Cookies.get(COOKIE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Always override end_date to today so new clicks are never excluded
        return {
          ...getDefaultFilters(),
          ...parsed,
          end_date: new Date().toISOString().split('T')[0],
        };
      }
    } catch {}
    return getDefaultFilters();
  });

  useEffect(() => {
    Cookies.set(COOKIE_KEY, JSON.stringify(filters), { expires: COOKIE_EXPIRES });
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(getDefaultFilters());
  };

  return { filters, updateFilter, resetFilters };
}
