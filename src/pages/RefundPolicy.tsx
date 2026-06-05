import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AlertTriangle } from "lucide-react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Refund & Cancellation Policy - Himsols"
        description="Understand Himsols' refund and cancellation policy for tree plantation orders, marketplace purchases, donations, and gift cards."
        url="https://himsols.com/refund-policy"
      />
      <Navbar />

      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: February 2026</p>

          {/* Important Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-8">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Please read this policy carefully before making any purchase or donation on Himsols. By using our services, you agree to the terms outlined below.
            </p>
          </div>

          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Tree Plantation Orders</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li><strong>Cancellation:</strong> Orders can be cancelled before the plantation process begins (status: "pending" or "site_verified"). Contact us immediately if you wish to cancel.</li>
                <li><strong>Refund:</strong> If cancelled before plantation, a full refund will be processed within 7-10 business days to the original payment method.</li>
                <li><strong>No Refund After Plantation:</strong> Once saplings have been arranged or plantation has started, refunds are not possible as resources have already been committed.</li>
                <li><strong>Failed Plantation:</strong> In rare cases where plantation fails due to natural causes, Himsols will replant at no additional cost.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Marketplace Purchases</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li><strong>No Returns:</strong> Due to the nature of our products (fresh farm produce, perishables, handmade items) and the rural-to-urban supply chain, we follow a strict no-returns policy.</li>
                <li><strong>No Refunds:</strong> All marketplace sales are final. Refunds are not offered for marketplace purchases.</li>
                <li><strong>Damaged/Wrong Items:</strong> If you receive a damaged or incorrect item, contact us within 24 hours of delivery with photo evidence. We will arrange a replacement or store credit at our discretion.</li>
                <li><strong>Non-Delivery:</strong> If your order is not delivered within the estimated timeline + 5 additional days, contact us for resolution. A replacement or wallet credit will be provided.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Donations</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>All donations are voluntary and <strong>non-refundable</strong>.</li>
                <li>This applies to both direct payments and wallet-based donations.</li>
                <li>Donation certificates are provided as acknowledgment and cannot be used to claim refunds.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Gift Cards</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Gift card purchases are <strong>non-refundable</strong>.</li>
                <li>Gift cards cannot be exchanged for cash.</li>
                <li>Expired gift cards will not be refunded or extended.</li>
                <li>If a gift card was purchased but not yet shared/used, contact us within 48 hours for possible resolution.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Wallet Balance</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Wallet top-ups are <strong>non-refundable</strong>.</li>
                <li>Wallet balance cannot be withdrawn as cash.</li>
                <li>Referral and signup bonuses are promotional credits and are non-refundable.</li>
                <li>In case of account termination due to policy violations, wallet balance may be forfeited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Payment Failures</h2>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>If a payment is deducted but the transaction fails, the amount will be automatically refunded by Razorpay within 5-7 business days.</li>
                <li>If the refund is not received within this timeframe, contact us with your transaction ID.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. How to Request a Refund</h2>
              <p className="text-muted-foreground leading-relaxed">
                For eligible refund requests, please contact us through our{" "}
                <a href="/contact" className="text-primary hover:underline">Contact page</a> with:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li>Your registered email or phone number</li>
                <li>Order ID or transaction reference</li>
                <li>Reason for the refund request</li>
                <li>Supporting evidence (if applicable)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                We aim to respond to all refund requests within 48 hours.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
