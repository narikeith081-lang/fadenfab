export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white px-8 py-10 border-t border-gray-800">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        <div>
          <h2 className="text-2xl font-bold text-yellow-400">THREADS</h2>
          <p className="mt-3 text-gray-400">
            Premium bulk T-shirt printing for events,
            companies and colleges in Chennai.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Services</h3>
          <p className="text-gray-400">Corporate Events</p>
          <p className="text-gray-400">College Fest</p>
          <p className="text-gray-400">Hackathons</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <p className="text-gray-400">Chennai, India</p>
          <p className="text-gray-400">+91 98765 43210</p>
          <p className="text-gray-400">hello@threads.in</p>
        </div>

      </div>

      <p className="text-center text-gray-500 mt-10">
        © 2026 Threads. All rights reserved.
      </p>
    </footer>
  );
}