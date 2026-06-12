import HeroCurve from "./hero-curve";
import HeroDash from "./hero-dash";

export default function Hero() {
  return (
    <section className="relative overflow-hidden h-screen bg-white">
      <HeroCurve />
      <HeroDash />
      <div className="relative z-2 mx-auto grid grid-cols-2 max-w-7xl  px-6 py-24">
        <div>
          <span>Product Growth Solution in Single Platform.</span>
          <h1 className="max-w-xl text-6xl font-bold tracking-">
            Managing business payments has never been easier
          </h1>
          <p className="mt-6 max-w-lg text-gray-600">
            Automate invoices, manage payments, and track your business cash
            flow from one platform.
          </p>
        </div>
      </div>
    </section>
  );
}
