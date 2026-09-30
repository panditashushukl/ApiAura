package com.apiaura.apiaura.foundation.common.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MdcTracingFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_HEADER = "X-Trace-ID";
    public static final String TRACEPARENT_HEADER = "traceparent";
    
    public static final String MDC_TRACE_ID = "traceId";
    public static final String MDC_SPAN_ID = "spanId";
    public static final String MDC_HTTP_METHOD = "httpMethod";
    public static final String MDC_REQUEST_URI = "requestUri";
    public static final String MDC_CLIENT_IP = "clientIp";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String traceId = extractOrGenerateTraceId(request);
            String spanId = generateSpanId();

            MDC.put(MDC_TRACE_ID, traceId);
            MDC.put(MDC_SPAN_ID, spanId);
            MDC.put(MDC_HTTP_METHOD, request.getMethod());
            MDC.put(MDC_REQUEST_URI, request.getRequestURI());
            MDC.put(MDC_CLIENT_IP, getClientIp(request));

            response.setHeader(TRACE_ID_HEADER, traceId);

            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private String extractOrGenerateTraceId(HttpServletRequest request) {
        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (StringUtils.hasText(traceId)) {
            return traceId;
        }

        String traceparent = request.getHeader(TRACEPARENT_HEADER);
        if (StringUtils.hasText(traceparent) && traceparent.startsWith("00-")) {
            String[] parts = traceparent.split("-");
            if (parts.length >= 2 && StringUtils.hasText(parts[1])) {
                return parts[1];
            }
        }

        return UUID.randomUUID().toString();
    }

    private String generateSpanId() {
        return UUID.randomUUID().toString().substring(0, 16);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
