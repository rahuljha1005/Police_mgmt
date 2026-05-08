import Table from "../../../components/ui/Table";
import { formatDate } from "../../../utils/formatDate";

const RecentActivity = ({ logs = [] }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-5">
    <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
    <div className="mt-4">
      <Table
        columns={[
          { key: "action", header: "Action", render: (row) => <span className="font-semibold text-police-accent">{row.action}</span> },
          { key: "user", header: "User", render: (row) => row.user_id?.name || "System" },
          { key: "entity_type", header: "Entity" },
          { key: "createdAt", header: "Date", render: (row) => formatDate(row.createdAt) },
        ]}
        data={logs}
      />
    </div>
  </article>
);

export default RecentActivity;
