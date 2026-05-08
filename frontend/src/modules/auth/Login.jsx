import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { login } from "../../services/auth.api";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@police.com", password: "Password@123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(form);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-police-bg px-4 py-8 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-police-panel p-6 shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold uppercase text-police-accent">Police Management System</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin Login</h1>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <Input label="Email" name="email" onChange={updateForm} type="email" value={form.email} />
          <Input label="Password" name="password" onChange={updateForm} type="password" value={form.password} />
          {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <Button className="w-full py-3" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Login;
