import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => (
  <div className="min-h-screen bg-police-bg text-zinc-100">
    <Sidebar />
    <div className="md:pl-64">
      <Navbar />
      <main className="px-5 py-6 md:px-8">{children}</main>
    </div>
  </div>
);

export default Layout;
