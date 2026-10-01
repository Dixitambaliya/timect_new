import { ButtonOutline, ButtonPrimary } from "@/components/fuse/buttons";

export default function NotFound() {
  return (
    <div className="container-fuse py-10 md:py-16">
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-fuse bg-white px-6 py-16 text-center">
        <p className="font-chivo text-[110px] font-black leading-none text-heading md:text-[200px]">404</p>
        <h1 className="fuse-h3 mt-4">This page has stopped ticking</h1>
        <p className="mt-4 max-w-md text-muted">The page you were looking for doesn’t exist or has moved.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonPrimary href="/watches" bg="#f0f2f4">
            Shop watches
          </ButtonPrimary>
          <ButtonOutline href="/">Back to home</ButtonOutline>
        </div>
      </div>
    </div>
  );
}
