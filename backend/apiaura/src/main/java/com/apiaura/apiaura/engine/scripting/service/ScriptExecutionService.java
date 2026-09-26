package com.apiaura.apiaura.engine.scripting.service;

import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionContext;
import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionResult;

public interface ScriptExecutionService {

    ScriptExecutionResult executePreRequestScript(
            String script,
            ScriptExecutionContext context
    );

    ScriptExecutionResult executePostRequestScript(
            String script,
            ScriptExecutionContext context
    );
}
