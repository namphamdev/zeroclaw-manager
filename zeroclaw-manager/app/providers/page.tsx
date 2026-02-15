'use client';

import ProviderForm from '@/components/ProviderForm';
import useSWR, { mutate } from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data.data);

export default function ProvidersPage() {
  const { data: providers, error, isLoading } = useSWR('/api/providers', fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await axios.delete(`/api/providers/${id}`);
      mutate('/api/providers');
    } catch (error: any) {
      alert(`Error deleting provider: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Manage LLM Providers</h1>

      <ProviderForm />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Configured Providers</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error loading providers</p>}

        {providers && providers.length === 0 && <p className="text-gray-500">No custom providers configured.</p>}

        {providers && providers.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {providers.map((provider: any) => (
              <li key={provider._id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-500">{provider.baseUrl}</p>
                </div>
                <button
                  onClick={() => handleDelete(provider._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
