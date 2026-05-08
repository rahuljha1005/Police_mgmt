import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";

const UploadEvidenceModal = ({ caseUpdate, onClose, onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);

  const submit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    await onSubmit(caseUpdate._id, formData, (event) => {
      setProgress(Math.round((event.loaded * 100) / event.total));
    });
    setFiles([]);
    setProgress(0);
  };

  return (
    <Modal onClose={onClose} open={Boolean(caseUpdate)} title="Upload Evidence">
      <form className="space-y-4" onSubmit={submit}>
        <label className="block rounded-lg border border-dashed border-police-accent/40 bg-police-bg p-6 text-center text-sm text-zinc-300">
          <span>Drop files here or choose evidence files</span>
          <input
            accept="image/png,image/jpeg,application/pdf,video/mp4"
            className="mt-4 block w-full text-sm"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
            type="file"
          />
        </label>
        <div className="space-y-2">
          {files.map((file) => (
            <div className="flex items-center justify-between rounded-md bg-police-bg p-3 text-sm" key={file.name}>
              <span className="text-zinc-200">{file.name}</span>
              <Badge value={file.type} />
            </div>
          ))}
        </div>
        {progress > 0 && <div className="h-2 overflow-hidden rounded-full bg-police-bg"><div className="h-full bg-police-accent" style={{ width: `${progress}%` }} /></div>}
        <Button disabled={!files.length} type="submit">Upload</Button>
      </form>
    </Modal>
  );
};

export default UploadEvidenceModal;
