import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input, { Select, Textarea } from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { CASE_UPDATE_TYPES, FIR_LIFECYCLE_STATUSES } from "../../../utils/constants";

const initialForm = { officer_id: "", updateType: "NOTE", title: "", description: "", newStatus: "", fileUrl: "", fileType: "" };

const AddCaseUpdateModal = ({ firId, onClose, onSubmit, open, officers }) => {
  const [form, setForm] = useState(initialForm);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      fir_id: firId,
      officer_id: form.officer_id,
      updateType: form.updateType,
      title: form.title,
      description: form.description,
      ...(form.updateType === "STATUS_CHANGED" ? { newStatus: form.newStatus } : {}),
      ...(form.updateType === "EVIDENCE_ADDED" ? { attachments: [{ fileUrl: form.fileUrl, fileType: form.fileType }] } : {}),
    };
    await onSubmit(payload);
    setForm(initialForm);
  };

  return (
    <Modal onClose={onClose} open={open} title="Add Case Update">
      <form className="space-y-3" onSubmit={submit}>
        <Select label="Officer" name="officer_id" onChange={update} value={form.officer_id}><option value="">Select officer</option>{officers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select>
        <Select label="Update Type" name="updateType" onChange={update} value={form.updateType}>{CASE_UPDATE_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
        <Input label="Title" name="title" onChange={update} value={form.title} />
        <Textarea label="Description" name="description" onChange={update} value={form.description} />
        {form.updateType === "STATUS_CHANGED" && <Select label="New Status" name="newStatus" onChange={update} value={form.newStatus}><option value="">Select status</option>{FIR_LIFECYCLE_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</Select>}
        {form.updateType === "EVIDENCE_ADDED" && <div className="grid gap-3 sm:grid-cols-2"><Input label="File URL" name="fileUrl" onChange={update} value={form.fileUrl} /><Input label="File Type" name="fileType" onChange={update} value={form.fileType} /></div>}
        <Button type="submit">Add Update</Button>
      </form>
    </Modal>
  );
};

export default AddCaseUpdateModal;
