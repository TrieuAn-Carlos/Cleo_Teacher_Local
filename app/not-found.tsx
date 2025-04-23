import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <h2 className="text-2xl mb-8">Oh nein, Page not found</h2>
        <p className="mb-8">
          The page you are looking for might have been removed or is temporarily
          unavailable.
        </p>

        <div className="space-y-4">
          <p>Try one of these working routes:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/main"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Go to Homepage
            </Link>
            <Link
              href="/debug"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded text-white"
            >
              Go to Debug Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
