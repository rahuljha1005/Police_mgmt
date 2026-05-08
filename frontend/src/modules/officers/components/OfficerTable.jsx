import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import VerifyOfficerActions from "./VerifyOfficerActions";

const OfficerTable = ({ officers, onRoleChange, onVerify }) => (
  <Table
    columns={[
      {
        key: "name",
        header: "Officer",
        render: (row) => (
          <div>
            <p className="font-medium text-white">{row.name}</p>
            <p className="text-xs text-zinc-500">{row.email}</p>
          </div>
        ),
      },
      { key: "role", header: "Role" },
      { key: "station", header: "Station", render: (row) => row.police_station_id?.name || "N/A" },
      { key: "status", header: "Status", render: (row) => <Badge value={row.status} /> },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            <VerifyOfficerActions officer={row} onVerify={onVerify} />
            <Button className="px-3 py-1 text-xs" onClick={() => onRoleChange(row)} variant="outline">Role</Button>
          </div>
        ),
      },
    ]}
    data={officers}
  />
);

export default OfficerTable;
