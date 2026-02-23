export default function FiltersPanel({ filters, onFilterChange, onApply }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Filters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="input"
            value={filters.start_date}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
          />
        </div>

        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            className="input"
            value={filters.end_date}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Age Group</label>
          <select
            className="select w-full"
            value={filters.age}
            onChange={(e) => onFilterChange('age', e.target.value)}
          >
            <option value="all">All Ages</option>
            <option value="<18">Under 18</option>
            <option value="18-40">18 – 40</option>
            <option value=">40">Over 40</option>
          </select>
        </div>

        <div>
          <label className="label">Gender</label>
          <select
            className="select w-full"
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
        <button className="btn-primary" onClick={onApply}>
          Apply Filters
        </button>
        <span className="text-xs text-gray-500 self-center ml-auto">
          🍪 Filters saved in cookies
        </span>
      </div>
    </div>
  );
}
