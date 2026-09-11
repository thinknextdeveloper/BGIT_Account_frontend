import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-7xl font-bold text-blue-600">404</h1>

      <h2 className="mt-4 text-blue-600 text-3xl font-semibold">
        Page Not Found
      </h2>

      <p className="mt-2 text-gray-600 text-center">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}