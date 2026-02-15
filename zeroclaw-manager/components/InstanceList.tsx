'use client';

import axios from 'axios';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => axios.get(url).then(res => res.data.data);

export default function InstanceList() {
  const { data: instances, error, isLoading } = useSWR('/api/instances', fetcher, { refreshInterval: 5000 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading instances</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {instances && instances.map((instance: any) => (
        <div key={instance._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900">{instance.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${instance.isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {instance.isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4 truncate" title={instance.workspacePath}>
            {instance.workspacePath}
          </p>
          <div className="flex space-x-2">
             <Link
               href={`/instances/${instance._id}`}
               className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition duration-150"
             >
               Manage
             </Link>
          </div>
        </div>
      ))}
      {instances && instances.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-10">
          No instances found. Create one to get started.
        </div>
      )}
    </div>
  );
}
