package com.apiaura.apiaura.engine.ai.service;

import com.apiaura.apiaura.engine.ai.tool.AiToolContext;
import org.springframework.stereotype.Service;

@Service
public class AiPermissionService {

    /*
     * This is intentionally isolated from the AI agent.
     *
     * Replace the permission logic with your existing
     * RBACService once the exact permission identifiers
     * are finalized.
     */

    public boolean canExecute(
            AiToolContext context,
            String toolName
    ) {

        /*
         * Examples:
         *
         * create_api_request
         *      -> request:create
         *
         * configure_api_request
         *      -> request:update
         *
         * execute_api_request
         *      -> request:execute
         *
         * generate_api_test
         *      -> test:create
         *
         * create_workflow
         *      -> workflow:create
         */

        return true;
    }
}