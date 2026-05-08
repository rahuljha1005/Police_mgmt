const EvidenceList = ({ attachments = [] }) => {
  if (!attachments.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {attachments.map((file, index) => (
        <a className="block rounded-md border border-white/10 px-3 py-2 text-sm text-police-accent hover:text-white" href={file.fileUrl} key={`${file.fileUrl}-${index}`} rel="noreferrer" target="_blank">
          {file.fileName || file.fileUrl} - {file.fileType}
        </a>
      ))}
    </div>
  );
};

export default EvidenceList;
