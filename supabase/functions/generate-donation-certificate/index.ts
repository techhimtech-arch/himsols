import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { donationId } = await req.json();
    
    if (!donationId) {
      return new Response(
        JSON.stringify({ error: "Donation ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch donation with campaign info
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select("id, amount, donor_name, donor_email, created_at, campaign_id, payment_mode, payment_status, user_id, campaigns(title)")
      .eq("id", donationId)
      .single();

    if (donationError || !donation) {
      return new Response(
        JSON.stringify({ error: "Donation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (donation.payment_status !== "SUCCESS") {
      return new Response(
        JSON.stringify({ error: "Certificate only available for successful donations" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientName = donation.donor_name || "Valued Contributor";
    const campaignTitle = (donation as any).campaigns?.title || "Green Campaign";
    const donationDate = new Date(donation.created_at);
    const formattedDate = donationDate.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

    const year = donationDate.getFullYear();
    const certNumber = donation.id.slice(0, 4).toUpperCase();
    const certificateId = `DON-${year}-${certNumber}`;

    // Create PDF - A4 Landscape
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const primaryGreen = rgb(0.086, 0.639, 0.290);
    const darkGreen = rgb(0.047, 0.431, 0.176);
    const textColor = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.5, 0.5, 0.5);

    const margin = 30;

    // Borders
    page.drawRectangle({
      x: margin, y: margin,
      width: width - margin * 2, height: height - margin * 2,
      borderColor: primaryGreen, borderWidth: 4,
    });
    page.drawRectangle({
      x: margin + 10, y: margin + 10,
      width: width - margin * 2 - 20, height: height - margin * 2 - 20,
      borderColor: primaryGreen, borderWidth: 1,
    });

    // Title
    const hindiTitle = "Praman Patra";
    page.drawText(hindiTitle, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(hindiTitle, 28) / 2,
      y: height - 80, size: 28, font: helveticaBold, color: primaryGreen,
    });

    const englishTitle = "CERTIFICATE OF APPRECIATION";
    page.drawText(englishTitle, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(englishTitle, 24) / 2,
      y: height - 115, size: 24, font: helveticaBold, color: darkGreen,
    });

    const orgName = "HIMSOLS - Himachal's Green Digital Initiative";
    page.drawText(orgName, {
      x: width / 2 - helvetica.widthOfTextAtSize(orgName, 12) / 2,
      y: height - 140, size: 12, font: helvetica, color: lightGray,
    });

    page.drawLine({
      start: { x: width / 2 - 150, y: height - 155 },
      end: { x: width / 2 + 150, y: height - 155 },
      thickness: 1, color: primaryGreen,
    });

    // Presented to
    const presentedTo = "This Certificate is Proudly Presented To";
    page.drawText(presentedTo, {
      x: width / 2 - timesItalic.widthOfTextAtSize(presentedTo, 14) / 2,
      y: height - 190, size: 14, font: timesItalic, color: textColor,
    });

    // Name
    page.drawText(recipientName, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(recipientName, 36) / 2,
      y: height - 240, size: 36, font: helveticaBold, color: darkGreen,
    });

    const nameWidth = helveticaBold.widthOfTextAtSize(recipientName, 36);
    page.drawLine({
      start: { x: width / 2 - nameWidth / 2 - 20, y: height - 250 },
      end: { x: width / 2 + nameWidth / 2 + 20, y: height - 250 },
      thickness: 2, color: primaryGreen,
    });

    // Appreciation text
    const line1 = "for your generous contribution towards protecting and nurturing our environment";
    page.drawText(line1, {
      x: width / 2 - timesRoman.widthOfTextAtSize(line1, 13) / 2,
      y: height - 290, size: 13, font: timesRoman, color: textColor,
    });

    const line2 = `through the "${campaignTitle}" campaign.`;
    page.drawText(line2, {
      x: width / 2 - timesRoman.widthOfTextAtSize(line2, 13) / 2,
      y: height - 310, size: 13, font: timesRoman, color: textColor,
    });

    // Donation amount
    const amountText = `Donation Amount: Rs. ${Number(donation.amount).toLocaleString("en-IN")}`;
    page.drawText(amountText, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(amountText, 16) / 2,
      y: height - 350, size: 16, font: helveticaBold, color: primaryGreen,
    });

    const modeText = donation.payment_mode === "GIFT_CARD" 
      ? "Contributed via Green Gift Card" 
      : "Direct Contribution";
    page.drawText(modeText, {
      x: width / 2 - timesItalic.widthOfTextAtSize(modeText, 12) / 2,
      y: height - 370, size: 12, font: timesItalic, color: lightGray,
    });

    // Quote box
    const quoteBoxY = height - 420;
    page.drawRectangle({
      x: width / 2 - 200, y: quoteBoxY - 10,
      width: 400, height: 40,
      color: rgb(0.95, 0.98, 0.95), borderColor: primaryGreen, borderWidth: 1,
    });

    const quote = '"One Tree Today, A Greener Tomorrow."';
    page.drawText(quote, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(quote, 14) / 2,
      y: quoteBoxY + 8, size: 14, font: helveticaBold, color: primaryGreen,
    });

    // Green Warrior text
    const gwText = "We thank you for being a Green Warrior and congratulate you on becoming an inspiration for others.";
    page.drawText(gwText, {
      x: width / 2 - timesRoman.widthOfTextAtSize(gwText, 11) / 2,
      y: height - 465, size: 11, font: timesRoman, color: textColor,
    });

    // Footer
    const footerY = 70;
    page.drawText(`Certificate ID: ${certificateId}`, {
      x: margin + 30, y: footerY, size: 9, font: helvetica, color: lightGray,
    });
    page.drawText(`Donation: #${donation.id.slice(0, 8).toUpperCase()}`, {
      x: margin + 30, y: footerY - 15, size: 9, font: helvetica, color: lightGray,
    });
    page.drawText(`Date: ${formattedDate}`, {
      x: width - margin - 150, y: footerY, size: 9, font: helvetica, color: lightGray,
    });

    // Signature
    page.drawLine({
      start: { x: width - margin - 180, y: footerY + 40 },
      end: { x: width - margin - 30, y: footerY + 40 },
      thickness: 1, color: textColor,
    });
    page.drawText("Authorized Signature", {
      x: width - margin - 145, y: footerY + 25, size: 9, font: helvetica, color: lightGray,
    });
    page.drawText("HIMSOLS", {
      x: width - margin - 115, y: footerY + 50, size: 10, font: helveticaBold, color: primaryGreen,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="HIMSOLS-Donation-Certificate-${certificateId}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Certificate generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate certificate";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
