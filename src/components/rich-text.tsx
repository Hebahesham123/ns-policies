import * as React from "react";

/**
 * Minimal, safe renderer for Tiptap/ProseMirror JSON documents.
 * Renders known node & mark types only — no dangerouslySetInnerHTML, so it is
 * XSS-safe by construction. Extend the switch to support more node types.
 */

type Mark = { type: string; attrs?: Record<string, any> };
type Node = {
  type: string;
  attrs?: Record<string, any>;
  content?: Node[];
  text?: string;
  marks?: Mark[];
};

function renderMarks(text: string, marks: Mark[] | undefined, key: React.Key): React.ReactNode {
  if (!marks?.length) return text;
  return marks.reduce<React.ReactNode>((acc, mark, i) => {
    switch (mark.type) {
      case "bold":
        return <strong key={i}>{acc}</strong>;
      case "italic":
        return <em key={i}>{acc}</em>;
      case "code":
        return <code key={i}>{acc}</code>;
      case "strike":
        return <s key={i}>{acc}</s>;
      case "link":
        return (
          <a key={i} href={mark.attrs?.href} target="_blank" rel="noopener noreferrer">
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: Node, key: React.Key): React.ReactNode {
  const children = node.content?.map((c, i) => renderNode(c, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return <p key={key} dir="auto">{children}</p>;
    case "heading": {
      const level = Math.min(Math.max(node.attrs?.level ?? 2, 2), 4);
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      return <Tag key={key} dir="auto">{children}</Tag>;
    }
    case "bulletList":
      return <ul key={key} dir="auto">{children}</ul>;
    case "orderedList":
      return <ol key={key} dir="auto">{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{node.content?.map((c) => c.text).join("")}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={node.attrs?.src} alt={node.attrs?.alt ?? ""} loading="lazy" />;
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table><tbody>{children}</tbody></table>
        </div>
      );
    case "tableRow":
      return <tr key={key}>{children}</tr>;
    case "tableHeader":
      return <th key={key}>{children}</th>;
    case "tableCell":
      return <td key={key}>{children}</td>;
    case "text":
      return <React.Fragment key={key}>{renderMarks(node.text ?? "", node.marks, key)}</React.Fragment>;
    default:
      return children ? <div key={key}>{children}</div> : null;
  }
}

export function RichText({ content }: { content: unknown }) {
  if (!content || typeof content !== "object") {
    return <p className="text-muted-foreground">لا يوجد محتوى بعد.</p>;
  }
  return <div className="prose-content">{renderNode(content as Node, "root")}</div>;
}
