import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Terms of Service - Himsols"
        description="Read the Terms of Service for Himsols. Understand the rules and guidelines for using our tree plantation, marketplace, and environmental services."
        url="https://himsols.online/terms"
      />
      <Navbar />

      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: February 2026</p>

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the Himsols platform (website, mobile app, or any related services), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. About Himsols</h2>
              <p className="text-muted-foreground leading-relaxed">
                Himsols is a community-driven environmental initiative based in Himachal Pradesh, India. We facilitate tree plantation, eco-friendly product marketplace, waste management, and campaign-based fundraising to support local farmers and promote sustainability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>You must provide accurate and complete information during registration.</li>
                <li>Each user is allowed one account. Multiple accounts using the same phone number or email are not permitted.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>Email verification is mandatory before account activation.</li>
                <li>Himsols reserves the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Tree Plantation Services</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Tree plantation orders are treated as requests/leads. Fulfillment depends on seasonal availability, location feasibility, and farmer coordination.</li>
                <li>Upon successful plantation, photo proof with GPS data and a digital certificate will be provided.</li>
                <li>Himsols does not guarantee specific planting timelines, as these depend on weather and local conditions.</li>
                <li>Tree species may be substituted based on ecological suitability and availability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Marketplace</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Products listed on the Himsols Marketplace are sourced from local farmers and artisans in Himachal Pradesh.</li>
                <li>Product images are representative. Natural products may vary slightly in appearance.</li>
                <li>Delivery timelines are estimates and may vary based on location and availability.</li>
                <li>Strict no-returns and no-refunds policy applies to all marketplace purchases due to the rural-to-urban supply chain nature.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Campaigns & Donations</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Donations made to campaigns are voluntary and non-refundable.</li>
                <li>Campaign funds are used exclusively for the stated campaign purpose.</li>
                <li>Donation certificates are generated for successful contributions.</li>
                <li>Both direct payments (Razorpay) and wallet balance can be used for donations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Gift Cards</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Gift cards are valid for 1 year from the date of purchase.</li>
                <li>Gift cards can be redeemed for campaign donations or converted to wallet credit.</li>
                <li>Gift cards are non-transferable for cash and cannot be exchanged for money.</li>
                <li>Expired or fully redeemed gift cards cannot be restored.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Wallet & Referral Program</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Wallet balance can be used for marketplace purchases and campaign donations.</li>
                <li>Referral bonuses are credited upon successful signup and email verification of the referred user.</li>
                <li>Himsols reserves the right to modify or discontinue the referral program at any time.</li>
                <li>Any abuse of the referral system (fake accounts, multiple accounts) will result in account suspension and forfeiture of wallet balance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. Payments</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>All payments are processed securely through Razorpay, a PCI-DSS compliant payment gateway.</li>
                <li>Himsols does not store your card or banking details.</li>
                <li>All prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">10. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on the Himsols platform — including logos, text, images, and design — is the intellectual property of Himsols. Unauthorized reproduction, distribution, or use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">11. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Himsols shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the amount paid by the user for the specific service in question.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Himachal Pradesh, India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Himsols reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">14. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these terms, please contact us at{" "}
                <a href="/contact" className="text-primary hover:underline">our Contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
