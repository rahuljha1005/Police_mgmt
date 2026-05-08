import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { formatShortDate } from "../../../utils/formatDate";

const ComplaintTable = ({ complaints, onAssign, onConvert, onStatus }) => (
  <Table
    columns={[
      { key: "title", header: "Complaint", render: (row) => <div><Link className="font-medium text-white hover:text-police-accent" to={`/complaints/${row._id}`}>{row.title}</Link><p className="text-xs text-zinc-500">{row.civilian_id?.name}</p></div> },
      { key: "station", header: "Station", render: (row) => row.police_station_id?.name || "N/A" },
      { key: "officer", header: "Officer", render: (row) => row.assigned_officer_id?.name || "N/A" },
      { key: "priority", header: "Priority", render: (row) => <Badge value={row.priority} /> },
      { key: "status", header: "Status", render: (row) => <Badge value={row.status} /> },
      { key: "createdAt", header: "Created", render: (row) => formatShortDate(row.createdAt) },
      { key: "actions", header: "Actions", render: (row) => <div className="flex flex-wrap gap-2"><Button className="px-3 py-1 text-xs" onClick={() => onAssign(row)} variant="outline">Assign</Button><Button className="px-3 py-1 text-xs" onClick={() => onStatus(row)} variant="outline">Status</Button>{row.status !== "CONVERTED_TO_FIR" && <Button className="px-3 py-1 text-xs" onClick={() => onConvert(row)}>Convert</Button>}</div> },
    ]}
    data={complaints}
  />
);

export default ComplaintTable;
