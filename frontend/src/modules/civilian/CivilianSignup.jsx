import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input, { Textarea } from "../../components/ui/Input";
import { civilianRegister } from "../../services/civilianAuth.api";

const CivilianSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", address: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await civilianRegister(form);
      navigate("/civilian/login");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#17120f] px-4 py-8 text-white">
      <section className="w-full max-w-2xl rounded-lg border border-white/10 bg-[#241b17] p-6 shadow-2xl shadow-black/40">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Public Safety Portal</p>
        <h1 className="mt-2 text-3xl font-semibold">Create Civilian Account</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Create a citizen account for complaint services, SOS assistance, and public safety awareness tools.</p>
        <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Input label="Full Name" name="name" onChange={updateForm} value={form.name} />
          <Input label="Phone" name="phone" onChange={updateForm} value={form.phone} />
          <Input label="Email" name="email" onChange={updateForm} type="email" value={form.email} />
          <div className="relative">
            <Input label="Password" name="password" onChange={updateForm} type={showPassword ? "text" : "password"} value={form.password} />
            <button className="absolute bottom-2 right-2 rounded px-2 py-1 text-xs text-amber-300" onClick={() => setShowPassword((value) => !value)} type="button">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <Textarea className="md:col-span-2" label="Address" name="address" onChange={updateForm} value={form.address} />
          {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:col-span-2">{error}</div>}
          <div className="flex items-center justify-between md:col-span-2">
            <Link className="text-sm text-amber-300 hover:text-white" to="/civilian/login">Already have an account?</Link>
            <Button disabled={loading} type="submit">{loading ? "Creating..." : "Sign Up"}</Button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CivilianSignup;
