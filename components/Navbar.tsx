export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-800 px-8 py-5 flex justify-between items-center text-white">
      <h1 className="text-3xl font-bold text-yellow-400">THREADS</h1>

      <div className="hidden md:flex gap-8">
        <a href="#">Home</a>
        <a href="#">Services</a>
        <a href="#">Portfolio</a>
        <a href="#">Contact</a>
      </div>
    </nav>
  );
}