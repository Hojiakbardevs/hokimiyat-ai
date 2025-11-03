export default function CssGridBackground() {
  return (
    <>
      {/* Enhanced grid overlay - more visible */}
      <div
        className="absolute inset-0 pointer-events-none z-[-1] grid-background"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(36, 101, 237, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(36, 101, 237, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 90%)",
        }}
        aria-hidden="true"
      />

      {/* Accent grid overlay for center emphasis */}
      <div
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(36, 101, 237, 0.15) 1.5px, transparent 1px),
            linear-gradient(to bottom, rgba(36, 101, 237, 0.15) 1.5px, transparent 1px)
          `,
          backgroundSize: "120px 120px",
          maskImage:
            "radial-gradient(circle at center, black 20%, transparent 60%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 20%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none z-[-2] grid-gradient"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(36, 101, 237, 0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
