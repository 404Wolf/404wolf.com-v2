// Trimmed replay-side `Doc.apply`. Handles the op kinds a text-y trace emits
// (insertText / removeText / insertNode / insertInline / insertTextAfterInline)
// using core Lexical + the durable-id system. The keystroke-level helpers are
// copied verbatim from the worker's doc.ts so behavior matches exactly. Add op
// kinds here as richer traces require them.
import { $createCodeNode } from "@lexical/code";
import {
	$createHeadingNode,
	$createQuoteNode,
	type HeadingTagType,
} from "@lexical/rich-text";
import {
	$createLineBreakNode,
	$createParagraphNode,
	$createTextNode,
	$getRoot,
	$isTextNode,
	type ElementNode,
	type LexicalNode,
} from "lexical";
import { match } from "ts-pattern";
import * as inline from "./inline";
import { $blockById, $byId } from "./locate";
import { $setId, $updateAllNodeIds } from "./nodeId";
import type { DocumentOp, NodeSpec, Offset, Position } from "./ops";
import type { LexicalSession } from "./session";
import { collectTextNodes } from "./tree";

/** Apply one recorded op to the session's document, in a discrete update. */
export function applyOp(session: LexicalSession, op: DocumentOp): void {
	session.editor.update(
		() => {
			match(op)
				.with({ kind: "setText" }, (e) => {
					// Mirror the worker's $setText: REUSE the first text node (preserving
					// its durable id) and drop the rest, so a later op that targets that
					// id still resolves. (Clearing the block would destroy that id.)
					const block = $blockById(session, e.node);
					const children = block.getChildren();
					const existing = children.find($isTextNode);
					if (existing) {
						existing.setTextContent(e.text);
						existing.setFormat(0);
						for (const child of children)
							if (child !== existing) child.remove();
					} else {
						block.clear();
						if (e.text) block.append($createTextNode(e.text));
					}
				})
				.with({ kind: "insertText" }, (e) => {
					// A text-node target (the typing animation growing a specific run, e.g.
					// text typed after an inline node) inserts within that run; a block
					// target inserts at an offset across the block's text.
					const target = $byId(session, e.node);
					if ($isTextNode(target)) {
						const c = target.getTextContent();
						target.setTextContent(c.slice(0, e.at) + e.text + c.slice(e.at));
					} else {
						insertTextAt($blockById(session, e.node), e.at, e.text);
					}
				})
				.with({ kind: "removeText" }, (e) =>
					removeTextAt($blockById(session, e.node), e.at, e.len),
				)
				.with({ kind: "insertNode" }, (e) => {
					let node: LexicalNode = buildNode(e.spec);
					if (node.isInline()) {
						const p = $createParagraphNode();
						p.append(node);
						node = p;
					}
					place(session, node, e.at);
					assignRef(session, e.ref, node);
				})
				.with({ kind: "insertInline" }, (e) => {
					const inline = buildNode(e.spec);
					insertInlineAt($blockById(session, e.node), e.at, inline);
					assignRef(session, e.ref, inline);
				})
				.with({ kind: "insertTextAfterInline" }, (e) => {
					const tn = $createTextNode(e.text);
					$byId(session, e.inline).insertAfter(tn);
					// The typing animation stamps a ref so follow-up insertText ops can
					// grow this run; the one-shot path leaves it unref'd.
					if (e.ref !== undefined) assignRef(session, e.ref, tn);
				})
				// --- inline formatting (match-based; split runs, toggle/wrap) ---
				.with({ kind: "formatText" }, (e) => {
					const block = $blockById(session, e.node);
					if (e.on)
						inline.$formatTextInBlock(block, e.match, e.format, e.scope);
					else inline.$clearFormat(block, e.match, e.format, e.scope);
				})
				.with({ kind: "clearFormat" }, (e) => {
					const block = $blockById(session, e.node);
					if (e.match === undefined) inline.$stripFormat(block);
					else inline.$clearFormat(block, e.match, undefined, e.scope);
				})
				.with({ kind: "linkText" }, (e) => {
					const block = $blockById(session, e.node);
					if (e.url !== null)
						inline.$wrapInLink(block, e.match, e.url, e.scope);
					else inline.$unwrapFromLink(block, e.match, e.scope);
				})
				.with({ kind: "markText" }, (e) => {
					const block = $blockById(session, e.node);
					if (e.on) inline.$highlightInBlock(block, e.match, e.scope);
					else inline.$unhighlightInBlock(block, e.match, e.scope);
				})
				.with({ kind: "replaceText" }, (e) =>
					inline.$replaceString(
						$blockById(session, e.node),
						e.find,
						e.to,
						e.scope,
					),
				)
				.with({ kind: "appendText" }, (e) =>
					inline.$appendText($blockById(session, e.node), e.text),
				)
				.with({ kind: "prependText" }, (e) =>
					inline.$prependText($blockById(session, e.node), e.text),
				)
				.otherwise((e) => {
					// Don't abort the whole replay on an op we haven't taught the blog
					// yet — skip it and surface it so we can add a handler.
					console.warn(`[replay] skipping unsupported op kind "${e.kind}"`);
				});
		},
		{ discrete: true },
	);
}

/** Turn a declarative spec into a Lexical node (replay subset). */
function buildNode(spec: NodeSpec): LexicalNode {
	if ("inline" in spec) {
		if (spec.inline === "linebreak") return $createLineBreakNode();
		throw new Error(`replay: unsupported inline spec ${JSON.stringify(spec)}`);
	}
	switch (spec.block) {
		case "paragraph":
			return withText($createParagraphNode(), spec.text);
		case "heading":
			return withText(
				$createHeadingNode(`h${spec.level}` as HeadingTagType),
				spec.text,
			);
		case "quote":
			return withText($createQuoteNode(), spec.text);
		case "code":
			// Standard code block; offsets are character counts, so it replays the
			// same whether or not it's syntax-tokenized (we don't run prism here).
			return withText($createCodeNode(spec.language), spec.text);
		default:
			throw new Error(`replay: unsupported block spec ${JSON.stringify(spec)}`);
	}
}

/** Append a single plain-text run to a freshly built block, if any. */
function withText(block: ElementNode, text?: string): ElementNode {
	if (text) block.append($createTextNode(text));
	return block;
}

/** Stamp the server-minted ref as the node's durable id (refs ARE ids). */
function assignRef(
	session: LexicalSession,
	ref: string,
	node: LexicalNode,
): void {
	$setId(node, ref);
	$updateAllNodeIds(session.ids);
}

/** Resolve an insert anchor to a sibling, climbing past inline nodes. */
function anchor(session: LexicalSession, id: string): LexicalNode {
	let node: LexicalNode | null = $byId(session, id);
	while (node.isInline() && node.getParent()) {
		node = node.getParent() as LexicalNode;
	}
	return node;
}

function place(session: LexicalSession, node: LexicalNode, at: Position): void {
	if ("after" in at) anchor(session, at.after).insertAfter(node);
	else if ("before" in at) anchor(session, at.before).insertBefore(node);
	else if ("appendToRoot" in at) $getRoot().append(node);
	else {
		const first = $getRoot().getFirstChild();
		if (first) first.insertBefore(node);
		else $getRoot().append(node);
	}
}

// --- keystroke-level helpers (verbatim from doc.ts) ---

/** Insert plain `text` at char offset `at` within a block. */
function insertTextAt(block: ElementNode, at: Offset, text: string): void {
	const texts = collectTextNodes(block);
	if (texts.length === 0) {
		block.append($createTextNode(text));
		return;
	}
	const total = texts.reduce((n, t) => n + t.getTextContent().length, 0);
	if (at <= 0) {
		const first = texts[0]!;
		if (first.getFormat() !== 0) first.insertBefore($createTextNode(text));
		else first.setTextContent(text + first.getTextContent());
		return;
	}
	if (at >= total) {
		const last = texts[texts.length - 1]!;
		if (last.getFormat() !== 0) last.insertAfter($createTextNode(text));
		else last.setTextContent(last.getTextContent() + text);
		return;
	}
	let remaining = at;
	for (const tn of texts) {
		const content = tn.getTextContent();
		if (remaining <= content.length) {
			tn.setTextContent(
				content.slice(0, remaining) + text + content.slice(remaining),
			);
			return;
		}
		remaining -= content.length;
	}
}

/** Remove `len` chars starting at offset `at`, spanning text nodes as needed. */
function removeTextAt(block: ElementNode, at: Offset, len: number): void {
	let skip = at;
	let left = len;
	for (const tn of collectTextNodes(block)) {
		if (left <= 0) break;
		const content = tn.getTextContent();
		if (skip >= content.length) {
			skip -= content.length;
			continue;
		}
		const start = skip;
		const end = Math.min(content.length, start + left);
		tn.setTextContent(content.slice(0, start) + content.slice(end));
		left -= end - start;
		skip = 0;
	}
}

/** Insert an inline node at char offset `at` within a block. */
function insertInlineAt(
	block: ElementNode,
	at: Offset,
	inline: LexicalNode,
): void {
	let remaining = at;
	for (const tn of collectTextNodes(block)) {
		const len = tn.getTextContent().length;
		if (remaining <= len) {
			if (remaining === 0) tn.insertBefore(inline);
			else if (remaining >= len) tn.insertAfter(inline);
			else {
				const [, tail] = tn.splitText(remaining);
				(tail ?? tn).insertBefore(inline);
			}
			return;
		}
		remaining -= len;
	}
	block.append(inline);
}
