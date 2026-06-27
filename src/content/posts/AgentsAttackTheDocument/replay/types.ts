// Mirrors the worker's replay-trace.ts + queue Awareness type.
import type { SerializedEditorState } from "lexical";
import type { DocumentOp, NodeRef, Offset, Span } from "./ops";

/** A writer's cursor/selection at a moment in time. */
export type Awareness =
	| { type: "cursor"; node: NodeRef; at?: Offset }
	| { type: "highlight"; node: NodeRef; span?: Span };

export type ReplayPeer = { name: string; color: string };

export type ReplayEvent = { t: number; peer: ReplayPeer } & (
	| { kind: "edit"; op: DocumentOp }
	| { kind: "awareness"; x: Awareness }
	| { kind: "clear" }
);

export type ReplayTrace = {
	initial: SerializedEditorState;
	events: ReplayEvent[];
};
