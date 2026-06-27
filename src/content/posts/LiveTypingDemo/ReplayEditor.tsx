import { useEffect, useRef } from "react";
import { createCursorLayer } from "./replay/cursors";
import { playTimeline } from "./replay/player";
import { createReplaySession, loadSnapshot } from "./replay/session";
import type { ReplayTrace } from "./replay/types";

type Props = {
	trace: ReplayTrace;
	/** Playback speed multiplier; 1 = the exact recorded pace. */
	speed?: number;
	/** Cap on any single pause (ms) — preserves natural rhythm while clamping
	 *  pathological multi-second "thinking" gaps. */
	maxGapMs?: number;
};

/**
 * Read-only Lexical editor that replays a recorded edit timeline with live AI
 * cursors — the document types itself out exactly as it was written. Mounts
 * Lexical directly via setRootElement (no @lexical/react).
 */
export default function ReplayEditor({
	trace,
	speed = 1,
	maxGapMs = 1500,
}: Props) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const startedRef = useRef(false);

	useEffect(() => {
		const wrap = wrapRef.current;
		const root = rootRef.current;
		if (!wrap || !root || startedRef.current) return;
		startedRef.current = true;

		const session = createReplaySession(root);
		loadSnapshot(session, trace.initial);
		const cursors = createCursorLayer(session, wrap);

		const ctrl = new AbortController();
		playTimeline(session, trace.events, {
			speed,
			maxGapMs,
			signal: ctrl.signal,
			onAwareness: (peer, x) => cursors.apply(peer, x),
			onClear: (peer) => cursors.clear(peer),
		}).catch((err) => {
			if (!ctrl.signal.aborted) console.error("[replay] failed", err);
		});

		return () => {
			ctrl.abort();
			cursors.destroy();
		};
	}, [trace, speed, maxGapMs]);

	return (
		<div ref={wrapRef} style={{ position: "relative", marginTop: "2.5rem" }}>
			<style>
				{".replay-editor > :first-child { margin-top: 0; }" +
					".replay-editor > :last-child { margin-bottom: 0; }" +
					".replay-editor .rt-bold { font-weight: 700; }" +
					".replay-editor .rt-italic { font-style: italic; }" +
					".replay-editor .rt-underline { text-decoration: underline; }" +
					".replay-editor .rt-strike { text-decoration: line-through; }" +
					".replay-editor .rt-underline.rt-strike { text-decoration: underline line-through; }" +
					".replay-editor .rt-code { font-family: ui-monospace, monospace; background: rgba(0,0,0,0.06); padding: 0 0.2em; border-radius: 3px; }" +
					".replay-editor .rt-mark, .replay-editor mark { background: #fde68a; color: inherit; border-radius: 2px; padding: 0 0.05em; }"}
			</style>
			<div
				ref={rootRef}
				className="replay-editor"
				style={{ whiteSpace: "pre-wrap", outline: "none" }}
			/>
		</div>
	);
}
