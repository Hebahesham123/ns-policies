"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Heading2, Heading3, Undo, Redo, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Rich-text editor built on Tiptap. Emits a ProseMirror JSON document via
 * onChange — the same shape the RichText renderer consumes.
 */
export function TiptapEditor({
  value,
  onChange,
}: {
  value?: unknown;
  onChange: (doc: unknown) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    content: (value as object) ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose-content min-h-[320px] max-w-none px-4 py-3 focus:outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  if (!editor) return <div className="min-h-[380px] animate-pulse rounded-lg border bg-muted/40" />;

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const Btn = ({
    onClick, active, disabled, children, label,
  }: { onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; label: string }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 [&_svg]:size-4",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5">
      <Btn label="عريض" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold /></Btn>
      <Btn label="مائل" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic /></Btn>
      <Btn label="يتوسطه خط" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><Strikethrough /></Btn>
      <Btn label="كود مضمّن" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}><Code /></Btn>
      <span className="mx-1 h-5 w-px bg-border" />
      <Btn label="عنوان 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 /></Btn>
      <Btn label="عنوان 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 /></Btn>
      <Btn label="قائمة نقطية" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List /></Btn>
      <Btn label="قائمة رقمية" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered /></Btn>
      <Btn label="اقتباس" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote /></Btn>
      <Btn label="كتلة كود" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><Code /></Btn>
      <Btn label="فاصل" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></Btn>
      <span className="mx-1 h-5 w-px bg-border" />
      <Btn label="تراجع" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo /></Btn>
      <Btn label="إعادة" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo /></Btn>
    </div>
  );
}
