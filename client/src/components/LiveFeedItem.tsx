'use client';

import { LiveKitPayload } from '@/lib/liveKitEmitter';
import clsx from 'clsx';

type Props = {
  payload: LiveKitPayload;
};

export default function LiveFeedItem({ payload }: Props) {
  const { type, data } = payload;

  const time = 'created_at' in data
    ? new Date(data.created_at).toLocaleString()
    : '';

  const title = type.replaceAll('_', ' ').toUpperCase();

  const colorClasses = {
    report_added: 'border-yellow-500 bg-yellow-50',
    report_updated: 'border-green-600 bg-green-50',
    official_update_added: 'border-blue-500 bg-blue-50',
    resources_updated: 'border-indigo-500 bg-indigo-50',
    social_media_updated: 'border-pink-500 bg-pink-50',
    disaster_updated: 'border-gray-500 bg-gray-100',
  };

  return (
    <div
      className={clsx(
        'p-4 rounded-md shadow-sm border-l-4',
        colorClasses[type]
      )}
    >
      <div className="text-xs text-gray-500 mb-1">{time}</div>
      <div className="font-semibold text-sm mb-2">{title}</div>

      {type === 'report_added' || type === 'report_updated' ? (
        <>
          <p className="text-sm">📝 <strong>Report:</strong> {data.content}</p>
          {data.image_url && (
            <img
              src={data.image_url}
              alt="report image"
              className="mt-2 w-32 rounded-md shadow"
            />
          )}
          <p className="text-xs text-gray-600 mt-1">
            Submitted by: <code>{data.user_id}</code>
          </p>
          <p className="text-xs font-semibold mt-1">
            Status: <span className={clsx(
              data.verification_status === 'verified' && 'text-green-600',
              data.verification_status === 'rejected' && 'text-red-500',
              data.verification_status === 'pending' && 'text-yellow-600'
            )}>
              {data.verification_status}
            </span>
          </p>
        </>
      ) : type === 'official_update_added' ? (
        <>
          <p className="text-sm font-medium">{data.title}</p>
          <p className="text-sm">{data.description}</p>
          <p className="text-xs mt-1 text-gray-600">By {data.posted_by}</p>
        </>
      ) : type === 'resources_updated' ? (
        <>
          <p className="text-sm">
            📦 <strong>{data.resource_type}</strong> updated.
          </p>
          <p className="text-xs text-gray-600">ID: {data.resource_id}</p>
          <p className="text-xs text-gray-700 mt-1">{data.summary}</p>
        </>
      ) : type === 'social_media_updated' ? (
        <>
          <p className="text-sm">
            🐦 Social Media update from <strong>{data.source}</strong>
          </p>
          <p className="text-xs text-gray-700 mt-1">{data.summary}</p>
        </>
      ) : (
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}
