import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { civilianLogin } from "../../services/civilianAuth.api";

const CivilianLogin = () => {
  const navigate = useNavigate();
  const { getDefaultRoute, loginCivilian } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[auth:civilian] submitting login", {
        email: form.email,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "(fallback)",
      });
      const response = await civilianLogin(form);
      const session = loginCivilian({
        token: response.data.token,
        user: response.data.civilian,
      });
      console.log("[auth:civilian] session stored", {
        email: session.user.email,
        redirectTo: getDefaultRoute(session.user),
      });
      navigate(getDefaultRoute(session.user), { replace: true });
    } catch (err) {
      console.error("[auth:civilian] login failed", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
      });
      setError(err.response?.data?.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#17120f] px-4 py-8 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-[#241b17] p-6 shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Public Safety Portal</p>
        <h1 className="mt-2 text-3xl font-semibold">Citizen Services Login</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Access complaint tracking, SOS history, and public safety intelligence from a citizen-first portal.
        </p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <Input label="Email" name="email" onChange={updateForm} type="email" value={form.email} />
          <div className="relative">
            <Input label="Password" name="password" onChange={updateForm} type={showPassword ? "text" : "password"} value={form.password} />
            <button className="absolute bottom-2 right-2 rounded px-2 py-1 text-xs text-amber-300" onClick={() => setShowPassword((value) => !value)} type="button">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input className="h-4 w-4 accent-amber-300" type="checkbox" /> Remember me
          </label>
          {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <Button className="w-full py-3" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </Button>
          <div className="flex justify-between text-sm">
            <Link className="text-amber-300 hover:text-white" to="/civilian/signup">Create civilian account</Link>
            <Link className="text-zinc-400 hover:text-white" to="/police/login">Police secure access</Link>
          </div>
          <Link className="block text-center text-sm text-zinc-500 hover:text-white" to="/">Choose another portal</Link>
        </form>
      </section>
    </main>
  );
};

export default CivilianLogin;
