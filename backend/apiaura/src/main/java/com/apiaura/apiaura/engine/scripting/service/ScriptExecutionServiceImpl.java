package com.apiaura.apiaura.engine.scripting.service;

import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionContext;
import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionResult;
import com.apiaura.apiaura.engine.scripting.engine.ScriptEngine;
import org.springframework.stereotype.Service;

@Service
public class ScriptExecutionServiceImpl
        implements ScriptExecutionService {

    private final ScriptEngine scriptEngine;

    public ScriptExecutionServiceImpl(
            ScriptEngine scriptEngine
    ) {
        this.scriptEngine = scriptEngine;
    }

    @Override
    public ScriptExecutionResult executePreRequestScript(
            String script,
            ScriptExecutionContext context
    ) {

        return scriptEngine.execute(
                script,
                context
        );
    }

    @Override
    public ScriptExecutionResult executePostRequestScript(
            String script,
            ScriptExecutionContext context
    ) {

        return scriptEngine.execute(
                script,
                context
        );
    }
}
