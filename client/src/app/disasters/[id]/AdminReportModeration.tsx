'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Report } from '@/types/disaster.types';

type Props = {
  disasterId: string;
  reports: Report[];
};

export default function AdminReportModeration({ disasterId, reports }: Props) {
  const [localReports, setLocalReports] = useState(reports);

  const moderateReport = async (reportId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch(`/api/disasters/${disasterId}/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: status }),
      });

      if (!res.ok) throw new Error('Moderation failed');

      toast.success(`Report ${status}`);
      setLocalReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
    }
  };

  if (localReports.length === 0) {
    return <p className="text-sm text-gray-400">No pending reports.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Moderate Reports</h2>
      {localReports.map((r) => (
        <div key={r.id} className="border p-4 rounded-lg shadow-sm space-y-2">
          <p>{r.content}</p>
          {r.image_url && <img src={r.image_url} alt="report" className="max-w-sm rounded" />}
          <div className="flex gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => moderateReport(r.id, 'verified')}
            >
              Verify
            </Button>
            <Button
              variant="outline"
              onClick={() => moderateReport(r.id, 'rejected')}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
