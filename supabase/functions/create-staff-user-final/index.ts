/* eslint-disable import/no-unresolved */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface CreateStaffRequest {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  permissions?: Record<string, boolean>;
}

interface CreateStaffResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    temporaryPassword: string;
  };
  error?: string;
  message?: string;
}

// Generate secure random password
function generateRandomPassword(length: number = 16): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!';
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed',
        } as CreateStaffResponse),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required environment variables',
        } as CreateStaffResponse),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      email,
      role,
      firstName,
      lastName,
      phoneNumber,
      permissions = {},
    }: CreateStaffRequest = await req.json();

    // Validate required fields
    if (!email || !role) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: email, role',
        } as CreateStaffResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Validate staff roles
    const staffRoles = [
      'tourism_admin',
      'business_listing_manager',
      'tourism_content_manager',
      'business_registration_manager',
    ];

    if (!staffRoles.includes(role)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid staff role specified',
        } as CreateStaffResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to check existing users: ${checkError.message}`,
        } as CreateStaffResponse),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'A user with this email address already exists',
        } as CreateStaffResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Generate secure random password
    const randomPassword = generateRandomPassword();

    // Create the user using admin API
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm email since admin is creating
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: role,
          phone_number: phoneNumber,
          created_by: 'admin',
        },
        app_metadata: {
          user_role: role,
        },
      });

    if (authError || !authUser.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create user: ${authError?.message || 'Unknown error'}`,
        } as CreateStaffResponse),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const userId = authUser.user.id;

    // Wait for the trigger to create the profile, then update it with staff role
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Update the profile with the correct staff role and details
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        phone_number: phoneNumber || null,
        role: role, // Override the default 'tourist' role set by the trigger
        is_verified: true, // Staff members are auto-verified
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileUpdateError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to update profile: ${profileUpdateError.message}`,
        } as CreateStaffResponse),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Create staff permissions if provided
    if (Object.keys(permissions).length > 0) {
      const { error: permissionsError } = await supabase
        .from('staff_permissions')
        .insert({
          profile_id: userId,
          ...permissions,
        });

      if (permissionsError) {
        console.warn('Failed to create staff permissions:', permissionsError);
        // Don't fail here as the staff member was created successfully
      }
    }

    // Send credentials email
    try {
      const { error: emailError } = await supabase.functions.invoke(
        'send-staff-credentials',
        {
          body: {
            email: email,
            temporaryPassword: randomPassword,
            firstName: firstName,
            lastName: lastName,
            role: role,
          },
        }
      );

      if (emailError) {
        console.warn('Failed to send credentials email:', emailError);
      }
    } catch (emailError) {
      console.warn('Error sending credentials email:', emailError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: email,
          role: role,
          firstName: firstName,
          lastName: lastName,
          temporaryPassword: randomPassword,
        },
        message: `Staff member created successfully! Login credentials have been sent to ${email}.`,
      } as CreateStaffResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Edge Function error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: (error as Error).message,
      } as CreateStaffResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
