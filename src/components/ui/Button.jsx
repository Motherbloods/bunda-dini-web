import clsx from "clsx";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark active:scale-[0.98]",
    outline:
      "border-2 border-primary text-primary hover:bg-primary-pale active:scale-[0.98]",
    danger: "bg-danger text-white hover:bg-red-800 active:scale-[0.98]",
    ghost: "text-primary hover:bg-primary-pale active:scale-[0.98]",
    success: "bg-success text-white hover:bg-green-800 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        Icon && <Icon size={18} />
      )}
      {children}
    </button>
  );
}

// Full-width variant
export function BlockButton(props) {
  return <Button {...props} className={`w-full ${props.className ?? ""}`} />;
}
