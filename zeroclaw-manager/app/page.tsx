import InstanceList from '@/components/InstanceList';
import CreateInstanceForm from '@/components/CreateInstanceForm';

export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      <CreateInstanceForm />

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Instances</h2>
        <InstanceList />
      </div>
    </div>
  );
}
