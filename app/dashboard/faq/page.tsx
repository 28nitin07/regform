"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ReactNode } from "react";

interface MarkdownComponentProps {
  children?: ReactNode;
}

const MarkdownComponents = {
 
  h3: ({ children }: MarkdownComponentProps) => (
    <h3 className="text-lg font-bold my-4">
      {children}
    </h3>
  ),

  h2: ({ children }: MarkdownComponentProps) => (
    <h2 className="text-xl font-bold my-6 text-center">
      {children}
    </h2>
  ),

  h1: ({ children }: MarkdownComponentProps) => (
    <h1 className="text-2xl font-bold my-8 text-center">
      {children}
    </h1>
  ),

  p: ({ children }: MarkdownComponentProps) => (
    <p className="my-2 text-gray-800">
      {children}
    </p>
  ),

  ul: ({ children }: MarkdownComponentProps) => (
    <ul className="list-disc list-inside space-y-2 my-4 ml-4">
      {children}
    </ul>
  ),

  ol: ({ children }: MarkdownComponentProps) => (
    <ol className="list-decimal list-inside space-y-2 my-4 ml-4">
      {children}
    </ol>
  ),
};


export default function FAQPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/markdown/FAQ.md")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load FAQ");
        return res.text();
      })
      .then(setContent)
      .catch(() => setContent("Failed to load FAQ content."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={MarkdownComponents}   
        >
          {content}
        </ReactMarkdown>
      )}
    </div>
  );
}
