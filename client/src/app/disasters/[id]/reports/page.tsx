'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReportList from '../ReportList';
import { Report } from '@/types/disaster.types';

export default function ReportsPage() {
  const { id } = useParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchReports() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${id}/reports`);
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [id]);

  if (loading) {
    return <div className="pt-20 text-center">Loading reports...</div>;
  }

  return (
    <div className="pt-20 px-4 max-w-5xl mx-auto">
      <ReportList reports={reports} />
    </div>
  );
}
