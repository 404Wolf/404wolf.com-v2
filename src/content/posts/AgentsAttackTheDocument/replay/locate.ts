// Vendored from ai-editing-worker/src/ai-editing/ai-toolkit/locate.ts
// (imports rewritten to local replay modules).
import {
	$getNodeByKey,
	$isElementNode,
	type ElementNode,
	type LexicalNode,
} from "lexical";
import type { LexicalSession } from "./session";

export function $byId(session: LexicalSession, id: string): LexicalNode {
	const key = session.ids.idToNodeKeyMap.get(id);
	const node = key != null ? $getNodeByKey(key) : null;
	if (!node) {
		throw new Error(`No node with id "${id}"`);
	}
	return node;
}

/**
 * Lock onto a block by id. Since every node carries an id (including inline
 * text/link spans), an id that points at an inline node resolves UP to its
 * nearest block-level element (the containing paragraph, heading, list item,
 * quote, …). Throws `Error` only if nothing block-level is found.
 */
export function $blockById(session: LexicalSession, id: string): ElementNode {
	let node: LexicalNode | null = $byId(session, id);
	while (node && !($isElementNode(node) && !node.isInline())) {
		node = node.getParent();
	}
	if (!node || !$isElementNode(node)) {
		throw new Error(`No block-level node for id "${id}"`);
	}
	return node;
}
