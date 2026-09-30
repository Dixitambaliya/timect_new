export default function Preloader() {
  return (
    <div className="preloader">
      <img
        src="https://res.cloudinary.com/dphscxzb4/image/upload/v1784048492/timect/timect_logo.png"
        alt="Timect Logo"
        className="preloader-logo w-24 h-24 rounded-full mx-auto mb-2 object-contain"
      />
      <div className="preloader-text tracked-sm text-[12px] mb-1.5 text-gray-700">Loading...</div>
      <div className="preloader-line-container">
        <div className="preloader-line"></div>
      </div>
    </div>
  );
}
