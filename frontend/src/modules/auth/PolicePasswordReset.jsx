import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../auth/useAuth";
import { resetTemporaryPassword } from "../../services/auth.api";

const PolicePasswordReset = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await resetTemporaryPassword(form);
      updateUser(response.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0908] px-4 py-8 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-[#1d1512] p-6 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-police-primary text-police-accent">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-police-accent">First Login Required</p>
            <h1 className="text-2xl font-semibold">Reset Temporary Password</h1>
          </div>
        </div>

        <p className="mt-5 rounded-md border border-white/10 bg-police-bg p-3 text-sm leading-5 text-zinc-300">
          Your administrator-issued password must be changed before entering the police command system.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input label="Temporary Password" name="currentPassword" onChange={updateForm} type={showPassword ? "text" : "password"} value={form.currentPassword} />
          <div className="relative">
            <Input label="New Password" name="newPassword" onChange={updateForm} type={showPassword ? "text" : "password"} value={form.newPassword} />
            <button className="absolute bottom-2 right-2 rounded px-2 py-1 text-police-accent" onClick={() => setShowPassword((value) => !value)} type="button">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          <Button className="w-full py-3" disabled={loading} type="submit">
            {loading ? "Updating..." : "Activate Police Account"}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default PolicePasswordReset;
