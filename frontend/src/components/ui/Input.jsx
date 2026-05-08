const Input = ({ label, className = "", ...props }) => (
  <label className="block text-sm text-zinc-300">
    {label && <span>{label}</span>}
    <input
      className={[
        "mt-2 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm text-white outline-none focus:border-police-accent",
        className,
      ].join(" ")}
      {...props}
    />
  </label>
);

export const Select = ({ label, children, className = "", ...props }) => (
  <label className="block text-sm text-zinc-300">
    {label && <span>{label}</span>}
    <select
      className={[
        "mt-2 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm text-white outline-none focus:border-police-accent",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </select>
  </label>
);

export const Textarea = ({ label, className = "", ...props }) => (
  <label className="block text-sm text-zinc-300">
    {label && <span>{label}</span>}
    <textarea
      className={[
        "mt-2 min-h-28 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm text-white outline-none focus:border-police-accent",
        className,
      ].join(" ")}
      {...props}
    />
  </label>
);

export default Input;
