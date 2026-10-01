"use client";

import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { useToast } from "@/components/feedback/toast-system";

interface CodeSnippetGeneratorProps {
  method: string;
  url: string;
  headers?: Array<{ headerKey: string; headerValue: string }>;
  queryParams?: Array<{ parameterKey: string; parameterValue: string }>;
  body?: string | null;
}

export function CodeSnippetGenerator({
  method,
  url,
  headers = [],
  queryParams = [],
  body,
}: CodeSnippetGeneratorProps) {
  const [lang, setLang] = useState<"curl" | "js" | "python">("curl");
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  // Compute full URL with query parameters if present
  let fullUrl = url || "https://api.example.com";
  if (queryParams.length > 0) {
    const qStr = queryParams
      .map((q) => `${encodeURIComponent(q.parameterKey)}=${encodeURIComponent(q.parameterValue)}`)
      .join("&");
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + qStr;
  }

  const generateCurl = () => {
    let snippet = `curl -X ${method.toUpperCase()} "${fullUrl}"`;
    headers.forEach((h) => {
      snippet += ` \\\n  -H "${h.headerKey}: ${h.headerValue}"`;
    });
    if (body && method.toUpperCase() !== "GET") {
      try {
        const compact = JSON.stringify(JSON.parse(body));
        snippet += ` \\\n  -d '${compact}'`;
      } catch {
        snippet += ` \\\n  -d '${body}'`;
      }
    }
    return snippet;
  };

  const generateJsFetch = () => {
    const headerObj: Record<string, string> = {};
    headers.forEach((h) => {
      headerObj[h.headerKey] = h.headerValue;
    });

    let snippet = `fetch("${fullUrl}", {\n  method: "${method.toUpperCase()}",\n`;
    if (Object.keys(headerObj).length > 0) {
      snippet += `  headers: ${JSON.stringify(headerObj, null, 4)},\n`;
    }
    if (body && method.toUpperCase() !== "GET") {
      try {
        snippet += `  body: JSON.stringify(${JSON.stringify(JSON.parse(body), null, 4)})\n`;
      } catch {
        snippet += `  body: ${JSON.stringify(body)}\n`;
      }
    }
    snippet += `})\n  .then(res => res.json())\n  .then(data => console.log(data));`;
    return snippet;
  };

  const generatePython = () => {
    let snippet = `import requests\n\nurl = "${fullUrl}"\n`;
    if (headers.length > 0) {
      const headerObj: Record<string, string> = {};
      headers.forEach((h) => {
        headerObj[h.headerKey] = h.headerValue;
      });
      snippet += `headers = ${JSON.stringify(headerObj, null, 4)}\n`;
    }

    if (body && method.toUpperCase() !== "GET") {
      try {
        snippet += `json_payload = ${JSON.stringify(JSON.parse(body), null, 4)}\n`;
        snippet += `response = requests.${method.toLowerCase()}(url, json=json_payload${headers.length > 0 ? ", headers=headers" : ""})\n`;
      } catch {
        snippet += `response = requests.${method.toLowerCase()}(url, data=${JSON.stringify(body)}${headers.length > 0 ? ", headers=headers" : ""})\n`;
      }
    } else {
      snippet += `response = requests.${method.toLowerCase()}(url${headers.length > 0 ? ", headers=headers" : ""})\n`;
    }
    snippet += `print(response.json())`;
    return snippet;
  };

  const getSnippet = () => {
    switch (lang) {
      case "js":
        return generateJsFetch();
      case "python":
        return generatePython();
      default:
        return generateCurl();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    toast.success("Code snippet copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[rgb(var(--border))] rounded-lg overflow-hidden bg-[rgb(var(--card))]">
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))/30] px-3 py-2 text-xs">
        <div className="flex items-center gap-1 font-medium">
          <Code2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
          <span>Code Snippet</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden text-[11px]">
            <button
              type="button"
              onClick={() => setLang("curl")}
              className={`px-2 py-0.5 ${lang === "curl" ? "bg-[rgb(var(--primary))] text-white font-bold" : "text-[rgb(var(--muted-foreground))]"}`}
            >
              cURL
            </button>
            <button
              type="button"
              onClick={() => setLang("js")}
              className={`px-2 py-0.5 ${lang === "js" ? "bg-[rgb(var(--primary))] text-white font-bold" : "text-[rgb(var(--muted-foreground))]"}`}
            >
              Fetch
            </button>
            <button
              type="button"
              onClick={() => setLang("python")}
              className={`px-2 py-0.5 ${lang === "python" ? "bg-[rgb(var(--primary))] text-white font-bold" : "text-[rgb(var(--muted-foreground))]"}`}
            >
              Python
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            title="Copy code snippet"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[rgb(var(--success))]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <pre className="p-3 font-mono text-[11px] overflow-x-auto bg-[rgb(var(--background))] text-[rgb(var(--foreground))] max-h-[220px]">
        {getSnippet()}
      </pre>
    </div>
  );
}
