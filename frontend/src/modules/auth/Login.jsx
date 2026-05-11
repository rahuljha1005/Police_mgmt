import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../auth/useAuth";
import { login } from "../../services/auth.api";

const Login = () => {
  const navigate = useNavigate();
  const { getDefaultRoute, loginPolice } = useAuth();
  const [form, setForm] = useState({ badgeNumber: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(form);
      const session = loginPolice({
        token: response.data.token,
        user: {
          ...response.data.user,
          isFirstLogin: response.data.requiresPasswordReset || response.data.user?.isFirstLogin,
        },
      });
      navigate(getDefaultRoute(session.user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0908] px-4 py-8 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-police-accent">Secure police network</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">Police Secure Access Portal</h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400">
            Restricted operational entry for authorized personnel. FIR operations, intelligence dashboards, emergency response workflows, and audit activity are protected under monitored access.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 md:grid-cols-3">
            {["Session monitored", "JWT secured", "Role restricted"].map((item) => (
              <div className="rounded-lg border border-white/10 bg-police-panel p-4 text-sm text-zinc-300" key={item}>{item}</div>
            ))}
          </div>
        </div>

        <section className="rounded-lg border border-white/10 bg-[#1d1512] p-6 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-police-primary text-police-accent">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-police-accent">Authorized Personnel Only</p>
              <h2 className="text-2xl font-semibold">Operational Login</h2>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100">
            All access attempts are monitored and logged. Police accounts are issued internally by system administrators.
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Input label="Badge ID" name="badgeNumber" onChange={updateForm} placeholder="Optional" value={form.badgeNumber} />
            <Input label="Official Email" name="email" onChange={updateForm} type="email" value={form.email} />
            <div className="relative">
              <Input label="Password" name="password" onChange={updateForm} type={showPassword ? "text" : "password"} value={form.password} />
              <button className="absolute bottom-2 right-2 rounded px-2 py-1 text-police-accent" onClick={() => setShowPassword((value) => !value)} type="button">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input className="h-4 w-4 accent-police-accent" type="checkbox" /> Remember this secure workstation
            </label>
            {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            <Button className="w-full py-3" disabled={loading} type="submit">
              {loading ? "Verifying..." : "Enter Secure Network"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link className="text-zinc-400 hover:text-white" to="/">Choose portal</Link>
            <Link className="inline-flex items-center gap-1 text-police-accent hover:text-white" to="/civilian/login">
              <LockKeyhole className="h-4 w-4" /> Civilian portal
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Login;
