package com.apiaura.apiaura.engine.execution.security;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.Set;

@Component
public class UrlSecurityValidator {

    private static final Set<String> ALLOWED_SCHEMES =
            Set.of("http", "https");

    private static final Set<String> BLOCKED_HOSTS =
            Set.of(
                    "localhost",
                    "localhost.localdomain",
                    "ip6-localhost",
                    "ip6-loopback"
            );

    private final boolean allowLocalDevelopment;

    public UrlSecurityValidator(
            @Value("${security.execution.allow-local-development:false}")
            boolean allowLocalDevelopment
    ) {
        this.allowLocalDevelopment = allowLocalDevelopment;
    }

    public void validate(String url) {

        if (url == null || url.isBlank()) {
            throw new BadRequestException(
                    "Request URL cannot be empty"
            );
        }

        final URI uri;

        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "Invalid request URL"
            );
        }

        validateScheme(uri);
        validateHost(uri);

        if (!allowLocalDevelopment) {
            validateResolvedAddress(uri.getHost());
        }
    }

    private void validateScheme(URI uri) {

        String scheme = uri.getScheme();

        if (scheme == null ||
                !ALLOWED_SCHEMES.contains(
                        scheme.toLowerCase(Locale.ROOT)
                )) {

            throw new BadRequestException(
                    "Only HTTP and HTTPS URLs are supported"
            );
        }
    }

    private void validateHost(URI uri) {

        String host = uri.getHost();

        if (host == null || host.isBlank()) {
            throw new BadRequestException(
                    "Request URL must contain a valid host"
            );
        }

        String normalizedHost =
                host.toLowerCase(Locale.ROOT);

        if (BLOCKED_HOSTS.contains(normalizedHost)) {

            if (!allowLocalDevelopment) {
                throw new BadRequestException(
                        "Requests to local hosts are not allowed"
                );
            }

            return;
        }

        if (isPrivateOrLocalHostname(normalizedHost)
                && !allowLocalDevelopment) {

            throw new BadRequestException(
                    "Requests to private or local hosts are not allowed"
            );
        }
    }

    private boolean isPrivateOrLocalHostname(
            String host
    ) {

        return host.equals("0.0.0.0")
                || host.equals("127.0.0.1")
                || host.startsWith("127.")
                || host.equals("::1")
                || host.equals("[::1]")
                || host.endsWith(".local")
                || host.endsWith(".localhost");
    }

    private void validateResolvedAddress(
            String host
    ) {

        try {

            InetAddress[] addresses =
                    InetAddress.getAllByName(host);

            for (InetAddress address : addresses) {

                if (address.isAnyLocalAddress()
                        || address.isLoopbackAddress()
                        || address.isLinkLocalAddress()
                        || address.isSiteLocalAddress()
                        || isPrivateIpv6(address)) {

                    throw new BadRequestException(
                            "Requests to private or local network addresses are not allowed"
                    );
                }
            }

        } catch (UnknownHostException exception) {

            throw new BadRequestException(
                    "Unable to resolve request host"
            );
        }
    }

    private boolean isPrivateIpv6(
            InetAddress address
    ) {

        byte[] bytes = address.getAddress();

        if (bytes.length != 16) {
            return false;
        }

        /*
         * IPv6 unique-local addresses:
         *
         * fc00::/7
         */
        return (bytes[0] & 0xFE) == 0xFC;
    }
}
