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

interface ResetEmailRequest {
  email: string;
  redirectTo: string;
}

const getEmailTemplate = (resetUrl: string) => `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Himsols Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 560px; max-width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <img src="https://jwozuiznphqhiyctiixm.supabase.co/storage/v1/object/public/email-assets/himsols-logo.png" alt="Himsols Logo" width="48" height="48" style="display: inline-block; vertical-align: middle;" />
              <p style="font-size: 20px; font-weight: bold; color: #2e8b57; margin: 8px 0 0; text-align: center;">HIMSOLS</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 24px;">
              <h1 style="font-size: 24px; font-weight: bold; color: #1a3a2a; margin: 0 0 16px;">Reset Your Password 🔐</h1>
              <p style="font-size: 15px; color: #5a7a6a; line-height: 1.7; margin: 0 0 20px;">
                हमें आपके Himsols account का password reset करने का request मिला है। नीचे दिए button पर click करके नया password set करें:
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${resetUrl}"
                       style="display: inline-block; background-color: #2e8b57; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 13px; color: #5a7a6a; margin: 24px 0 0;">
                ⚠️ यह link 1 घंटे में expire हो जाएगा। अगर button काम न करे, तो यह URL browser में paste करें:
              </p>
              <p style="font-size: 12px; color: #2e8b57; word-break: break-all; margin: 8px 0 0;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <hr style="border: none; border-top: 1px solid #e0ece5; margin: 0;" />
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <p style="font-size: 12px; color: #999999; margin: 0;">
                अगर आपने password reset request नहीं किया है, तो इस email को safely ignore कर दें। आपका password same रहेगा।
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
    const { email, redirectTo }: ResetEmailRequest = await req.json();

    if (!email) throw new Error("Missing required field: email");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Silently no-op for phone-placeholder emails so we don't leak account existence.
    if (email.endsWith("@phone.himsols.local")) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (linkError) {
      // Don't reveal whether email exists — return success either way.
      console.error("generateLink error:", linkError);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resetUrl = linkData?.properties?.action_link;
    if (!resetUrl) throw new Error("No reset URL generated");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Himsols <noreply@himsols.online>",
        to: [email],
        subject: "🔐 Reset Your Himsols Password",
        html: getEmailTemplate(resetUrl),
      }),
    });

    const result = await emailResponse.json();
    if (!emailResponse.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset-email:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
