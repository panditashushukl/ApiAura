package com.apiaura.apiaura.foundation.email;

import java.time.Instant;

public interface EmailService {

    /**
     * Sends an invitation email to a prospective member.
     *
     * @param toEmail          Recipient email address
     * @param organizationName Name of the organization inviting the user
     * @param roleName         Name of the role assigned
     * @param inviterName      Name of the admin who sent the invite
     * @param inviteUrl        Full verification/acceptance URL
     * @param expiresAt        Expiration timestamp
     */
    void sendOrganizationInvitation(
            String toEmail,
            String organizationName,
            String roleName,
            String inviterName,
            String inviteUrl,
            Instant expiresAt
    );
}

