import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/site/ContentPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms governing use of the Timect website and purchase of Timect wristwatches from our official online store.",
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms & Conditions"
      subtitle="These terms govern your use of the Timect website and the purchase of Timect wristwatches from our official online store."
    >
      <div className="rte">
        <p className="!text-[14px] text-muted">Last updated: July 2026</p>

        <h2>1. Acceptance of terms</h2>
        <p>
          By accessing our website or placing an order, you agree to these Terms &amp; Conditions and our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, please do not use this site or complete a
          purchase.
        </p>

        <h2>2. Products</h2>
        <p>
          Timect offers wristwatches and related accessories manufactured or finished to our brand standards. Product
          images, dial colors, and dimensions on the site are as accurate as possible; minor variations in finish, strap
          grain, or photography lighting may occur. Specifications (case size, movement type, water resistance) are
          provided for guidance and may be updated as manufacturing details evolve.
        </p>

        <h2>3. Orders &amp; pricing</h2>
        <p>
          Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel orders in cases of
          pricing errors, stock unavailability, suspected fraud, or other reasonable grounds. Prices are displayed in the
          currency shown on the product page and may exclude applicable taxes or shipping unless stated otherwise. Payment
          must be completed through our approved payment methods before dispatch.
        </p>

        <h2>4. Shipping &amp; delivery</h2>
        <p>
          We ship watches in secure packaging designed to protect the case, crystal, and bracelet or strap. Delivery
          estimates are indicative and not guaranteed. Risk of loss passes to you upon delivery to the carrier or upon
          confirmed delivery, as applicable under local law. Please inspect your package on arrival and report shipping
          damage promptly.
        </p>

        <h2>5. Returns</h2>
        <p>
          Eligible returns must be requested within the return window stated at purchase or on the product page, with the
          watch unused, unworn beyond try-on, and in original packaging with all tags and documentation. Watches showing
          wear, damage, or missing components may be refused. Refunds are issued to the original payment method after
          inspection. Shipping costs for returns may be the customer’s responsibility unless the item was defective or
          incorrectly sent.
        </p>

        <h2>6. Warranty</h2>
        <p>
          Timect provides a limited manufacturer warranty against defects in materials and workmanship under normal use for
          the period stated with your watch. The warranty does not cover:
        </p>
        <ul>
          <li>Damage from impact, misuse, or unauthorized repair</li>
          <li>Water damage if seals were compromised or ratings exceeded</li>
          <li>Normal wear of straps, bracelets, plating, or finishes</li>
          <li>Battery life after the initial coverage period (quartz models)</li>
          <li>Loss or theft</li>
        </ul>
        <p>Warranty service must be arranged through Timect or an authorized service partner. Keep your proof of purchase.</p>

        <h2>7. Intellectual property</h2>
        <p>
          All content on this website — including the Timect name, logos, product photography, dial designs, and copy — is
          owned by Timect or its licensors. You may not copy, reproduce, or use our materials for commercial purposes
          without prior written consent.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Timect is not liable for indirect, incidental, or consequential damages
          arising from use of the website or products. Our total liability related to any order is limited to the amount
          you paid for the product in that order. Nothing in these terms excludes liability that cannot be excluded under
          applicable law.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may update these Terms &amp; Conditions from time to time. The “Last updated” date at the top of this page will
          reflect the latest revision. Continued use of the site after changes constitutes acceptance of the updated terms.
        </p>

        <h2>10. Contact</h2>
        <p>
          For questions about these terms, visit <Link href="/contact">Contact Us</Link> or email care@timect.com.
        </p>
      </div>
    </ContentPage>
  );
}
