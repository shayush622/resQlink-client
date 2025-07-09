'use client';
import { useParams } from 'next/navigation';
import SubmitReport from '../SubmitReport';

export default function SubmitReportPage() {
  const { id } = useParams();

  return (
    <div className="pt-20 px-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit a Report</h1>
      <SubmitReport disasterId={id as string} />
    </div>
  );
}
