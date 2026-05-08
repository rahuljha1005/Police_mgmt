import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input, { Select, Textarea } from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { PRIORITIES } from "../../../utils/constants";

const initialForm = {
  civilian: { name: "", phone: "", email: "", address: "" },
  title: "",
  description: "",
  police_station_id: "",
  priority: "MEDIUM",
  complaint_location: { address: "", latitude: "", longitude: "" },
  assigned_officer_id: "",
};

const CreateComplaintModal = ({ onClose, onSubmit, open, reference }) => {
  const [form, setForm] = useState(initialForm);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateCivilian = (event) => setForm((current) => ({ ...current, civilian: { ...current.civilian, [event.target.name]: event.target.value } }));
  const updateLocation = (event) => setForm((current) => ({ ...current, complaint_location: { ...current.complaint_location, [event.target.name]: event.target.value } }));

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit({ ...form, complaint_location: { ...form.complaint_location, latitude: Number(form.complaint_location.latitude), longitude: Number(form.complaint_location.longitude) } });
    setForm(initialForm);
  };

  return (
    <Modal onClose={onClose} open={open} title="Create Complaint">
      <form className="space-y-3" onSubmit={submit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Civilian Name" name="name" onChange={updateCivilian} value={form.civilian.name} />
          <Input label="Phone" name="phone" onChange={updateCivilian} value={form.civilian.phone} />
          <Input label="Email" name="email" onChange={updateCivilian} value={form.civilian.email} />
          <Input label="Civilian Address" name="address" onChange={updateCivilian} value={form.civilian.address} />
        </div>
        <Input label="Title" name="title" onChange={update} value={form.title} />
        <Textarea label="Description" name="description" onChange={update} value={form.description} />
        <Input label="Complaint Location" name="address" onChange={updateLocation} value={form.complaint_location.address} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Latitude" name="latitude" onChange={updateLocation} type="number" value={form.complaint_location.latitude} />
          <Input label="Longitude" name="longitude" onChange={updateLocation} type="number" value={form.complaint_location.longitude} />
        </div>
        <Select label="Police Station" name="police_station_id" onChange={update} value={form.police_station_id}><option value="">Select</option>{reference.policeStations.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Select label="Assigned Officer" name="assigned_officer_id" onChange={update} value={form.assigned_officer_id}><option value="">Optional</option>{reference.officers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Select label="Priority" name="priority" onChange={update} value={form.priority}>{PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
        <Button type="submit">Create Complaint</Button>
      </form>
    </Modal>
  );
};

export default CreateComplaintModal;
