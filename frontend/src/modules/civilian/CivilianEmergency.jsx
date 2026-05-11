import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { createSos, getMySos } from "../../services/sos.api";

const initialForm = {
  emergencyType: "MEDICAL",
  priority: "HIGH",
  description: "",
  location: { address: "", latitude: "", longitude: "" },
};

const CivilianEmergency = () => {
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const load = () => {
    setLoading(true);
    getMySos({ limit: 20 })
      .then((response) => setItems(response.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load SOS history."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateLocation = (event) =>
    setForm((current) => ({ ...current, location: { ...current.location, [event.target.name]: event.target.value } }));

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          location: {
            ...current.location,
            latitude: String(position.coords.latitude),
            longitude: String(position.coords.longitude),
          },
        }));
      },
      () => setError("Unable to read your current location.")
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      await createSos({
        ...form,
        location: {
          ...form.location,
          latitude: Number(form.location.latitude),
          longitude: Number(form.location.longitude),
        },
      });
      setForm(initialForm);
      setFeedback("SOS sent. Police response status will update below.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send SOS.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5">
        <p className="text-sm font-semibold uppercase text-red-200">Emergency Response</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">SOS Emergency Alert</h1>
        <p className="mt-2 text-sm text-red-100/80">Use only for urgent public safety incidents. Your location is sent to the police response desk.</p>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}
      {feedback && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{feedback}</div>}

      <form className="grid gap-4 rounded-lg border border-white/10 bg-police-panel p-4 md:grid-cols-2" onSubmit={submit}>
        <Select label="Emergency Type" name="emergencyType" onChange={updateForm} value={form.emergencyType}>
          {["MEDICAL", "ROBBERY", "ASSAULT", "ACCIDENT", "WOMEN_SAFETY", "FIRE", "OTHER"].map((type) => <option key={type}>{type}</option>)}
        </Select>
        <Select label="Priority" name="priority" onChange={updateForm} value={form.priority}>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((priority) => <option key={priority}>{priority}</option>)}
        </Select>
        <Textarea className="md:col-span-2" label="What happened?" name="description" onChange={updateForm} value={form.description} />
        <Input className="md:col-span-2" label="Address / Landmark" name="address" onChange={updateLocation} value={form.location.address} />
        <Input label="Latitude" name="latitude" onChange={updateLocation} type="number" value={form.location.latitude} />
        <Input label="Longitude" name="longitude" onChange={updateLocation} type="number" value={form.location.longitude} />
        <div className="flex gap-3 md:col-span-2">
          <Button onClick={useCurrentLocation} type="button" variant="outline">Use Current Location</Button>
          <Button className="bg-red-700 hover:bg-red-600" disabled={submitting} type="submit">
            {submitting ? "Sending..." : "Send SOS"}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-white/10 bg-police-panel">
        <div className="border-b border-white/10 p-4"><h2 className="text-lg font-semibold text-white">Emergency History</h2></div>
        {loading ? <div className="p-4"><Loader rows={3} /></div> : (
          <div className="grid gap-3 p-4">
            {items.map((item) => <SosCard item={item} key={item._id} />)}
            {items.length === 0 && <p className="text-sm text-zinc-400">No SOS requests yet.</p>}
          </div>
        )}
      </div>
    </section>
  );
};

const SosCard = ({ item }) => (
  <article className="rounded-md border border-white/10 bg-police-bg p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-white">{item.emergencyType}</p>
        <p className="mt-1 text-sm text-zinc-400">{item.location?.address}</p>
      </div>
      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">{item.status}</span>
    </div>
    <div className="mt-4 grid gap-2 text-sm text-zinc-300 md:grid-cols-3">
      <p>Priority: {item.priority}</p>
      <p>Patrol: {item.assigned_patrol_id?.name || "Pending"}</p>
      <p>Officer: {item.assigned_officer_id?.name || "Pending"}</p>
    </div>
  </article>
);

export default CivilianEmergency;
