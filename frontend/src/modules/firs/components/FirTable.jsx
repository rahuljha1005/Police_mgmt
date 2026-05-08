import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { formatShortDate } from "../../../utils/formatDate";

const FirTable = ({ firs, onAssign }) => (
  <Table
    columns={[
      { key: "title", header: "FIR", render: (row) => <div><Link className="font-medium text-white hover:text-police-accent" to={`/firs/${row._id}`}>{row.title}</Link><p className="text-xs text-zinc-500">{row.fir_number}</p></div> },
      { key: "crime", header: "Crime", render: (row) => row.crime_type_id?.name },
      { key: "station", header: "Station", render: (row) => row.police_station_id?.name },
      { key: "officer", header: "Officer", render: (row) => row.assigned_officer_id?.name },
      { key: "status", header: "Status", render: (row) => <Badge value={row.status} /> },
      { key: "createdAt", header: "Created", render: (row) => formatShortDate(row.createdAt) },
      { key: "actions", header: "Actions", render: (row) => <Button className="px-3 py-1 text-xs" onClick={() => onAssign(row)} variant="outline">Assign</Button> },
    ]}
    data={firs}
  />
);

export default FirTable;
