package com.apiaura.apiaura.engine.scripting.engine;

import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionContext;
import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionResult;

public interface ScriptEngine {

    ScriptExecutionResult execute(
            String script,
            ScriptExecutionContext context
    );
}
