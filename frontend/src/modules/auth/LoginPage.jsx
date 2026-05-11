import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api from "../../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const { getDefaultRoute, loginPolice } = useAuth();
  const [form, setForm] = useState({
    email: "admin@police.com",
    password: "Password@123",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", form);
      const session = loginPolice({
        token: response.data.token,
        user: {
          ...response.data.user,
          isFirstLogin: response.data.requiresPasswordReset || response.data.user?.isFirstLogin,
        },
      });
      navigate(getDefaultRoute(session.user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-police-bg px-4 py-8 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-police-panel p-6 shadow-2xl shadow-black/40">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase text-police-accent">
            Police Management System
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Admin Login</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access operational dashboard controls.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-zinc-300">Email</span>
            <input
              className="mt-2 w-full rounded-md border border-white/10 bg-police-bg px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-police-accent"
              name="email"
              onChange={handleChange}
              placeholder="admin@police.com"
              type="email"
              value={form.email}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-300">Password</span>
            <input
              className="mt-2 w-full rounded-md border border-white/10 bg-police-bg px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-police-accent"
              name="password"
              onChange={handleChange}
              placeholder="Password@123"
              type="password"
              value={form.password}
            />
          </label>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            className="w-full rounded-md bg-police-primary px-4 py-3 font-semibold text-white transition hover:bg-police-accent hover:text-police-bg disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
