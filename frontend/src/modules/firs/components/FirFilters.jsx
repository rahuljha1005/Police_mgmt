import { Select } from "../../../components/ui/Input";
import { FIR_STATUSES } from "../../../utils/constants";

const FirFilters = ({ filters, onChange, reference }) => (
  <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-4">
    <Select name="status" onChange={onChange} value={filters.status}><option value="">All statuses</option>{FIR_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
    <Select name="crime_type_id" onChange={onChange} value={filters.crime_type_id}><option value="">All crime types</option>{reference.crimeTypes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
    <Select name="police_station_id" onChange={onChange} value={filters.police_station_id}><option value="">All stations</option>{reference.policeStations.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
    <Select name="assigned_officer_id" onChange={onChange} value={filters.assigned_officer_id}><option value="">All officers</option>{reference.officers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
  </div>
);

export default FirFilters;
