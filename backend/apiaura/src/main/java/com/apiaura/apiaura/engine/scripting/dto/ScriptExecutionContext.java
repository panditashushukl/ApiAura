package com.apiaura.apiaura.engine.scripting.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class ScriptExecutionContext {

    private Map<String, String> variables;

    private String requestUrl;

    private String requestMethod;

    private Map<String, String> requestHeaders;

    private String requestBody;

    private Integer responseStatus;

    private Map<String, Object> responseHeaders;

    private String responseBody;
}
