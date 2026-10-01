import { notFound } from "next/navigation";

/** Unknown storefront URLs render the Fuse 404 inside the site chrome. */
export default function CatchAll() {
  notFound();
}
