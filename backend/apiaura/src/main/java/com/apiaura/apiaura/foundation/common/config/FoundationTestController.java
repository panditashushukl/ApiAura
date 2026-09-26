package com.apiaura.apiaura.foundation.common.config;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
public class FoundationTestController {

    @GetMapping
    public ApiResponse<String> test() {

        return ApiResponse.success(
                "Request successful",
                "Apiaura foundation is working"
        );
    }

    @GetMapping("/error")
    public ApiResponse<String> error() {

        throw new ResourceNotFoundException(
                "Test resource not found"
        );
    }
}
