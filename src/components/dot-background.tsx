export function DotBackground() {
    return (
        <div
            className="fixed inset-0 opacity-10 pointer-events-none"
            style={{
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
            }}
        />
    )
}
