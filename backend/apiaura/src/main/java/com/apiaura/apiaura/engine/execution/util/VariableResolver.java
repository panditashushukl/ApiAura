package com.apiaura.apiaura.engine.execution.util;

import com.apiaura.apiaura.api.collection.entity.CollectionVariable;
import com.apiaura.apiaura.api.environment.entity.EnvironmentVariable;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class VariableResolver {

    private static final Pattern VARIABLE_PATTERN =
            Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_.-]+)\\s*}}");

    private VariableResolver() {
    }

    public static Map<String, String> buildVariables(
            Collection<? extends CollectionVariable> collectionVariables,
            Collection<? extends EnvironmentVariable> environmentVariables
    ) {

        Map<String, String> variables = new HashMap<>();

        if (collectionVariables != null) {
            for (CollectionVariable variable : collectionVariables) {

                if (!variable.isEnabled()) {
                    continue;
                }

                if (variable.getVariableKey() == null) {
                    continue;
                }

                variables.put(
                        variable.getVariableKey(),
                        variable.getVariableValue()
                );
            }
        }

        /*
         * Environment variables override collection variables.
         */
        if (environmentVariables != null) {
            for (EnvironmentVariable variable : environmentVariables) {

                if (!variable.isEnabled()) {
                    continue;
                }

                if (variable.getVariableKey() == null) {
                    continue;
                }

                String value = variable.isSecret()
                        ? variable.getSecretValue()
                        : variable.getVariableValue();

                if (value != null) {
                    variables.put(
                            variable.getVariableKey(),
                            value
                    );
                }
            }
        }

        return variables;
    }

    public static String resolve(
            String value,
            Map<String, String> variables
    ) {

        if (value == null || value.isEmpty()) {
            return value;
        }

        Matcher matcher = VARIABLE_PATTERN.matcher(value);

        StringBuffer result = new StringBuffer();

        while (matcher.find()) {

            String variableName = matcher.group(1);

            String replacement = variables.get(variableName);

            if (replacement == null) {
                replacement = matcher.group(0);
            }

            matcher.appendReplacement(
                    result,
                    Matcher.quoteReplacement(replacement)
            );
        }

        matcher.appendTail(result);

        return result.toString();
    }
}
