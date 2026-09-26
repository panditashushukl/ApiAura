package com.apiaura.apiaura.engine.testing.service;

import com.apiaura.apiaura.engine.testing.dto.request.ExecuteTestSuiteRequest;
import com.apiaura.apiaura.testing.dto.request.*;
import com.apiaura.apiaura.engine.testing.dto.response.TestExecutionResponse;

import java.util.UUID;

public interface TestingService {

    TestExecutionResponse executeTestSuite(
            UUID testSuiteId,
            ExecuteTestSuiteRequest request
    );
}
