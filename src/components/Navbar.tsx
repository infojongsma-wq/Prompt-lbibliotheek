import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-oost-donkerblauw shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-oost-lichtblauw">
            Prompt Bibliotheek
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/" className="text-oost-lichtblauw/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link
              href="/nieuw"
              className="bg-oost-blauw text-white px-4 py-2 rounded-lg hover:bg-oost-blauw/90 transition-colors font-semibold"
            >
              + Nieuwe Prompt
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
