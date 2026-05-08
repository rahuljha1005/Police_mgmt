import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import { ROLES } from "../../../utils/constants";

const RoleChangeModal = ({ officer, onClose, onSubmit }) => {
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(officer?.role || "");
  }, [officer]);

  return (
    <Modal onClose={onClose} open={Boolean(officer)} title="Change Role">
      <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(officer._id, role); }}>
        <Select label="Role" onChange={(event) => setRole(event.target.value)} value={role}>
          {ROLES.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Button type="submit">Save Role</Button>
      </form>
    </Modal>
  );
};

export default RoleChangeModal;
