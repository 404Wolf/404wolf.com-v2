// Trimmed from ai-editing-worker/src/ai-editing/ai-toolkit/session.ts.
// The replay engine only needs core Lexical nodes (root/paragraph/text/
// linebreak) plus the durable-id plugin — no markdown loader, no code
// highlighting, no custom-node zoo. Add nodes here only as traces require them.
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { MarkNode } from "@lexical/mark";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
	$createParagraphNode,
	$getRoot,
	createEditor,
	type Klass,
	type LexicalEditor,
	type LexicalNode,
	type SerializedEditorState,
} from "lexical";
import { $updateAllNodeIds, type NodeIdMappings, nodeIdPlugin } from "./nodeId";

export type LexicalSession = {
	editor: LexicalEditor;
	ids: NodeIdMappings;
};

/** Core nodes (root/paragraph/text/linebreak) are always registered by Lexical;
 *  richer block nodes a trace can use are appended here. CodeHighlightNode lets a
 *  serialized code block with tokenized children parse even though we don't run
 *  prism at replay (code still renders; it's just uncolored). */
const REPLAY_NODES: ReadonlyArray<Klass<LexicalNode>> = [
	HeadingNode,
	QuoteNode,
	CodeNode,
	CodeHighlightNode,
	LinkNode,
	MarkNode,
];

export function createReplaySession(rootElement?: HTMLElement): LexicalSession {
	const ids: NodeIdMappings = {
		idToNodeKeyMap: new Map(),
		nodeKeyToIdMap: new Map(),
	};
	const editor = createEditor({
		nodes: [...REPLAY_NODES],
		editable: false,
		// Lexical applies inline formats via theme classes; without these, bold/
		// italic/strike/etc. set the format bit but render with no visible styling.
		// The blog provides CSS for these classes (see ReplayEditor).
		theme: {
			text: {
				bold: "rt-bold",
				italic: "rt-italic",
				underline: "rt-underline",
				strikethrough: "rt-strike",
				code: "rt-code",
			},
			mark: "rt-mark",
			markOverlap: "rt-mark-overlap",
		},
		onError: (error) => {
			throw error;
		},
	});
	nodeIdPlugin({ nodes: REPLAY_NODES, mappings: ids })(editor);
	if (rootElement) editor.setRootElement(rootElement);
	return { editor, ids };
}

/** Load a document from a serialized editor-state snapshot. */
export function loadSnapshot(
	session: LexicalSession,
	raw: SerializedEditorState,
): void {
	// Lexical forbids an empty root; seed a single empty paragraph instead.
	if (raw.root.children.length === 0) {
		session.editor.update(
			() => {
				const root = $getRoot();
				root.clear();
				root.append($createParagraphNode());
			},
			{ discrete: true },
		);
	} else {
		session.editor.setEditorState(session.editor.parseEditorState(raw));
	}
	session.editor.update(
		() => {
			$updateAllNodeIds(session.ids);
		},
		{ discrete: true },
	);
}
