'use client';

import { Report } from '@/types/disaster.types';

export default function ReportList({ reports }: { reports: Report[] }) {
  if (!reports.length) return <p>No reports yet.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Reports</h2>
      {reports.map((r) => (
        <div key={r.id} className="border rounded-lg p-4 shadow">
          <p className="font-medium">{r.content}</p>
          <p className="text-xs text-gray-500">
            By: {r.user_id} | {new Date(r.created_at).toLocaleString()}
          </p>
          {r.image_url && (
            <img
              src={r.image_url}
              alt="report"
              className="mt-2 max-w-xs rounded-lg"
            />
          )}
          <p
            className={`text-sm font-bold mt-1 ${
              r.verification_status === 'verified'
                ? 'text-green-600'
                : r.verification_status === 'rejected'
                ? 'text-red-500'
                : 'text-yellow-600'
            }`}
          >
            Status: {r.verification_status}
          </p>
        </div>
      ))}
    </div>
  );
}
