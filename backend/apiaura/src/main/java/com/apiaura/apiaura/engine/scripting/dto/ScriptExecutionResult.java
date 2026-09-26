package com.apiaura.apiaura.engine.scripting.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class ScriptExecutionResult {

    private boolean successful;

    private String errorMessage;

    private Map<String, String> variables;
}
