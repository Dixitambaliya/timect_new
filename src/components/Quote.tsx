export default function Quote() {
  return (
    <section className="bg-[#f4f4f2] py-16 text-center">
      <img
        src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048492/timect/timect_logo.png"
        alt="Timect Logo"
        className="w-14 h-14 rounded-full mx-auto mb-5 object-contain"
      />
      <p className="serif text-[26px] md:text-[30px]">
        <span className="mr-1">«</span>Time never stops, why should we?
        <span className="ml-1">»</span>
      </p>
      <p className="tracked-sm text-[12px] mt-3 text-[var(--muted)]">
        — Timect —
      </p>
    </section>
  );
}
