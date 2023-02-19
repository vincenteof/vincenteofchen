import ReactMarkdown from "react-markdown";
import type { Options } from "react-markdown";
import rangeParser from "parse-numeric-range";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/cjs/languages/prism/markdown";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("json", json);

type MarkdownProps = {
  children: string;
};

const syntaxTheme = atomDark;
const MarkdownComponents: Options["components"] = {
  code({ node, inline, className, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const hasMeta = node?.data?.meta;

    const applyHighlights: object = (applyHighlights: number) => {
      if (hasMeta) {
        const RE = /{([\d,-]+)}/;
        const metadata =
          typeof node.data?.meta === "string"
            ? node.data?.meta?.replace(/\s/g, "")
            : "";
        const strLineNumbers = RE.exec(metadata)?.[1];
        const highlightLines = rangeParser(strLineNumbers ?? "0");
        const highlight = highlightLines;
        const data = highlight.includes(applyHighlights) ? "highlight" : null;
        return { data };
      } else {
        return {};
      }
    };

    // FIXME: ts as any
    return match ? (
      <SyntaxHighlighter
        style={syntaxTheme as any}
        language={match[1]}
        showLineNumbers={true}
        useInlineStyles={true}
        PreTag="div"
        wrapLines={hasMeta ? true : false}
        lineProps={applyHighlights}
        {...(props as any)}
      />
    ) : (
      <code className={className} {...props} />
    );
  },
};
export default function Markdown(props: MarkdownProps) {
  return (
    <ReactMarkdown components={MarkdownComponents}>
      {props.children}
    </ReactMarkdown>
  );
}
