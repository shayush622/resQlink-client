'use client';
import { useParams } from 'next/navigation';
import OfficialUpdateList from '../OfficialUpdateList';

export default function OfficialUpdatesPage() {
  const { id } = useParams();

  return (
    <div className="pt-20 px-4 max-w-5xl mx-auto">
      <OfficialUpdateList disasterId={id as string} />
    </div>
  );
}
