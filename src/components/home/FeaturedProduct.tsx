"use client";

import type { Product } from "@/db/actions";
import { Section, SectionHeading } from "@/components/fuse/ui";
import ProductMain from "@/components/product/ProductMain";

/** Homepage spotlight for the product flagged "main product" in the admin. */
export default function FeaturedProduct({ product }: { product: Product }) {
  return (
    <Section className="container-fuse py-10 md:py-[60px]">
      <SectionHeading center className="mb-6 md:mb-[60px]">
        The signature piece
      </SectionHeading>
      <div className="reveal-fade">
        <ProductMain product={product} headingAs="h2" />
      </div>
    </Section>
  );
}
