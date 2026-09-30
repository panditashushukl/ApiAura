package com.apiaura.apiaura.foundation.common.exception;

import com.apiaura.apiaura.foundation.common.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(
            ApiException exception,
            HttpServletRequest request
    ) {
        log.warn("API Exception occurred: status={}, path={}, message={}",
                exception.getStatus(), request.getRequestURI(), exception.getMessage());

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .message(exception.getMessage())
                .error(exception.getStatus().getReasonPhrase())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .traceId(MDC.get("traceId"))
                .build();

        return ResponseEntity
                .status(exception.getStatus())
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        log.warn("Validation failed for request path={}: errors={}", request.getRequestURI(), errors);

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .message("Validation failed")
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .traceId(MDC.get("traceId"))
                .validationErrors(errors)
                .build();

        return ResponseEntity
                .badRequest()
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error("Unhandled exception occurred: path={}, message={}",
                request.getRequestURI(), exception.getMessage(), exception);

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .message("An unexpected error occurred")
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .traceId(MDC.get("traceId"))
                .build();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
