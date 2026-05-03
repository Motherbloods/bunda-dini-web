export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && <Icon size={64} className="text-gray-300 mb-4" />}
      <p className="text-gray-500 font-semibold text-base mb-1">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm mb-6">{subtitle}</p>}
      {action && action}
    </div>
  );
}
