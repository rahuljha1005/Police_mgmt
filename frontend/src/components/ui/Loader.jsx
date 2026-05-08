const Loader = ({ rows = 3 }) => (
  <div className="grid gap-4">
    {Array.from({ length: rows }, (_, index) => (
      <div className="h-24 animate-pulse rounded-lg border border-white/10 bg-police-panel" key={index} />
    ))}
  </div>
);

export default Loader;
