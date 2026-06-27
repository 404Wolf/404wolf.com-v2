// Vite config the replay editor (LiveTypingDemo) needs. It mixes `lexical` with
// several `@lexical/*` node packages (HeadingNode, CodeNode, LinkNode, …); they
// must all share ONE copy of `lexical` or node-class identity breaks at runtime
// ("does not subclass LexicalNode" / silent reconciliation failures). Deduping
// resolution + pre-bundling the whole family together guarantees a single
// instance. Spread these into astro.config's vite.resolve / vite.optimizeDeps.
const LEXICAL_FAMILY = [
	"lexical",
	"@lexical/utils",
	"@lexical/rich-text",
	"@lexical/code",
	"@lexical/link",
	"@lexical/mark",
	"@lexical/clipboard",
	"@lexical/selection",
	"@lexical/html",
	"@lexical/dragon",
];

export const lexicalVite = {
	resolve: { dedupe: LEXICAL_FAMILY },
	optimizeDeps: { include: LEXICAL_FAMILY },
};
