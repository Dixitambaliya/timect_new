import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/site/ContentPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Timect collects, uses, and protects personal information when you shop for or inquire about our wristwatches.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="This policy explains how Timect handles personal information when you visit our website, place an order, or contact us about our watches."
    >
      <div className="rte">
        <p className="!text-[14px] text-muted">Last updated: July 2026</p>

        <h2>1. Who we are</h2>
        <p>
          Timect (“we”, “us”) manufactures and sells wristwatches through our official online store and authorized
          channels. This Privacy Policy applies to information collected via our website and related customer-care
          communications.
        </p>

        <h2>2. Information we collect</h2>
        <p>We may collect:</p>
        <ul>
          <li>
            <strong>Identity &amp; contact data</strong> — name, email address, phone number, and shipping or billing
            address when you order or contact us.
          </li>
          <li>
            <strong>Order data</strong> — products purchased, order history, and payment status (payment card details are
            processed by our payment providers; we do not store full card numbers).
          </li>
          <li>
            <strong>Service data</strong> — model information, serial or case references, and issue descriptions when you
            request warranty or repair support.
          </li>
          <li>
            <strong>Technical data</strong> — browser type, device information, and approximate location derived from IP
            address, collected automatically when you browse our site.
          </li>
        </ul>

        <h2>3. How we use your information</h2>
        <ul>
          <li>To process and deliver watch orders.</li>
          <li>To provide customer care, warranty, and after-sales service.</li>
          <li>To improve our website, product pages, and manufacturing feedback loops.</li>
          <li>To send order updates and, where permitted, product news.</li>
          <li>To meet legal, tax, and accounting obligations.</li>
        </ul>

        <h2>4. Sharing of information</h2>
        <p>
          We share personal data only with trusted service providers who help us operate the store — for example payment
          processors, shipping carriers, hosting providers, and authorized service partners. We do not sell your personal
          information. We may disclose data when required by law or to protect our rights and customers.
        </p>

        <h2>5. Cookies &amp; similar technologies</h2>
        <p>
          Our site may use essential cookies to keep the shop functioning (cart, session security) and optional analytics
          cookies to understand how visitors browse collections. You can control cookies through your browser settings.
        </p>

        <h2>6. Data retention &amp; security</h2>
        <p>
          We retain order and service records for as long as needed for warranty support, legal compliance, and legitimate
          business purposes. We apply reasonable technical and organizational measures to protect personal data against
          unauthorized access, loss, or misuse.
        </p>

        <h2>7. Your rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or restrict processing of your
          personal data, and to object to certain uses. To exercise these rights, contact us at{" "}
          <a href="mailto:care@timect.com">care@timect.com</a>.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions about this policy or your data can be sent via our <Link href="/contact">Contact Us</Link> page or by
          emailing care@timect.com.
        </p>
      </div>
    </ContentPage>
  );
}
