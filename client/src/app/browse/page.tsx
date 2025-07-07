'use client';

import { DisasterCard } from "@/components/DisasterCard";
import { api } from "@/lib/api";
import { Disaster } from "@/types/disaster.types";
import { useEffect, useState } from "react";

export default function BrowsePage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDisasters() {
      try {
        const res = await api.get("/browse");
        console.log("Fetched disasters:", res.data);

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid data format from API");
        }

        setDisasters(res.data);
      }
      catch (err) {
        console.error("Failed to fetch disasters", err);
        setError("Failed to load disasters. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchDisasters();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Browse Disasters</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : disasters.length === 0 ? (
        <p>No disasters found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {disasters.map((disaster) => (
            <DisasterCard key={disaster.id} disaster={disaster} />
          ))}
        </div>
      )}
    </main>
  );
}
