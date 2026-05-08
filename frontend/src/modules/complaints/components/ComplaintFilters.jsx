import { Select } from "../../../components/ui/Input";
import { COMPLAINT_STATUSES, PRIORITIES } from "../../../utils/constants";

const ComplaintFilters = ({ filters, onChange, reference }) => (
  <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-4">
    <Select name="status" onChange={onChange} value={filters.status}><option value="">All statuses</option>{COMPLAINT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
    <Select name="priority" onChange={onChange} value={filters.priority}><option value="">All priorities</option>{PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
    <Select name="police_station_id" onChange={onChange} value={filters.police_station_id}><option value="">All stations</option>{reference.policeStations.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
    <Select name="assigned_officer_id" onChange={onChange} value={filters.assigned_officer_id}><option value="">All officers</option>{reference.officers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
  </div>
);

export default ComplaintFilters;
