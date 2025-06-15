import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  const { method } = req;

  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { email, temporaryPassword, firstName, lastName, role } =
      await req.json();

    if (!email || !temporaryPassword) {
      return new Response(
        JSON.stringify({ error: 'Email and temporary password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const fullName =
      [firstName, lastName].filter(Boolean).join(' ') || 'Staff Member';
    const roleDisplay =
      role
        ?.replace(/_/g, ' ')
        ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Staff';

    // Email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NAGA VENTURE Tourism CMS</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background-color: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .password { font-family: monospace; font-size: 16px; font-weight: bold; color: #d32f2f; background-color: #fff; padding: 8px 12px; border-radius: 4px; border: 1px solid #ddd; display: inline-block; }
          .security-note { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏛️ NAGA VENTURE Tourism CMS</h1>
            <p>Welcome to the Team!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${fullName},</h2>
            
            <p>Your staff account has been created for the <strong>NAGA VENTURE Tourism Content Management System</strong>. You now have access to manage tourism content and help showcase the beauty of Naga City!</p>
            
            <div class="credentials">
              <h3>🔐 Login Credentials for: ${email}</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong><br>
                <span class="password">${temporaryPassword}</span>
              </p>
              <p><strong>Role:</strong> ${roleDisplay}</p>
            </div>
            
            <div class="security-note">
              <h3>🔒 Important Security Instructions:</h3>
              <ul>
                <li><strong>Change your password immediately</strong> after your first login</li>
                <li>Keep your credentials secure and do not share them with anyone</li>
                <li>If you suspect your account has been compromised, contact your administrator immediately</li>
                <li>Always log out when finished using the system</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8081'}" class="button">
                Access Tourism CMS
              </a>
            </p>
            
            <h3>🌟 What You Can Do:</h3>
            <ul>
              <li>Manage tourist spots and attractions</li>
              <li>Update business listings and information</li>
              <li>Handle content approval workflows</li>
              <li>Monitor tourism analytics and reports</li>
            </ul>
            
            <p>If you have any questions or need assistance getting started, please contact your administrator or the technical support team.</p>
            
            <p>Thank you for joining our mission to promote Naga City's tourism!</p>
            
            <p>Best regards,<br>
            <strong>NAGA VENTURE Tourism Team</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This email contains sensitive information. Please delete this email after noting your credentials.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Welcome to NAGA VENTURE Tourism CMS!

Hello ${fullName},

Your staff account has been created for the NAGA VENTURE Tourism Content Management System.

Login Credentials for: ${email}
- Email: ${email}
- Temporary Password: ${temporaryPassword}
- Role: ${roleDisplay}

IMPORTANT SECURITY INSTRUCTIONS:
- Change your password immediately after your first login
- Keep your credentials secure and do not share them
- Contact your administrator if you suspect your account has been compromised

Access the CMS at: ${Deno.env.get('SITE_URL') || 'http://localhost:8081'}

If you have any questions, please contact your administrator.

Best regards,
NAGA VENTURE Tourism Team

---
This email contains sensitive information. Please delete this email after noting your credentials.
    `;

    // Send email using Resend
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NAGA VENTURE CMS <onboarding@resend.dev>',
          to: ['mcpearsula@gmail.com'], // Temporary: send to verified email for testing
          subject: `Welcome to NAGA VENTURE Tourism CMS - Credentials for ${email}`,
          html: htmlContent,
          text: textContent,
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.text();
        console.error('Failed to send email:', error);
        
        // Log credentials for development/testing
        console.log('=== EMAIL DELIVERY FAILED - CREDENTIALS LOGGED ===');
        console.log('Original Recipient:', email);
        console.log('Temporary Password:', temporaryPassword);
        console.log('Role:', roleDisplay);
        console.log('================================================');
        
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to send email',
            details: error,
            credentials: {
              email,
              temporaryPassword,
              role: roleDisplay
            }
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      const emailResult = await emailResponse.json();
      console.log('Email sent successfully to mcpearsula@gmail.com for:', email);
      console.log('Credentials for', email, '- Password:', temporaryPassword);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Staff credentials email sent successfully to mcpearsula@gmail.com (for ${email})`,
          emailId: emailResult.id,
          credentials: {
            email,
            temporaryPassword,
            role: roleDisplay
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } else {
      // Fallback: Log email content for development
      console.log('=== STAFF CREDENTIALS EMAIL ===');
      console.log('To:', email);
      console.log('Password:', temporaryPassword);
      console.log('Content:', textContent);
      console.log('===============================');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email logged to console (development mode)',
          credentials: { email, temporaryPassword },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-staff-credentials:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to send staff credentials email',
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
              <li>Manage tourist spots and attractions</li>
              <li>Update business listings and information</li>
              <li>Handle content approval workflows</li>
              <li>Monitor tourism analytics and reports</li>
            </ul>
            
            <p>If you have any questions or need assistance getting started, please contact your administrator or the technical support team.</p>
            
            <p>Thank you for joining our mission to promote Naga City's tourism!</p>
            
            <p>Best regards,<br>
            <strong>NAGA VENTURE Tourism Team</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This email contains sensitive information. Please delete this email after noting your credentials.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Welcome to NAGA VENTURE Tourism CMS!

Hello ${fullName},

Your staff account has been created for the NAGA VENTURE Tourism Content Management System.

Login Credentials:
- Email: ${email}
- Temporary Password: ${temporaryPassword}
- Role: ${roleDisplay}

IMPORTANT SECURITY INSTRUCTIONS:
- Change your password immediately after your first login
- Keep your credentials secure and do not share them
- Contact your administrator if you suspect your account has been compromised

Access the CMS at: ${Deno.env.get('SITE_URL') || 'http://localhost:8081'}

If you have any questions, please contact your administrator.

Best regards,
NAGA VENTURE Tourism Team

---
This email contains sensitive information. Please delete this email after noting your credentials.
    `;    // Send email using Resend (you can also use SendGrid, Mailgun, etc.)
    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },        body: JSON.stringify({
          from: 'NAGA VENTURE CMS <onboarding@resend.dev>',
          to: ['mcpearsula@gmail.com'], // Temporary: send to verified email for testing
          subject: `Welcome to NAGA VENTURE Tourism CMS - Credentials for ${email}`,
          html: htmlContent,
          text: textContent,
        }),
        });

        if (!emailResponse.ok) {
          const error = await emailResponse.text();
          console.error('Failed to send email:', error);
          
          // Check if it's a domain verification error
          if (error.includes('validation_error') || error.includes('verify a domain')) {
            console.log('=== EMAIL DELIVERY FAILED - CREDENTIALS LOGGED ===');
            console.log('To:', email);
            console.log('Temporary Password:', temporaryPassword);
            console.log('Role:', roleDisplay);
            console.log('================================================');
            
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Email delivery failed (domain not verified), but credentials are logged in console',
                credentials: { email, temporaryPassword, role: roleDisplay },
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            );
          }
          
          throw new Error(`Failed to send email: ${error}`);
        }

        const emailResult = await emailResponse.json();
        console.log('Email sent successfully:', emailResult);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Staff credentials email sent successfully',
            emailId: emailResult.id,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        
        // Fallback: Log credentials for development/testing
        console.log('=== EMAIL DELIVERY FAILED - CREDENTIALS LOGGED ===');
        console.log('To:', email);
        console.log('Temporary Password:', temporaryPassword);
        console.log('Role:', roleDisplay);
        console.log('Error:', emailError.message);
        console.log('================================================');
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email delivery failed, but credentials are logged in console',
            credentials: { email, temporaryPassword, role: roleDisplay },
            error: emailError.message,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
          success: true,
          message: 'Staff credentials email sent successfully',
          emailId: emailResult.id,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } else {
      // Fallback: Log email content for development
      console.log('=== STAFF CREDENTIALS EMAIL ===');
      console.log('To:', email);
      console.log('Password:', temporaryPassword);
      console.log('Content:', textContent);
      console.log('===============================');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email logged to console (development mode)',
          credentials: { email, temporaryPassword },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-staff-credentials:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to send staff credentials email',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
