'use client';

import { useState } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => axios.get(url).then(res => res.data.data);

export default function CreateInstanceForm() {
  const { data: providers } = useSWR('/api/providers', fetcher);
  const [name, setName] = useState('');
  const [providerId, setProviderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/instances', { name, providerId: providerId || undefined });
      setName('');
      setProviderId('');
      setMessage('Instance created successfully!');
      mutate('/api/instances'); // Refresh list
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Instance</h2>
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Instance Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
            required
            placeholder="my-agent-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider (Optional)</label>
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-black"
          >
            <option value="">Default (OpenRouter)</option>
            {providers && providers.map((p: any) => (
              <option key={p._id} value={p._id}>{p.name} ({p.baseUrl})</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Instance'}
        </button>
      </form>
    </div>
  );
}
