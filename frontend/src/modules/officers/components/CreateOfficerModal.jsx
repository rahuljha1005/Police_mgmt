import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input, { Select } from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { OFFICER_ROLES } from "../../../utils/constants";

const initialForm = { name: "", email: "", phone: "", role: "CONSTABLE", police_station_id: "" };

const CreateOfficerModal = ({ onClose, onSubmit, open, stations }) => {
  const [form, setForm] = useState(initialForm);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  };

  return (
    <Modal onClose={onClose} open={open} title="Create Officer">
      <form className="space-y-3" onSubmit={submit}>
        <Input label="Name" name="name" onChange={update} value={form.name} />
        <Input label="Email" name="email" onChange={update} type="email" value={form.email} />
        <Input label="Phone" name="phone" onChange={update} value={form.phone} />
        <Select label="Role" name="role" onChange={update} value={form.role}>
          {OFFICER_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
        </Select>
        <Select label="Police Station" name="police_station_id" onChange={update} value={form.police_station_id}>
          <option value="">Select station</option>
          {stations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
        </Select>
        <Button type="submit">Create Officer</Button>
      </form>
    </Modal>
  );
};

export default CreateOfficerModal;
