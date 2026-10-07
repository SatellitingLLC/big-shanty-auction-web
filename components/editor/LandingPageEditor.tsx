"use client";

import GjsEditor from "@grapesjs/react";
import grapesjs, { type Editor } from "grapesjs";
import Link from "next/link";
import { useRef, useState } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import type { PageDocument } from "@/lib/page-seed";

function removeSharedChrome(markup: string) {
  const document = new DOMParser().parseFromString(markup, "text/html");
  document.querySelectorAll("nav, footer").forEach((element) => element.remove());
  return document.body.innerHTML;
}

export function LandingPageEditor({ page }: { page: PageDocument }) {
  const editorRef = useRef<Editor | null>(null);
  const sourceFrameRef = useRef<HTMLIFrameElement>(null);
  const sourceReadyRef = useRef(page.slug === "home");
  const initializedRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(
    page.html !== page.publishedHtml ||
      page.css !== page.publishedCss ||
      page.title !== page.publishedTitle ||
      page.description !== page.publishedDescription
      ? "Draft differs from live version"
      : page.published
        ? "Published version is live"
        : "Draft not published",
  );

  const initializeEditor = () => {
    const editor = editorRef.current;
    if (!editor || !sourceReadyRef.current || initializedRef.current) {
      return;
    }

    const sourceDocument = sourceFrameRef.current?.contentDocument;
    const canvasDocument = sourceDocument ? editor.Canvas.getDocument() : null;
    if (sourceDocument && !canvasDocument) {
      return;
    }

    const sourceRoot = sourceDocument?.querySelector<HTMLElement>(`.${page.slug}-page`);
    const main = sourceRoot?.querySelector("main");
    const sourceMarkup = sourceRoot && main
      ? `<div class="${sourceRoot.className}">${main.outerHTML}</div>`
      : "";
    const initialHtml = removeSharedChrome(page.html || sourceMarkup);
    editor.setComponents(initialHtml);
    editor.setStyle(`${page.baseCss}\n${page.css}`);

    if (sourceDocument && canvasDocument) {
      sourceDocument
        .querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style')
        .forEach((stylesheet) => canvasDocument.head.append(stylesheet.cloneNode(true)));
    }

    initializedRef.current = true;
  };

  const onSourceLoaded = () => {
    sourceReadyRef.current = true;
    initializeEditor();
  };

  const saveCurrentPage = async (action: "draft" | "publish") => {
    const editor = editorRef.current;
    if (!editor) {
      setStatus("Editor is still loading");
      return;
    }

    const payload = {
      slug: page.slug,
      title: page.title,
      description: page.description,
      html: removeSharedChrome(editor.getHtml()),
      css: editor.getCss(),
      action,
    };

    setIsSaving(true);
    setStatus(action === "publish" ? "Publishing your page..." : "Saving your draft...");

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" && result !== null && "message" in result && typeof result.message === "string"
            ? result.message
            : "Unable to save page.";
        throw new Error(message);
      }

      setStatus(action === "publish" ? "Published successfully" : "Draft saved");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="editor-layout">
      {page.slug !== "home" && (
        <iframe
          ref={sourceFrameRef}
          src={`/${page.slug}`}
          title={`${page.title} source page`}
          aria-hidden="true"
          tabIndex={-1}
          onLoad={onSourceLoaded}
          style={{ display: "none" }}
        />
      )}
      <div className="editor-toolbar">
        <div>
          <p className="toolbar-kicker">Landing page editor</p>
          <h1>{page.title}</h1>
        </div>
        <div className="toolbar-actions">
          <Link className="admin-link" href="/admin/editor">Home</Link>
          <Link className="admin-link" href="/admin/editor/about">About</Link>
          <Link className="admin-link" href="/admin/editor/team">Team</Link>
          <Link className="admin-link" href="/admin/editor/contact">Contact</Link>
          <span className="status-pill">{status}</span>
          <Link className="admin-link" href="/admin">Dashboard</Link>
          <LogoutButton />
          <button type="button" className="save-button" onClick={() => saveCurrentPage("draft")} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            className="save-button publish-button"
            onClick={() => saveCurrentPage("publish")}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      <GjsEditor
        grapesjs={grapesjs}
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        onEditor={(editor) => {
          editorRef.current = editor;
          editor.on("load", initializeEditor);
          initializeEditor();
        }}
        options={{
          height: "calc(100vh - 96px)",
          storageManager: false,
          fromElement: false,
          canvas: {
            styles: [
              "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&display=swap",
              "/api/editor-base-css",
            ],
          },
        }}
      />
    </div>
  );
}
