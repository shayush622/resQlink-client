'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Disaster, Report } from '@/types/disaster.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SubmitReportForm from './SubmitReport';
import ReportList from './ReportList';

export default function DisasterDetailsPage() {
  const { id } = useParams();
  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingDisaster, setLoadingDisaster] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDisaster = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${id}`);
        if (!res.ok) throw new Error('Failed to fetch disaster');
        const data = await res.json();
        setDisaster(data);
      } catch (err) {
        console.error('Disaster fetch error:', err);
      } finally {
        setLoadingDisaster(false);
      }
    };

    const fetchReports = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${id}/reports?refresh=true`);
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error('Reports fetch error:', err);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchDisaster();
    fetchReports();
  }, [id]);

  const refetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/disasters/${id}/reports?refresh=true`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error('Refetch reports error:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  if (loadingDisaster) return <p className="text-center py-10">Loading disaster...</p>;
  if (!disaster) return <p className="text-center py-10 text-red-500">Disaster not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{disaster.title}</h1>
        <p className="text-sm text-muted-foreground">{disaster.description}</p>
        <p className="text-sm font-medium mt-1">📍 {disaster.location_name}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          {disaster.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">#{tag}</Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Created at: {new Date(disaster.created_at).toLocaleString()}
        </p>
      </div>

      {/* Submit Report Section */}
      <div>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="mt-4">
            Submit a Report
          </Button>
        ) : (
          <div className="relative bg-background border border-border rounded-xl shadow-lg p-6 transition-colors">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-sm text-muted-foreground hover:text-destructive transition"
            >
              Cancel
            </button>
            <SubmitReportForm
              disasterId={disaster.id}
              onSuccess={() => {
                refetchReports();
                setShowForm(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Report List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Reports</h2>
        {loadingReports ? (
          <p className="text-muted-foreground">Loading reports...</p>
        ) : (
          <ReportList reports={reports} />
        )}
      </div>
    </div>
  );
}
