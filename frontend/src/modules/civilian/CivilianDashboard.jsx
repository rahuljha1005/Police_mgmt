import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { createMyComplaint, getMyComplaints } from "../../services/complaint.api";

const initialForm = {
  title: "",
  description: "",
  police_station_id: "",
  priority: "MEDIUM",
  complaint_location: {
    address: "",
    latitude: "",
    longitude: "",
  },
};

const CivilianDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadComplaints = () => {
    setLoading(true);
    getMyComplaints({ page: 1, limit: 20 })
      .then((response) => setComplaints(response.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load complaints."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateLocation = (event) =>
    setForm((current) => ({
      ...current,
      complaint_location: { ...current.complaint_location, [event.target.name]: event.target.value },
    }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      await createMyComplaint({
        ...form,
        complaint_location: {
          ...form.complaint_location,
          latitude: Number(form.complaint_location.latitude),
          longitude: Number(form.complaint_location.longitude),
        },
      });
      setForm(initialForm);
      setFeedback("Complaint submitted. You can track its status below.");
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Civilian Portal</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Complaint Tracking</h1>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}
      {feedback && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{feedback}</div>}

      <form className="grid gap-4 rounded-lg border border-white/10 bg-police-panel p-4 md:grid-cols-2" onSubmit={submit}>
        <Input label="Complaint Title" name="title" onChange={updateForm} value={form.title} />
        <Select label="Priority" name="priority" onChange={updateForm} value={form.priority}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
        <Textarea className="md:col-span-2" label="Description" name="description" onChange={updateForm} value={form.description} />
        <Input className="md:col-span-2" label="Location Address" name="address" onChange={updateLocation} value={form.complaint_location.address} />
        <Input label="Latitude" name="latitude" onChange={updateLocation} type="number" value={form.complaint_location.latitude} />
        <Input label="Longitude" name="longitude" onChange={updateLocation} type="number" value={form.complaint_location.longitude} />
        <div className="md:col-span-2">
          <Button disabled={submitting} type="submit">{submitting ? "Submitting..." : "Submit Complaint"}</Button>
        </div>
      </form>

      <div className="rounded-lg border border-white/10 bg-police-panel">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white">My Complaints</h2>
        </div>
        {loading ? (
          <div className="p-4"><Loader rows={3} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Linked FIR</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr className="border-t border-white/10" key={complaint._id}>
                    <td className="px-4 py-3 text-white">{complaint.title}</td>
                    <td className="px-4 py-3 text-zinc-300">{complaint.status}</td>
                    <td className="px-4 py-3 text-zinc-300">{complaint.priority}</td>
                    <td className="px-4 py-3 text-zinc-300">{complaint.fir_id?.fir_number || "Not converted"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default CivilianDashboard;
