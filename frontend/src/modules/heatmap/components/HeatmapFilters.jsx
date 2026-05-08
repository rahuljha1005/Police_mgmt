import Input, { Select } from "../../../components/ui/Input";
import { FIR_STATUSES } from "../../../utils/constants";

const HeatmapFilters = ({ filters, onChange, reference, zones }) => (
  <aside className="rounded-lg border border-white/10 bg-police-panel p-4">
    <h2 className="text-lg font-semibold text-white">Filters</h2>
    <div className="mt-4 space-y-3">
      <Input label="From" name="from" onChange={onChange} type="date" value={filters.from} />
      <Input label="To" name="to" onChange={onChange} type="date" value={filters.to} />
      <Select label="Crime Type" name="crime_type_id" onChange={onChange} value={filters.crime_type_id}><option value="">All crime types</option>{reference.crimeTypes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
      <Select label="Zone" name="zone_id" onChange={onChange} value={filters.zone_id}><option value="">All zones</option>{zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</Select>
      <Select label="FIR Status" name="status" onChange={onChange} value={filters.status}><option value="">All statuses</option>{FIR_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
    </div>
  </aside>
);

export default HeatmapFilters;
