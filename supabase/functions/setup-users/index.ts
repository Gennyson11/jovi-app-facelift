import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { action, email, password, role } = await req.json();
    console.log("Setup action:", action, "email:", email);

    if (action === "create_user") {
      // Create user
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        // User might already exist
        if (createError.message.includes("already been registered")) {
          // Get existing user
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = users?.find(u => u.email === email);
          
          if (existingUser) {
            // Update password
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
            
            // Check/add role
            const { data: existingRole } = await supabaseAdmin
              .from("user_roles")
              .select("*")
              .eq("user_id", existingUser.id)
              .maybeSingle();

            if (!existingRole) {
              await supabaseAdmin.from("user_roles").insert({
                user_id: existingUser.id,
                role: role,
              });
            }

            return new Response(
              JSON.stringify({ success: true, message: "User updated", userId: existingUser.id }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        throw createError;
      }

      // Add role
      if (userData.user) {
        await supabaseAdmin.from("user_roles").insert({
          user_id: userData.user.id,
          role: role,
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: "User created", userId: userData.user?.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Setup error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
