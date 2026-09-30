package com.apiaura.apiaura.engine.scripting.engine;

import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionContext;
import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionResult;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;
import org.graalvm.polyglot.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class SandboxedScriptEngine
        implements ScriptEngine {

    private final long maxExecutionTimeMs;

    public SandboxedScriptEngine(
            @org.springframework.beans.factory.annotation.Value("${security.scripting.max-execution-time-ms:1000}")
            long maxExecutionTimeMs
    ) {
        this.maxExecutionTimeMs =
                maxExecutionTimeMs;
    }

    @Override
    public ScriptExecutionResult execute(
            String script,
            ScriptExecutionContext executionContext
    ) {

        if (script == null ||
                script.isBlank()) {

            return ScriptExecutionResult.builder()
                    .successful(true)
                    .variables(
                            new HashMap<>(
                                    executionContext
                                            .getVariables()
                            )
                    )
                    .build();
        }

        Map<String, String> variables =
                new HashMap<>(
                        executionContext.getVariables()
                );

        try (
                Context context =
                        Context.newBuilder("js")

                                /*
                                 * Never expose Java classes.
                                 */
                                .allowHostAccess(
                                        HostAccess.NONE
                                )

                                .allowHostClassLookup(
                                        className -> false
                                )

                                /*
                                 * No filesystem.
                                 */
                                .allowIO(false)

                                /*
                                 * No native access.
                                 */
                                .allowNativeAccess(false)

                                /*
                                 * No process/thread creation.
                                 */
                                .allowCreateThread(false)

                                .build()
        ) {

            Value bindings =
                    context.getBindings("js");

            bindings.putMember(
                    "request",
                    createRequestObject(
                            executionContext
                    )
            );

            bindings.putMember(
                    "response",
                    createResponseObject(
                            executionContext
                    )
            );

            bindings.putMember(
                    "variables",
                    variables
            );

            /*
             * Controlled Apiaura API.
             */
            context.eval(
                    "js",
                    """
                    const api = {
                        variables: {
                            get: function(key) {
                                return variables[key] ?? null;
                            },

                            set: function(key, value) {
                                variables[key] = String(value);
                            },

                            remove: function(key) {
                                delete variables[key];
                            }
                        }
                    };
                    """
            );

            context.eval(
                    "js",
                    wrapScript(script)
            );

            Map<String, String> updatedVariables =
                    extractVariables(
                            bindings
                                    .getMember("variables")
                    );

            return ScriptExecutionResult.builder()
                    .successful(true)
                    .variables(updatedVariables)
                    .build();

        } catch (Exception exception) {

            return ScriptExecutionResult.builder()
                    .successful(false)
                    .variables(variables)
                    .errorMessage(
                            exception.getMessage()
                    )
                    .build();
        }
    }

    private String wrapScript(
            String script
    ) {

        return """
                (() => {
                    %s
                })();
                """.formatted(script);
    }

    private Map<String, Object> createRequestObject(
            ScriptExecutionContext context
    ) {

        Map<String, Object> request =
                new HashMap<>();

        request.put(
                "url",
                context.getRequestUrl()
        );

        request.put(
                "method",
                context.getRequestMethod()
        );

        request.put(
                "headers",
                context.getRequestHeaders()
        );

        request.put(
                "body",
                context.getRequestBody()
        );

        return request;
    }

    private Map<String, Object> createResponseObject(
            ScriptExecutionContext context
    ) {

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "status",
                context.getResponseStatus()
        );

        response.put(
                "headers",
                context.getResponseHeaders()
        );

        response.put(
                "body",
                context.getResponseBody()
        );

        return response;
    }

    private Map<String, String> extractVariables(
            Value value
    ) {

        Map<String, String> variables =
                new HashMap<>();

        if (value == null ||
                !value.hasMembers()) {

            return variables;
        }

        for (String key :
                value.getMemberKeys()) {

            Value member =
                    value.getMember(key);

            if (member == null ||
                    member.isNull()) {

                continue;
            }

            variables.put(
                    key,
                    member.asString()
            );
        }

        return variables;
    }
}
