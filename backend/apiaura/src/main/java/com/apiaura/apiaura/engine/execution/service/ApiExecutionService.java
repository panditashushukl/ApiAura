package com.apiaura.apiaura.engine.execution.service;

import com.apiaura.apiaura.engine.execution.dto.request.ExecuteApiRequest;
import com.apiaura.apiaura.engine.execution.dto.response.ApiExecutionResponse;

import java.util.UUID;

public interface ApiExecutionService {

    ApiExecutionResponse execute(
            UUID requestId,
            ExecuteApiRequest request
    );
}
