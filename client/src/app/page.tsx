'use client';
export default function HomePage() {
  return (
    <main className="pt-24 px-6 max-w-6xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to ResQLink 🚨</h1>
      <p className="text-lg text-gray-400 mb-6">
        Real-time disaster monitoring, reporting, and coordination platform.
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-6">
        <a
          href="/browse"
          className="bg-cyan-600 text-white px-6 py-3 rounded-md shadow hover:bg-cyan-700 transition"
        >
          🌍 Browse Disasters
        </a>
        <a
          href="/live"
          className="bg-pink-600 text-white px-6 py-3 rounded-md shadow hover:bg-pink-700 transition"
        >
          📡 Live Feed
        </a>
        <a
          href="/login"
          className="bg-gray-800 text-white px-6 py-3 rounded-md shadow hover:bg-gray-900 transition"
        >
          🔐 Login
        </a>
      </div>
    </main>
  );
}
