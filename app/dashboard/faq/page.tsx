"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// 1️⃣ Helper: split markdown by "## Section"
function splitSections(markdown: string) {
  const parts = markdown.split("\n## ");
  const sections = [];

  // parts[0] = content before first ## (title)
  for (let i = 1; i < parts.length; i++) {
    const [title, ...rest] = parts[i].split("\n");
    sections.push({
      title: title.trim(),
      content: rest.join("\n").trim(),
    });
  }

  return {
    intro: parts[0], // "# Frequently Asked Questions"
    sections,
  };
}
const MarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-5xl font-bold tracking-tight mb-10 text-center">
      {children}
    </h1>
  ),

  h3: ({ children }) => (
    <p className="font-semibold text-gray-900 dark:text-slate-200 mt-6 mb-1">
      {children}
    </p>
  ),

  p: ({ children }) => (
    <p className="text-black dark:text-slate-300 leading-relaxed ml-4 mb-2">

      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="list-disc ml-8 mb-4 text-gray-700 dark:text-slate-300 space-y-1">   {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="list-decimal ml-8 mt-2 mb-4 space-y-1 text-gray-700 dark:text-slate-300">

      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="leading-relaxed">
      {children}
    </li>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline"

    >
      {children}
    </a>
  ),
};

export default function FAQPage() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  // 2️⃣ Load markdown file
  useEffect(() => {
    fetch("/markdown/FAQ.md")
      .then((res) => res.text())
      .then(setMarkdown)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // 3️⃣ Split markdown
  const { intro, sections } = splitSections(markdown);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Page title */}
      <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{ h1: MarkdownComponents.h1 }}
>
  {intro}
</ReactMarkdown>

      {/* Accordion */}
      <Accordion type="multiple" className="mt-16 space-y-4">
  {sections.map((section) => (
    <AccordionItem key={section.title} value={section.title}>

      <AccordionTrigger className="text-xl font-semibold text-gray-900 dark:text-slate-200">
       <span>{section.title}</span>

      </AccordionTrigger>

      <AccordionContent className="pt-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={MarkdownComponents}
        >
          {section.content}
        </ReactMarkdown>
      </AccordionContent>

    </AccordionItem>
  ))}
</Accordion>

    </div>
  );
}
