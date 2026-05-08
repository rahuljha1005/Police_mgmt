import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input, { Select, Textarea } from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { FIR_PRIORITIES } from "../../../utils/constants";

const initialForm = {
  title: "",
  description: "",
  location: { address: "", latitude: "", longitude: "" },
  crime_type_id: "",
  police_station_id: "",
  assigned_officer_id: "",
  priority: "medium",
};

const CreateFirModal = ({ onClose, onSubmit, open, reference }) => {
  const [form, setForm] = useState(initialForm);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateLocation = (event) => setForm((current) => ({ ...current, location: { ...current.location, [event.target.name]: event.target.value } }));
  const stationOfficers = reference.officers.filter((officer) => !form.police_station_id || String(officer.police_station_id) === String(form.police_station_id));

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit({ ...form, location: { ...form.location, latitude: Number(form.location.latitude), longitude: Number(form.location.longitude) } });
    setForm(initialForm);
  };

  return (
    <Modal onClose={onClose} open={open} title="Create FIR">
      <form className="space-y-3" onSubmit={submit}>
        <Input label="Title" name="title" onChange={update} value={form.title} />
        <Textarea label="Description" name="description" onChange={update} value={form.description} />
        <Input label="Location Address" name="address" onChange={updateLocation} value={form.location.address} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Latitude" name="latitude" onChange={updateLocation} type="number" value={form.location.latitude} />
          <Input label="Longitude" name="longitude" onChange={updateLocation} type="number" value={form.location.longitude} />
        </div>
        <Select label="Crime Type" name="crime_type_id" onChange={update} value={form.crime_type_id}><option value="">Select</option>{reference.crimeTypes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Select label="Police Station" name="police_station_id" onChange={update} value={form.police_station_id}><option value="">Select</option>{reference.policeStations.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Select label="Assigned Officer" name="assigned_officer_id" onChange={update} value={form.assigned_officer_id}><option value="">Select</option>{stationOfficers.map((item) => <option key={item._id} value={item._id}>{item.name} - {item.role}</option>)}</Select>
        <Select label="Priority" name="priority" onChange={update} value={form.priority}>{FIR_PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
        <Button type="submit">Create FIR</Button>
      </form>
    </Modal>
  );
};

export default CreateFirModal;
