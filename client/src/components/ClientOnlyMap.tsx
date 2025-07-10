'use client';
import dynamic from 'next/dynamic';
import { Resource } from '@/types/disaster.types';

const NoSSRMap = dynamic(() => import('./DisasterResourcesMap'), { ssr: false });

export default function ClientOnlyMap({ resources }: { resources: Resource[] }) {
  return <NoSSRMap resources={resources} />;
}
