// Vite config the replay editor (LiveTypingDemo) needs. It mixes `lexical` with
// several `@lexical/*` node packages (HeadingNode, CodeNode, LinkNode, …); they
// must all share ONE copy of `lexical` or node-class identity breaks at runtime
// ("does not subclass LexicalNode" / silent reconciliation failures). Deduping
// resolution + pre-bundling the whole family together guarantees a single
// instance. Spread these into astro.config's vite.resolve / vite.optimizeDeps.
// Only our DIRECT dependencies. Deduping `lexical` itself guarantees one shared
// instance (every @lexical/* package imports it), which is what fixes the bug.
// Do NOT list transitive packages (@lexical/html, clipboard, selection, dragon)
// here — that makes the production Rollup build try to resolve them from the
// project root, where they aren't installed ("failed to resolve @lexical/html").
const LEXICAL_FAMILY = [
	"lexical",
	"@lexical/utils",
	"@lexical/rich-text",
	"@lexical/code",
	"@lexical/link",
	"@lexical/mark",
];

export const lexicalVite = {
	resolve: { dedupe: LEXICAL_FAMILY },
	optimizeDeps: { include: LEXICAL_FAMILY },
};
