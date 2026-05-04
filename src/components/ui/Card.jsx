import clsx from "clsx";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
  loading = false,
}) {
  const colorMap = {
    primary: {
      bg: "bg-primary-pale",
      text: "text-primary",
      icon: "text-primary",
    },
    success: {
      bg: "bg-success-light",
      text: "text-success",
      icon: "text-success",
    },
    warning: {
      bg: "bg-warning-light",
      text: "text-warning",
      icon: "text-warning",
    },
    danger: {
      bg: "bg-danger-light",
      text: "text-danger",
      icon: "text-danger",
    },
    info: {
      bg: "bg-info-light",
      text: "text-info",
      icon: "text-info",
    },
  };

  const c = colorMap[color];

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={clsx("p-3 rounded-xl flex-shrink-0", c.bg)}>
          <Icon size={24} className={c.icon} />
        </div>

        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-1" />
          ) : (
            <p className={clsx("text-2xl font-bold truncate", c.text)}>
              {value}
            </p>
          )}

          <p className="text-xs text-gray-500 leading-tight line-clamp-2">
            {label}
          </p>
        </div>
      </div>
    </Card>
  );
}
