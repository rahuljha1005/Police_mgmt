const variants = {
  primary: "bg-police-primary text-white hover:bg-police-accent hover:text-police-bg",
  outline: "border border-police-primary text-police-accent hover:bg-police-primary hover:text-white",
  danger: "bg-red-700 text-white hover:bg-red-600",
  ghost: "text-zinc-300 hover:bg-white/5 hover:text-white",
};

const Button = ({ children, className = "", variant = "primary", ...props }) => (
  <button
    className={[
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
      variants[variant],
      className,
    ].join(" ")}
    type={props.type || "button"}
    {...props}
  >
    {children}
  </button>
);

export default Button;
