import { NavLink } from "react-router-dom";

const links = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Officers", path: "/officers" },
  { label: "FIRs", path: "/firs" },
  { label: "Complaints", path: "/complaints" },
  { label: "Heatmap", path: "/heatmap" },
  { label: "Analytics", path: "/analytics" },
];

const Sidebar = () => (
  <aside className="border-b border-white/10 bg-police-panel px-4 py-4 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-police-primary text-lg font-bold text-white">
        PM
      </div>
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Police</p>
        <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
      </div>
    </div>

    <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
      {links.map((link) => (
        <NavLink
          className={({ isActive }) =>
            [
              "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition",
              isActive ? "bg-police-primary text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
            ].join(" ")
          }
          key={link.path}
          to={link.path}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
