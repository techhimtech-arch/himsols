import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Using Resend SDK directly from esm.sh
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationEmailRequest {
  email: string;
  userName: string;
  verificationUrl: string;
}

const getEmailTemplate = (userName: string, verificationUrl: string) => `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Himsols Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
              <div style="font-size: 48px; margin-bottom: 8px;">🌱</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">HIMSOLS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Planting Trees, Growing Hope</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px;">नमस्ते ${userName}! 🙏</h2>
              
              <p style="color: #4a4a4a; line-height: 1.8; margin: 0 0 24px 0; font-size: 16px;">
                Himsols परिवार में आपका स्वागत है! हम खुश हैं कि आप हमारे साथ पर्यावरण को बेहतर बनाने के मिशन में जुड़ रहे हैं।
              </p>
              
              <p style="color: #4a4a4a; line-height: 1.8; margin: 0 0 32px 0; font-size: 16px;">
                अपना account verify करने के लिए नीचे दिए button पर click करें:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);">
                      ✓ Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #888888; margin: 32px 0 16px 0; font-size: 14px; text-align: center;">
                या यह link copy करें:
              </p>
              
              <div style="background-color: #f8f8f8; padding: 16px; border-radius: 8px; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #22c55e; font-size: 13px; text-decoration: none;">
                  ${verificationUrl}
                </a>
              </div>
              
              <p style="color: #888888; margin: 24px 0 0 0; font-size: 13px;">
                ⚠️ यह link 24 घंटे में expire हो जाएगा।
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 24px 32px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="color: #22c55e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                🌳 Together, let's plant a greener future!
              </p>
              <p style="color: #888888; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Himsols | <a href="https://himsols.com/privacy" style="color: #888888;">Privacy Policy</a>
              </p>
              <p style="color: #aaaaaa; margin: 16px 0 0 0; font-size: 11px;">
                अगर आपने यह account नहीं बनाया है, तो कृपया इस email को ignore करें।
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, verificationUrl }: VerificationEmailRequest = await req.json();

    // Validate required fields
    if (!email || !verificationUrl) {
      throw new Error("Missing required fields: email and verificationUrl");
    }

    const displayName = userName || "User";

    // Send email using Resend REST API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Himsols <noreply@himsols.com>",
        to: [email],
        subject: "🌱 Himsols - Verify Your Email",
        html: getEmailTemplate(displayName, verificationUrl),
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Verification email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
