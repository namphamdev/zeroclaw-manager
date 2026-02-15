import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          ZeroClaw Manager
        </Link>
        <div className="space-x-4">
          <Link href="/" className="text-gray-300 hover:text-white">
            Instances
          </Link>
          <Link href="/providers" className="text-gray-300 hover:text-white">
            Providers
          </Link>
        </div>
      </div>
    </nav>
  );
}
