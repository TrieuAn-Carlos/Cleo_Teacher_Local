"use client";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void; // Optional: Allow dismissing the banner
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold">Error</p>
          <p>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-700 hover:text-red-900"
            aria-label="Dismiss error message"
          >
            &times; {/* Simple 'x' for close */}
          </button>
        )}
      </div>
    </div>
  );
}
