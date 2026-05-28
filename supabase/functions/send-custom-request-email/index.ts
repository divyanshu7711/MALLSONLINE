import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CustomRequestPayload {
  userName: string;
  userEmail: string;
  storeName: string;
  productName?: string;
  description: string;
  imageUrl?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: CustomRequestPayload = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = "divyanshu.7711@gmail.com";

    if (!RESEND_API_KEY) {
      // If no Resend key configured, just log and return success
      console.log("No RESEND_API_KEY configured. Custom request received:", payload);
      return new Response(
        JSON.stringify({ message: "Request received (email notification skipped - no API key)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e, #06b6d4); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Custom Request</h1>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #374151; margin-bottom: 16px;">A customer has submitted a custom product request:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Customer:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${payload.userName} (${payload.userEmail})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Store:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${payload.storeName}</td>
            </tr>
            ${payload.productName ? `<tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Product:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600;">${payload.productName}</td>
            </tr>` : ''}
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 14px; margin: 0 0 4px 0; font-weight: 600;">Description:</p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">${payload.description}</p>
          </div>
          ${payload.imageUrl ? `<div style="margin-top: 16px;">
            <p style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Reference Image:</p>
            <img src="${payload.imageUrl}" style="max-width: 100%; border-radius: 8px;" alt="Reference" />
          </div>` : ''}
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://your-app-url.com/admin/custom-requests" style="background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View in Admin Panel</a>
          </div>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MarketHub <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `New Custom Request from ${payload.userName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend API error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Email notification sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
