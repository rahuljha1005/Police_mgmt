import Button from "../../../components/ui/Button";

const VerifyOfficerActions = ({ officer, onVerify }) => {
  if (officer.status !== "pending") return null;

  return (
    <span className="inline-flex gap-2">
      <Button className="px-3 py-1 text-xs" onClick={() => onVerify(officer._id, "approved")}>Approve</Button>
      <Button className="px-3 py-1 text-xs" onClick={() => onVerify(officer._id, "rejected")} variant="danger">Reject</Button>
    </span>
  );
};

export default VerifyOfficerActions;
