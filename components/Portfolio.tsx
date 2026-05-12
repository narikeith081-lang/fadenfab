export default function Portfolio() {
  const items = [
    "Corporate Event Tees",
    "College Fest Shirts",
    "Hackathon Merchandise",
    "Startup Team Uniforms",
    "Fun Friday Prints",
    "Fan Club Jerseys"
  ];

  return (
    <section className="bg-black text-white px-8 py-20">
      <h2 className="text-4xl font-bold text-center mb-12">
        Our Portfolio
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-yellow-400 transition"
          >
            <div className="h-40 bg-gray-800 rounded-xl mb-6"></div>

            <h3 className="text-xl font-semibold text-yellow-400">
              {item}
            </h3>

            <p className="text-gray-400 mt-2">
              Premium custom apparel solution for events.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}