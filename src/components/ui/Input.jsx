import clsx from "clsx";

export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  suffix,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          className={clsx(
            "w-full border rounded-xl px-4 py-3 text-base bg-white transition-all duration-200",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            error
              ? "border-danger focus:border-danger focus:ring-danger/20"
              : "border-gray-200",
            Icon && "pl-10",
            suffix && "pr-12",
            className,
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-400 italic">{hint}</p>
      )}
    </div>
  );
}

export function Textarea({ label, error, hint, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        rows={3}
        className={clsx(
          "w-full border rounded-xl px-4 py-3 text-base bg-white resize-none transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          error ? "border-danger" : "border-gray-200",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-400 italic">{hint}</p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  hint,
  children,
  className = "",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={clsx(
          "w-full border rounded-xl px-4 py-3 text-base bg-white transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          error ? "border-danger" : "border-gray-200",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
