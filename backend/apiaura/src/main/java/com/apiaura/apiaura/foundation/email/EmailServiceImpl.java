package com.apiaura.apiaura.foundation.email;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@apiaura.com}")
    private String mailFrom;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("MMM dd, yyyy HH:mm 'UTC'")
            .withZone(ZoneId.of("UTC"));

    @Override
    public void sendOrganizationInvitation(
            String toEmail,
            String organizationName,
            String roleName,
            String inviterName,
            String inviteUrl,
            Instant expiresAt
    ) {
        String formattedExpiry = expiresAt != null ? DATE_FORMATTER.format(expiresAt) : "7 days";

        if (!mailEnabled || mailSender == null) {
            log.info("[SMTP DISABLED / SIMULATION] Organization invitation for {} -> {} as {} (invited by {}). Acceptance URL: {}",
                    organizationName, toEmail, roleName, inviterName, inviteUrl);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(mailFrom, "ApiAura Platform");
            helper.setTo(toEmail.trim());
            helper.setSubject("You've been invited to join " + organizationName + " on ApiAura");

            String htmlBody = buildInvitationHtml(organizationName, roleName, inviterName, inviteUrl, formattedExpiry);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);
            log.info("Invitation email successfully dispatched to {} for organization {}", toEmail, organizationName);

        } catch (Exception ex) {
            log.warn("Failed to dispatch SMTP invitation email to {}: {}. Direct invite URL fallback: {}",
                    toEmail, ex.getMessage(), inviteUrl);
        }
    }

    @Override
    public void sendPasswordResetEmail(
            String toEmail,
            String userName,
            String resetUrl,
            Instant expiresAt
    ) {
        String formattedExpiry = expiresAt != null ? DATE_FORMATTER.format(expiresAt) : "1 hour";

        if (!mailEnabled || mailSender == null) {
            log.info("[SMTP DISABLED / SIMULATION] Password reset request for {} (user: {}). Secure Reset URL: {}",
                    toEmail, userName, resetUrl);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(mailFrom, "ApiAura Platform");
            helper.setTo(toEmail.trim());
            helper.setSubject("Reset your ApiAura password");

            String htmlBody = buildPasswordResetHtml(userName, resetUrl, formattedExpiry);
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);
            log.info("Password reset email successfully dispatched to {}", toEmail);

        } catch (Exception ex) {
            log.warn("Failed to dispatch password reset email to {}: {}. Direct reset URL fallback: {}",
                    toEmail, ex.getMessage(), resetUrl);
        }
    }

    private String buildPasswordResetHtml(
            String userName,
            String resetUrl,
            String expiryDate
    ) {
        String greetingName = (userName != null && !userName.isBlank()) ? userName : "User";
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your ApiAura password</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
                .wrapper { max-width: 580px; margin: 40px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .header { background: linear-gradient(135deg, #ea580c 0%%, #c2410c 100%%); padding: 32px 24px; text-align: center; }
                .logo-text { font-size: 26px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; margin: 0; text-transform: uppercase; }
                .tagline { color: #fed7aa; font-size: 13px; margin-top: 4px; }
                .content { padding: 32px 30px; }
                .heading { font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 16px; }
                .lead { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
                .btn-container { text-align: center; margin: 32px 0 24px 0; }
                .btn { display: inline-block; background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); color: #ffffff !important; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4); }
                .btn:hover { background: #ea580c; }
                .fallback-link { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; line-height: 1.5; }
                .fallback-link a { color: #f97316; }
                .footer { border-top: 1px solid #1f2937; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; background-color: #0d131f; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <h1 class="logo-text">ApiAura</h1>
                  <div class="tagline">AI-Native API Collaboration & Testing Platform</div>
                </div>
                <div class="content">
                  <h2 class="heading">Password Reset Request</h2>
                  <p class="lead">
                    Hello %s,<br>
                    We received a request to reset your ApiAura account password. Click the button below to choose a new password. This secure link expires on <strong>%s</strong>.
                  </p>
                  <div class="btn-container">
                    <a href="%s" class="btn" target="_blank">Reset Password</a>
                  </div>
                  <p class="fallback-link">
                    If the button doesn't work, copy and paste this link in your browser:<br>
                    <a href="%s">%s</a>
                  </p>
                </div>
                <div class="footer">
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                escapeHtml(greetingName),
                escapeHtml(expiryDate),
                resetUrl,
                resetUrl,
                resetUrl
        );
    }

    private String buildInvitationHtml(
            String orgName,
            String roleName,
            String inviterName,
            String inviteUrl,
            String expiryDate
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invitation to join %s</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; }
                .wrapper { max-width: 580px; margin: 40px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .header { background: linear-gradient(135deg, #ea580c 0%%, #c2410c 100%%); padding: 32px 24px; text-align: center; }
                .logo-text { font-size: 26px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; margin: 0; text-transform: uppercase; }
                .tagline { color: #fed7aa; font-size: 13px; margin-top: 4px; }
                .content { padding: 32px 30px; }
                .heading { font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 16px; }
                .lead { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
                .badge-box { background-color: #1e293b; border-left: 4px solid #ea580c; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; }
                .badge-item { font-size: 14px; color: #94a3b8; margin: 4px 0; }
                .badge-item strong { color: #f8fafc; }
                .btn-container { text-align: center; margin: 32px 0 24px 0; }
                .btn { display: inline-block; background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); color: #ffffff !important; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4); }
                .btn:hover { background: #ea580c; }
                .fallback-link { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; line-height: 1.5; }
                .fallback-link a { color: #f97316; }
                .footer { border-top: 1px solid #1f2937; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; background-color: #0d131f; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <h1 class="logo-text">ApiAura</h1>
                  <div class="tagline">AI-Native API Collaboration & Testing Platform</div>
                </div>
                <div class="content">
                  <h2 class="heading">You're invited to collaborate!</h2>
                  <p class="lead">
                    Hello,<br>
                    <strong>%s</strong> has invited you to join the organization <strong>%s</strong> on ApiAura.
                  </p>
                  <div class="badge-box">
                    <div class="badge-item">Organization: <strong>%s</strong></div>
                    <div class="badge-item">Assigned Role: <strong>%s</strong></div>
                    <div class="badge-item">Expires On: <strong>%s</strong></div>
                  </div>
                  <div class="btn-container">
                    <a href="%s" class="btn" target="_blank">Accept Invitation</a>
                  </div>
                  <p class="fallback-link">
                    If the button doesn't work, copy and paste this link in your browser:<br>
                    <a href="%s">%s</a>
                  </p>
                </div>
                <div class="footer">
                  This invitation was sent by %s. If you were not expecting this, you can safely ignore this email.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                orgName,
                escapeHtml(inviterName),
                escapeHtml(orgName),
                escapeHtml(orgName),
                escapeHtml(roleName),
                escapeHtml(expiryDate),
                inviteUrl,
                inviteUrl,
                inviteUrl,
                escapeHtml(orgName)
        );
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}

