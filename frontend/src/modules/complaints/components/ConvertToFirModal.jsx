import { useState } from "react";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

const ConvertToFirModal = ({ complaint, onClose, onSubmit, reference }) => {
  const [form, setForm] = useState({ crime_type_id: "", police_station_id: "", assigned_officer_id: "" });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <Modal onClose={onClose} open={Boolean(complaint)} title="Convert Complaint to FIR">
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); onSubmit(complaint._id, form); }}>
        <Select label="Crime Type" name="crime_type_id" onChange={update} value={form.crime_type_id}><option value="">Select</option>{reference.crimeTypes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Select label="Police Station" name="police_station_id" onChange={update} value={form.police_station_id}><option value="">Use complaint station</option>{reference.policeStations.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Select label="Assigned Officer" name="assigned_officer_id" onChange={update} value={form.assigned_officer_id}><option value="">Use complaint officer</option>{reference.officers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Button type="submit">Convert</Button>
      </form>
    </Modal>
  );
};

export default ConvertToFirModal;
