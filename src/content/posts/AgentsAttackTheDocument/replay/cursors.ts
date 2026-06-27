// Renders remote AI cursors/selections over the replay editor. We get plain
// (nodeId, offset) from the trace; map durable id -> Lexical key -> DOM, build a
// DOM Range, and position absolutely-placed overlays. One cursor per peer.
import { $isTextNode, type LexicalNode } from "lexical";
import { $blockById, $byId } from "./locate";
import type { LexicalSession } from "./session";
import { collectTextNodes } from "./tree";
import type { Awareness, ReplayPeer } from "./types";

type CursorEl = {
	caret: HTMLElement;
	label: HTMLElement;
	sel: HTMLElement; // container holding 0+ selection-rect divs
	color: string;
};

const PALETTE: Record<string, string> = {
	"accent-210": "#3b82f6",
	"accent-30": "#f59e0b",
	"accent-90": "#84cc16",
	"accent-150": "#10b981",
	"accent-270": "#8b5cf6",
	"accent-330": "#ec4899",
};
const colorOf = (c: string) => PALETTE[c] ?? "#3b82f6";

/** A cursor layer positioned over `container` (which wraps the editor root). */
export function createCursorLayer(
	session: LexicalSession,
	container: HTMLElement,
) {
	const layer = document.createElement("div");
	Object.assign(layer.style, {
		position: "absolute",
		inset: "0",
		pointerEvents: "none",
		overflow: "visible",
	} satisfies Partial<CSSStyleDeclaration>);
	if (getComputedStyle(container).position === "static")
		container.style.position = "relative";
	container.appendChild(layer);

	const peers = new Map<string, CursorEl>();

	const ensure = (peer: ReplayPeer): CursorEl => {
		let el = peers.get(peer.name);
		if (el) return el;
		const color = colorOf(peer.color);
		const caret = document.createElement("div");
		Object.assign(caret.style, {
			position: "absolute",
			width: "2px",
			background: color,
			display: "none",
		} satisfies Partial<CSSStyleDeclaration>);
		const label = document.createElement("div");
		label.textContent = peer.name;
		Object.assign(label.style, {
			position: "absolute",
			transform: "translateY(-100%)",
			background: color,
			color: "white",
			font: "11px/1.4 ui-sans-serif, system-ui, sans-serif",
			padding: "0 4px",
			borderRadius: "3px",
			whiteSpace: "nowrap",
		} satisfies Partial<CSSStyleDeclaration>);
		// Selection layer: a container we fill with one div per line-rect of the
		// selected span (a selection can wrap several lines).
		const sel = document.createElement("div");
		Object.assign(sel.style, {
			position: "absolute",
			inset: "0",
			pointerEvents: "none",
		} satisfies Partial<CSSStyleDeclaration>);
		caret.appendChild(label);
		layer.append(sel, caret);
		el = { caret, label, sel, color };
		peers.set(peer.name, el);
		return el;
	};

	/** Resolve a durable node id + char offset to a viewport rect via a DOM Range.
	 *  The id may point at a block (offset is block-relative, across its text runs)
	 *  or directly at a text run (offset is relative to that run). Returns null —
	 *  never throws — if the id isn't in the doc yet or has no DOM. */
	const rectAt = (
		nodeId: string,
		offset: number,
	): { left: number; top: number; height: number } | null => {
		return session.editor.getEditorState().read(() => {
			let node: LexicalNode;
			try {
				node = $byId(session, nodeId);
			} catch {
				return null; // referenced node not created yet — skip this cursor tick
			}
			let target: LexicalNode | undefined;
			let remaining = offset;
			if ($isTextNode(node)) {
				target = node; // offset is relative to this run
			} else {
				// block: walk its text runs to find the one holding `offset`
				const block = $blockById(session, nodeId);
				const texts = collectTextNodes(block);
				target = texts[0];
				for (const tn of texts) {
					const len = tn.getTextContent().length;
					if (remaining <= len) {
						target = tn;
						break;
					}
					remaining -= len;
				}
			}
			const blockNode = $blockById(session, nodeId);
			const domKey = target?.getKey();
			const blockKey = blockNode.getKey();
			const dom =
				(domKey && session.editor.getElementByKey(domKey)) ||
				session.editor.getElementByKey(blockKey);
			if (!dom) return null;
			const textNode = dom.firstChild ?? dom;
			const range = document.createRange();
			try {
				const max = textNode.textContent?.length ?? 0;
				const pos = Math.max(0, Math.min(remaining, max));
				if (textNode.nodeType === Node.TEXT_NODE) {
					range.setStart(textNode, pos);
					range.setEnd(textNode, pos);
				} else {
					range.selectNodeContents(dom);
					range.collapse(false);
				}
			} catch {
				return null;
			}
			const r = range.getClientRects()[0] ?? range.getBoundingClientRect();
			const cr = container.getBoundingClientRect();
			return {
				left: r.left - cr.left,
				top: r.top - cr.top,
				height: r.height || dom.getBoundingClientRect().height || 18,
			};
		});
	};

	/** Container-relative rects for a [start,end] span (one per wrapped line). */
	const spanRects = (
		nodeId: string,
		start: number,
		end: number,
	): Array<{ left: number; top: number; width: number; height: number }> => {
		return session.editor.getEditorState().read(() => {
			let node: LexicalNode;
			try {
				node = $byId(session, nodeId);
			} catch {
				return [];
			}
			const domEl = $isTextNode(node)
				? session.editor.getElementByKey(node.getKey())
				: session.editor.getElementByKey($blockById(session, nodeId).getKey());
			const textNode = domEl?.firstChild;
			if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return [];
			const maxLen = textNode.textContent?.length ?? 0;
			const range = document.createRange();
			try {
				range.setStart(textNode, Math.max(0, Math.min(start, maxLen)));
				range.setEnd(textNode, Math.max(0, Math.min(end, maxLen)));
			} catch {
				return [];
			}
			const cr = container.getBoundingClientRect();
			return [...range.getClientRects()].map((r) => ({
				left: r.left - cr.left,
				top: r.top - cr.top,
				width: r.width,
				height: r.height,
			}));
		});
	};

	const moveCaret = (el: CursorEl, nodeId: string, at: number) => {
		const pos = rectAt(nodeId, at);
		if (!pos) return;
		el.caret.style.left = `${pos.left}px`;
		el.caret.style.top = `${pos.top}px`;
		el.caret.style.height = `${pos.height}px`;
		el.caret.style.display = "block";
	};

	return {
		apply(peer: ReplayPeer, x: Awareness) {
			const el = ensure(peer);
			if (x.type === "highlight") {
				// Draw the selection (the drag-select you see before a bold/strike/link),
				// then rest the caret at its focus end.
				const rects = spanRects(x.node, x.span?.start ?? 0, x.span?.end ?? 0);
				el.sel.replaceChildren();
				for (const r of rects) {
					const d = document.createElement("div");
					Object.assign(d.style, {
						position: "absolute",
						left: `${r.left}px`,
						top: `${r.top}px`,
						width: `${r.width}px`,
						height: `${r.height}px`,
						background: el.color,
						opacity: "0.3",
						borderRadius: "2px",
					} satisfies Partial<CSSStyleDeclaration>);
					el.sel.appendChild(d);
				}
				moveCaret(el, x.node, x.span?.end ?? 0);
			} else {
				el.sel.replaceChildren(); // a plain cursor clears any selection
				moveCaret(el, x.node, x.at ?? 0);
			}
		},
		clear(peer: ReplayPeer) {
			const el = peers.get(peer.name);
			if (el) {
				el.caret.style.display = "none";
				el.sel.replaceChildren();
			}
		},
		destroy() {
			layer.remove();
			peers.clear();
		},
	};
}
