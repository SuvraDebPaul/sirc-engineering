"use client";

/**
 * Last-resort error boundary — catches a failure in the root layout itself
 * (e.g. `getSiteSettings()` throwing because the database is unreachable).
 *
 * Deliberately dependency-free: no Tailwind classes, no shared components, no
 * custom fonts. If the root layout failed, `globals.css` may not have loaded
 * either, and this must still render something legible without it.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.75rem", color: "#666", maxWidth: "28rem" }}>
          This one is on us. Please try again shortly.
        </p>
        {error.digest && (
          <p style={{ marginTop: "1rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#999" }}>
            Reference: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            marginTop: "2rem",
            padding: "0.625rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#111",
            color: "#fff",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
