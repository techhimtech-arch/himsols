import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    
    const isAdmin = !!roleData;

    // Fetch order with user profile
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        quantity,
        status,
        total_price,
        created_at,
        updated_at,
        user_id,
        delivery_location,
        tree:trees(name)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authorization check - user can only access their own orders unless admin
    if (!isAdmin && order.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow certificate for completed orders
    if (order.status !== "completed") {
      return new Response(
        JSON.stringify({ error: "Certificate only available for completed orders" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", order.user_id)
      .single();

    const recipientName = profile?.full_name || "Valued Customer";
    const treeCount = order.quantity;
    const completionDate = new Date(order.updated_at);
    const formattedDate = completionDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Generate Certificate ID
    const year = completionDate.getFullYear();
    const certNumber = order.id.slice(0, 4).toUpperCase();
    const certificateId = `CERT-${year}-${certNumber}`;

    // Log certificate generation
    console.log(`Generating certificate: ${certificateId} for order: ${orderId} by user: ${user.id}`);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Colors
    const primaryGreen = rgb(0.086, 0.639, 0.290); // #16A34A
    const darkGreen = rgb(0.047, 0.431, 0.176);
    const textColor = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.5, 0.5, 0.5);

    // Draw border
    const borderWidth = 4;
    const margin = 30;
    
    // Outer border
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderColor: primaryGreen,
      borderWidth: borderWidth,
    });

    // Inner decorative border
    page.drawRectangle({
      x: margin + 10,
      y: margin + 10,
      width: width - margin * 2 - 20,
      height: height - margin * 2 - 20,
      borderColor: primaryGreen,
      borderWidth: 1,
    });

    // Title - Hindi
    const hindiTitle = "Praman Patra";
    page.drawText(hindiTitle, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(hindiTitle, 28) / 2,
      y: height - 80,
      size: 28,
      font: helveticaBold,
      color: primaryGreen,
    });

    // Title - English
    const englishTitle = "CERTIFICATE OF APPRECIATION";
    page.drawText(englishTitle, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(englishTitle, 24) / 2,
      y: height - 115,
      size: 24,
      font: helveticaBold,
      color: darkGreen,
    });

    // Organization name
    const orgName = "HIMSOLS - Himachal's Green Digital Initiative";
    page.drawText(orgName, {
      x: width / 2 - helvetica.widthOfTextAtSize(orgName, 12) / 2,
      y: height - 140,
      size: 12,
      font: helvetica,
      color: lightGray,
    });

    // Decorative line
    page.drawLine({
      start: { x: width / 2 - 150, y: height - 155 },
      end: { x: width / 2 + 150, y: height - 155 },
      thickness: 1,
      color: primaryGreen,
    });

    // Presented to text
    const presentedTo = "This Certificate is Proudly Presented To";
    page.drawText(presentedTo, {
      x: width / 2 - timesItalic.widthOfTextAtSize(presentedTo, 14) / 2,
      y: height - 190,
      size: 14,
      font: timesItalic,
      color: textColor,
    });

    // Recipient Name
    page.drawText(recipientName, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(recipientName, 36) / 2,
      y: height - 240,
      size: 36,
      font: helveticaBold,
      color: darkGreen,
    });

    // Underline for name
    const nameWidth = helveticaBold.widthOfTextAtSize(recipientName, 36);
    page.drawLine({
      start: { x: width / 2 - nameWidth / 2 - 20, y: height - 250 },
      end: { x: width / 2 + nameWidth / 2 + 20, y: height - 250 },
      thickness: 2,
      color: primaryGreen,
    });

    // Appreciation text
    const appreciationLine1 = "for your valuable contribution towards protecting and nurturing our environment";
    page.drawText(appreciationLine1, {
      x: width / 2 - timesRoman.widthOfTextAtSize(appreciationLine1, 13) / 2,
      y: height - 290,
      size: 13,
      font: timesRoman,
      color: textColor,
    });

    const appreciationLine2 = `through Tree Plantation Service.`;
    page.drawText(appreciationLine2, {
      x: width / 2 - timesRoman.widthOfTextAtSize(appreciationLine2, 13) / 2,
      y: height - 310,
      size: 13,
      font: timesRoman,
      color: textColor,
    });

    // Tree count highlight - show total trees without specific name
    const treeText = `You have gifted ${treeCount}+ Trees to Mother Earth.`;
    page.drawText(treeText, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(treeText, 14) / 2,
      y: height - 350,
      size: 14,
      font: helveticaBold,
      color: primaryGreen,
    });

    const contributionText = "Your contribution to environmental conservation is invaluable. Your effort is commendable!";
    page.drawText(contributionText, {
      x: width / 2 - timesRoman.widthOfTextAtSize(contributionText, 12) / 2,
      y: height - 375,
      size: 12,
      font: timesRoman,
      color: textColor,
    });

    // Quote box
    const quoteBoxY = height - 430;
    page.drawRectangle({
      x: width / 2 - 200,
      y: quoteBoxY - 10,
      width: 400,
      height: 40,
      color: rgb(0.95, 0.98, 0.95),
      borderColor: primaryGreen,
      borderWidth: 1,
    });

    const quote = '"One Tree Today, A Greener Tomorrow."';
    page.drawText(quote, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(quote, 14) / 2,
      y: quoteBoxY + 8,
      size: 14,
      font: helveticaBold,
      color: primaryGreen,
    });

    const quoteHindi = "Aaj ek ped, kal hara bhavishya";
    page.drawText(quoteHindi, {
      x: width / 2 - timesItalic.widthOfTextAtSize(quoteHindi, 10) / 2,
      y: quoteBoxY - 5,
      size: 10,
      font: timesItalic,
      color: lightGray,
    });

    // Green Warrior text
    const greenWarriorText = "We thank you for being a Green Warrior and congratulate you on becoming an inspiration for others.";
    page.drawText(greenWarriorText, {
      x: width / 2 - timesRoman.widthOfTextAtSize(greenWarriorText, 11) / 2,
      y: height - 475,
      size: 11,
      font: timesRoman,
      color: textColor,
    });

    // Footer info
    const footerY = 70;
    
    // Certificate ID
    page.drawText(`Certificate ID: ${certificateId}`, {
      x: margin + 30,
      y: footerY,
      size: 9,
      font: helvetica,
      color: lightGray,
    });

    // Order ID
    page.drawText(`Order: #${order.id.slice(0, 8).toUpperCase()}`, {
      x: margin + 30,
      y: footerY - 15,
      size: 9,
      font: helvetica,
      color: lightGray,
    });

    // Date
    page.drawText(`Date: ${formattedDate}`, {
      x: width - margin - 150,
      y: footerY,
      size: 9,
      font: helvetica,
      color: lightGray,
    });

    // Signature placeholder
    page.drawLine({
      start: { x: width - margin - 180, y: footerY + 40 },
      end: { x: width - margin - 30, y: footerY + 40 },
      thickness: 1,
      color: textColor,
    });

    page.drawText("Authorized Signature", {
      x: width - margin - 145,
      y: footerY + 25,
      size: 9,
      font: helvetica,
      color: lightGray,
    });

    page.drawText("HIMSOLS", {
      x: width - margin - 115,
      y: footerY + 50,
      size: 10,
      font: helveticaBold,
      color: primaryGreen,
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    console.log(`Certificate generated successfully: ${certificateId}`);

    // Return PDF
    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="HIMSOLS-Certificate-${certificateId}.pdf"`,
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
