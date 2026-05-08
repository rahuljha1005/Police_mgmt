import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import Pagination from "../../components/ui/Pagination";
import { getReferenceData } from "../../services/admin.api";
import { createCaseUpdate, getFirTimeline, uploadEvidence } from "../../services/caseUpdate.api";
import AddCaseUpdateModal from "./components/AddCaseUpdateModal";
import TimelineList from "./components/TimelineList";
import UploadEvidenceModal from "./components/UploadEvidenceModal";

const CaseTimeline = () => {
  const { firId } = useParams();
  const [updates, setUpdates] = useState([]);
  const [reference, setReference] = useState({ officers: [] });
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [evidenceUpdate, setEvidenceUpdate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [timelineResponse, referenceResponse] = await Promise.all([getFirTimeline(firId, { page, limit: 10 }), getReferenceData()]);
      setUpdates(timelineResponse.data.data);
      setPagination(timelineResponse.data.pagination);
      setReference(referenceResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load case timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [firId, page]);
  const addUpdate = async (payload) => { await createCaseUpdate(payload); setModalOpen(false); load(); };
  const submitEvidence = async (id, formData, onUploadProgress) => {
    await uploadEvidence(id, formData, onUploadProgress);
    setEvidenceUpdate(null);
    load();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><Link className="text-sm font-semibold text-police-accent hover:text-white" to={`/firs/${firId}`}>Back to FIR</Link><h1 className="mt-2 text-3xl font-semibold text-white">Investigation Timeline</h1></div>
        <Button onClick={() => setModalOpen(true)}>Add Update</Button>
      </div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}
      {loading ? <Loader rows={4} /> : updates.length ? <TimelineList onUploadEvidence={setEvidenceUpdate} updates={updates} /> : <EmptyState message="No timeline updates found." />}
      <Pagination pagination={pagination} onPageChange={setPage} />
      <AddCaseUpdateModal firId={firId} officers={reference.officers} onClose={() => setModalOpen(false)} onSubmit={addUpdate} open={modalOpen} />
      <UploadEvidenceModal caseUpdate={evidenceUpdate} onClose={() => setEvidenceUpdate(null)} onSubmit={submitEvidence} />
    </section>
  );
};

export default CaseTimeline;
