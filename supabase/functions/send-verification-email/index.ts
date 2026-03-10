import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationEmailRequest {
  email: string;
  userName?: string;
  redirectTo?: string;
}

const getEmailTemplate = (userName: string, verificationUrl: string) => `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Himsols Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 560px; max-width: 100%; border-collapse: collapse;">
          
          <!-- Logo -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <img src="https://jwozuiznphqhiyctiixm.supabase.co/storage/v1/object/public/email-assets/himsols-logo.png" alt="Himsols Logo" width="48" height="48" style="display: inline-block; vertical-align: middle;" />
              <p style="font-size: 20px; font-weight: bold; color: #2e8b57; margin: 8px 0 0; text-align: center;">HIMSOLS</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td>
              <h1 style="font-size: 24px; font-weight: bold; color: #1a3a2a; margin: 0 0 16px;">नमस्ते ${userName}! 🙏</h1>
              
              <p style="font-size: 15px; color: #5a7a6a; line-height: 1.7; margin: 0 0 20px;">
                Himsols परिवार में आपका स्वागत है! हम खुश हैं कि आप हमारे साथ पर्यावरण को बेहतर बनाने के मिशन में जुड़ रहे हैं।
              </p>
              
              <p style="font-size: 15px; color: #5a7a6a; line-height: 1.7; margin: 0 0 20px;">
                अपना email verify करने के लिए नीचे दिए button पर click करें:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background-color: #2e8b57; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      ✓ Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 13px; color: #5a7a6a; margin: 24px 0 0;">
                ⚠️ यह link 24 घंटे में expire हो जाएगा।
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 24px 0;">
              <hr style="border: none; border-top: 1px solid #e0ece5; margin: 0;" />
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="text-align: center;">
              <p style="font-size: 14px; font-weight: 600; color: #2e8b57; margin: 0 0 8px;">
                🌳 Together, let's plant a greener future!
              </p>
              <p style="font-size: 12px; color: #999999; margin: 0;">
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, redirectTo }: VerificationEmailRequest = await req.json();

    if (!email) {
      throw new Error("Missing required field: email");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const displayName = userName || "User";

    // Use Supabase Admin API to generate a proper verification link
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: redirectTo || 'https://himsols.com/',
      },
    });

    if (linkError) {
      console.error("Error generating verification link:", linkError);
      throw new Error(`Failed to generate verification link: ${linkError.message}`);
    }

    // The generated link contains the proper token
    const verificationUrl = linkData?.properties?.action_link;
    
    if (!verificationUrl) {
      throw new Error("No verification URL generated");
    }

    console.log("Generated verification URL for:", email);

    // Send email using Resend REST API
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
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email via Resend");
    }

    console.log("Verification email sent successfully via Resend:", result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
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
