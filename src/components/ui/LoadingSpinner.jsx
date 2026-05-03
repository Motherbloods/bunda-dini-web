import clsx from "clsx";

export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div
      className={clsx(
        "animate-spin rounded-full border-4 border-primary border-t-transparent",
        sizes[size],
        className,
      )}
    />
  );
}

export function PageLoader({ message = "Memuat..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <LoadingSpinner size="lg" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="md" />
    </div>
  );
}
