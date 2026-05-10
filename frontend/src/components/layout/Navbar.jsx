import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-police-bg/95 px-5 py-4 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-police-accent">Command Center</p>
          <h2 className="text-xl font-semibold text-white">Police Management</h2>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.name || "Admin"}</p>
            <p className="text-xs text-zinc-400">{user?.type === "CIVILIAN" ? "CIVILIAN" : user?.role || "ADMIN"}</p>
          </div>
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
