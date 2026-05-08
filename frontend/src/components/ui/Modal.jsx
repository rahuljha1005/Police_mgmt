import Button from "./Button";

const Modal = ({ children, onClose, open, title }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-police-panel p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <Button onClick={onClose} variant="ghost">Close</Button>
        </div>
        {children}
      </section>
    </div>
  );
};

export default Modal;
