'use client';

import { use, useState } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import Terminal from '@/components/Terminal';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => axios.get(url).then(res => res.data.data);

export default function InstancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: instance, error, isLoading } = useSWR(`/api/instances/${id}`, fetcher, { refreshInterval: 2000 });
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: 'start' | 'stop') => {
    setActionLoading(true);
    try {
      await axios.post(`/api/instances/${id}/action`, { action });
      mutate(`/api/instances/${id}`);
    } catch (error: any) {
      alert(`Action failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this instance? This will remove all data.')) return;
    try {
      await axios.delete(`/api/instances/${id}`);
      router.push('/');
    } catch (error: any) {
      alert(`Delete failed: ${error.response?.data?.error || error.message}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading instance</div>;
  if (!instance) return <div>Instance not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{instance.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{instance.workspacePath}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
             <span className="text-sm font-medium text-gray-700">Status</span>
             <span className={`px-3 py-1 text-sm font-bold rounded-full ${instance.isRunning || instance.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
               {instance.isRunning || instance.status === 'running' ? 'Running' : 'Stopped'}
             </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-x-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Controls</h2>
        <button
          onClick={() => handleAction('start')}
          disabled={actionLoading || instance.isRunning}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Start Agent
        </button>
        <button
          onClick={() => handleAction('stop')}
          disabled={actionLoading || !instance.isRunning}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Stop
        </button>
        <button
          onClick={handleDelete}
          disabled={actionLoading || instance.isRunning}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:bg-gray-400 float-right"
        >
          Delete Instance
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Terminal Output</h2>
        <Terminal instanceId={id} />
      </div>
    </div>
  );
}
