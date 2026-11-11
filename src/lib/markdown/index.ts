import { marked } from "marked";
import hljs from "highlight.js";
import sanitizeHtml from "sanitize-html";

// Configure marked with syntax highlighting
marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  let highlighted: string;
  try {
    highlighted = hljs.highlight(text, { language }).value;
  } catch {
    highlighted = hljs.highlightAuto(text).value;
  }

  return `<div class="code-block my-4 rounded-lg overflow-hidden border border-[#343D4F] bg-[#1E242F]">
    <div class="flex items-center justify-between px-4 py-2 bg-[#171C25] border-b border-[#2C3444] text-xs font-mono text-[#A8C8B2]">
      <span>${language}</span>
    </div>
    <pre class="p-4 overflow-x-auto text-sm font-mono text-[#F7F5EE] leading-relaxed"><code class="hljs language-${language}">${highlighted}</code></pre>
  </div>`;
};

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  if (!content) return "";

  const rawHtml = marked.parse(content) as string;

  // Bulletproof sanitization against XSS
  const sanitized = sanitizeHtml(rawHtml, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "pre",
      "code",
      "span",
      "div",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "blockquote",
      "hr",
      "img",
      "ul",
      "ol",
      "li",
      "p",
      "a",
      "strong",
      "em",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ["class"],
      span: ["class"],
      div: ["class"],
      pre: ["class"],
      a: ["href", "name", "target", "rel", "class"],
      img: ["src", "alt", "title", "class"],
      th: ["align", "class"],
      td: ["align", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });

  return sanitized;
}
