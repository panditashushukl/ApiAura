"use client";

import { useState } from "react";
import { Code2, FileCode, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ScriptEditorProps {
  preRequestScript: string;
  postRequestScript: string;
  onChangePreRequestScript: (script: string) => void;
  onChangePostRequestScript: (script: string) => void;
}

export function ScriptEditor({
  preRequestScript,
  postRequestScript,
  onChangePreRequestScript,
  onChangePostRequestScript,
}: ScriptEditorProps) {
  const [activeTab, setActiveTab] = useState<"pre" | "post">("pre");

  const insertSnippet = (snippet: string) => {
    if (activeTab === "pre") {
      onChangePreRequestScript(
        preRequestScript ? `${preRequestScript}\n\n${snippet}` : snippet
      );
    } else {
      onChangePostRequestScript(
        postRequestScript ? `${postRequestScript}\n\n${snippet}` : snippet
      );
    }
  };

  const snippets =
    activeTab === "pre"
      ? [
          {
            label: "Set Environment Variable",
            code: `aura.environment.set("timestamp", Date.now());`,
          },
          {
            label: "Get Environment Variable",
            code: `const token = aura.environment.get("authToken");`,
          },
          {
            label: "Add Request Header",
            code: `aura.request.headers.add("X-Custom-Header", "ApiAura");`,
          },
        ]
      : [
          {
            label: "Status code is 200",
            code: `aura.test("Status code is 200", function () {\n    aura.response.to.have.status(200);\n});`,
          },
          {
            label: "Response time < 500ms",
            code: `aura.test("Response time is less than 500ms", function () {\n    aura.expect(aura.response.responseTime).to.be.below(500);\n});`,
          },
          {
            label: "JSON Value Check",
            code: `aura.test("Check JSON response field", function () {\n    const jsonData = aura.response.json();\n    aura.expect(jsonData.success).to.eql(true);\n});`,
          },
          {
            label: "Save Response Token to Env",
            code: `const jsonData = aura.response.json();\nif (jsonData.token) {\n    aura.environment.set("bearerToken", jsonData.token);\n}`,
          },
        ];

  return (
    <div className="space-y-4">
      {/* Sub-tabs for Pre vs Post Script */}
      <div className="flex border-b border-[rgb(var(--border))] text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("pre")}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "pre"
              ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
              : "border-transparent text-[rgb(var(--muted-foreground))]"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          Pre-request Script
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("post")}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "post"
              ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
              : "border-transparent text-[rgb(var(--muted-foreground))]"
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Post-request / Test Script
        </button>
      </div>

      {/* Code Editor and Snippets Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Editor Area */}
        <div className="md:col-span-3 space-y-2">
          <Textarea
            value={activeTab === "pre" ? preRequestScript : postRequestScript}
            onChange={(e) =>
              activeTab === "pre"
                ? onChangePreRequestScript(e.target.value)
                : onChangePostRequestScript(e.target.value)
            }
            placeholder={
              activeTab === "pre"
                ? "// JavaScript code executed BEFORE request is sent\naura.environment.set('requestId', 'req_' + Date.now());"
                : "// JavaScript code executed AFTER response is received\naura.test('Status is 200', () => {\n    aura.response.to.have.status(200);\n});"
            }
            className="font-mono text-xs min-h-[260px] bg-[rgb(var(--card))]"
          />
        </div>

        {/* Snippets Sidebar */}
        <div className="space-y-2 p-3 border border-[rgb(var(--border))] rounded-md bg-[rgb(var(--muted))/20]">
          <h4 className="text-xs font-semibold flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Quick Snippets
          </h4>
          <div className="space-y-1.5">
            {snippets.map((snip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertSnippet(snip.code)}
                className="w-full text-left p-2 rounded border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] text-[11px] transition-colors font-medium truncate block"
                title={snip.code}
              >
                + {snip.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
