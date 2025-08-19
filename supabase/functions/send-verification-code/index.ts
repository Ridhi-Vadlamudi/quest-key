import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  type: 'signup' | 'login';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type }: VerificationRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code in database
    const { error: insertError } = await supabase
      .from("verification_codes")
      .insert({
        email,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    // Send email with only the code
    const emailSubject = type === 'signup' 
      ? "Welcome to StudyHelp - Verify Your Account" 
      : "StudyHelp Login Code";
    
    const emailContent = type === 'signup'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">StudyHelp</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">AI-Powered Learning</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to StudyHelp!</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Enter this verification code to complete your account setup:
          </p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            This code expires in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px;">StudyHelp - Transform your learning with AI</p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">StudyHelp</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">AI-Powered Learning</p>
          </div>
          
          <h2 style="color: #1f2937; margin-bottom: 20px;">Login to StudyHelp</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
            Enter this code to sign in to your account:
          </p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            This code expires in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px;">StudyHelp - Transform your learning with AI</p>
          </div>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "StudyHelp <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailContent,
    });

    console.log("Verification code sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);