'use client';

import dynamic from 'next/dynamic';
import { Resource } from '@/types/disaster.types';

const NoSSRMap = dynamic(() => import('./DisasterResourcesMap'), {
  ssr: false,
  loading: () => <p>Loading map...</p>, // optional fallback
});

type Props = {
  resources: Resource[];
};

export default function ClientOnlyMap({ resources }: Props) {
  return <NoSSRMap resources={resources} />;
}
