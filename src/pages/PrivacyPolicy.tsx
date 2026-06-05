import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Privacy Policy - Himsols"
        description="Learn how Himsols collects, uses, and protects your personal information. Your privacy and data security are our priority."
        url="https://himsols.com/privacy"
      />
      <Navbar />

      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: February 2026</p>

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">We collect the following information when you use our platform:</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number provided during registration.</li>
                <li><strong>Transaction Data:</strong> Payment details processed by Razorpay (we do not store card/bank details), order history, donation records.</li>
                <li><strong>Location Data:</strong> Delivery addresses, district, and state for order fulfillment.</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns to improve our services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>To create and manage your account.</li>
                <li>To process orders, donations, and gift card transactions.</li>
                <li>To generate certificates for tree plantations and donations.</li>
                <li>To communicate updates about your orders, campaigns, and services.</li>
                <li>To prevent fraud and abuse of referral/wallet systems.</li>
                <li>To improve our platform and user experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Data Security</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>All data is stored securely with industry-standard encryption.</li>
                <li>Payments are processed through Razorpay, a PCI-DSS Level 1 compliant gateway.</li>
                <li>Access to user data is restricted to authorized personnel only.</li>
                <li>We use Row-Level Security (RLS) policies to ensure users can only access their own data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Data Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">We do not sell your personal information. We may share data only in these cases:</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li><strong>Payment Processing:</strong> Transaction data is shared with Razorpay for payment processing.</li>
                <li><strong>Order Fulfillment:</strong> Delivery address and name may be shared with local farmers/sellers for product delivery.</li>
                <li><strong>Legal Requirements:</strong> When required by Indian law or court order.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Cookies & Analytics</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies for authentication and session management. We may collect anonymous analytics data to understand platform usage patterns. No third-party advertising cookies are used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> You can view all your personal data from your Profile page.</li>
                <li><strong>Correction:</strong> You can update your name, email, and phone from your Profile.</li>
                <li><strong>Data Export:</strong> You can request a copy of your data by contacting us.</li>
                <li><strong>Account Deletion:</strong> You can request account deletion by contacting our support team.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal data for as long as your account is active or as needed to provide services. Transaction records and donation certificates are retained permanently for legal and audit purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this policy from time to time. We will notify registered users of significant changes via email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related questions or data requests, please reach out via our{" "}
                <a href="/contact" className="text-primary hover:underline">Contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
