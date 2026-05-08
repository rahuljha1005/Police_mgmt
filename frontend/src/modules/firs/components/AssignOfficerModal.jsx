import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

const AssignOfficerModal = ({ fir, onClose, onSubmit, officers }) => {
  const [officerId, setOfficerId] = useState("");

  useEffect(() => {
    setOfficerId(fir?.assigned_officer_id?._id || "");
  }, [fir]);

  return (
    <Modal onClose={onClose} open={Boolean(fir)} title="Assign Officer">
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(fir._id, officerId); }}>
        <Select label="Officer" onChange={(event) => setOfficerId(event.target.value)} value={officerId}>
          <option value="">Select officer</option>
          {officers.map((officer) => <option key={officer._id} value={officer._id}>{officer.name} - {officer.role}</option>)}
        </Select>
        <Button type="submit">Save Assignment</Button>
      </form>
    </Modal>
  );
};

export default AssignOfficerModal;
