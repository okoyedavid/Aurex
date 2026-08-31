"use client";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "448px", textAlign: "center" }}>
          <title>Aurex error</title>
          <h1>Something went wrong.</h1>
          <p>Reload this part of Aurex and try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "16px",
              border: 0,
              borderRadius: "8px",
              padding: "12px 20px",
              background: "#4f46e5",
              color: "white",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
