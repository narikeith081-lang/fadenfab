export default function Hero() {
  return (
    <section className="text-center px-6 py-24 text-white">
      <h2 className="text-5xl md:text-7xl font-bold">
        Custom T-Shirts <br />
        <span className="text-yellow-400">For Every Event</span>
      </h2>

      <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
        Premium custom apparel for companies, colleges,
        startups and communities.
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <button className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold">
          Get Quote
        </button>

        <button className="border border-white px-8 py-3 rounded-full">
          WhatsApp Us
        </button>
      </div>
    </section>
  );
}