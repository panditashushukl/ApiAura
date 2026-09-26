package com.apiaura.apiaura.engine.testing.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.engine.testing.dto.request.ExecuteTestSuiteRequest;
import com.apiaura.apiaura.engine.testing.dto.response.TestExecutionResponse;
import com.apiaura.apiaura.engine.testing.service.TestingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/test-suites")
public class TestController {

    private final TestingService testingService;

    public TestController(
            TestingService testingService
    ) {
        this.testingService = testingService;
    }

    @PostMapping("/{testSuiteId}/execute")
    public ResponseEntity<
            ApiResponse<TestExecutionResponse>
            > execute(

            @PathVariable UUID testSuiteId,

            @Valid
            @RequestBody
            ExecuteTestSuiteRequest request

    ) {

        TestExecutionResponse response =
                testingService.executeTestSuite(
                        testSuiteId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Test suite executed successfully",
                        response
                )
        );
    }
}
