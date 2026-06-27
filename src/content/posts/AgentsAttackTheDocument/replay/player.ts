import { applyOp } from "./apply";
import type { LexicalSession } from "./session";
import type { Awareness, ReplayEvent, ReplayPeer } from "./types";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type PlayOptions = {
	/** Playback speed multiplier (1 = recorded pace). */
	speed?: number;
	/** Clamp inter-event gaps (collapses multi-second LLM "thinking" pauses). */
	maxGapMs?: number;
	onAwareness?: (peer: ReplayPeer, x: Awareness) => void;
	onClear?: (peer: ReplayPeer) => void;
	signal?: AbortSignal;
};

/**
 * Replay a recorded timeline against a live session: edits are applied through
 * the same op-apply path that produced them; awareness/clear drive the cursor
 * UI. Events are scheduled by their recorded `t` (gap-clamped + speed-scaled).
 */
export async function playTimeline(
	session: LexicalSession,
	events: ReplayEvent[],
	opts: PlayOptions = {},
): Promise<void> {
	const speed = opts.speed ?? 1;
	const maxGap = opts.maxGapMs ?? 400;
	let prev = events.length > 0 ? events[0]!.t : 0;
	for (const e of events) {
		if (opts.signal?.aborted) return;
		const gap = Math.min(Math.max(0, e.t - prev), maxGap) / speed;
		prev = e.t;
		if (gap > 0) await sleep(gap);
		if (opts.signal?.aborted) return;
		if (e.kind === "edit") {
			// Per-op resilience, mirroring the worker's runQueue: an op can target a
			// node a concurrent peer already removed/replaced (these fail in capture
			// too and are non-fatal). Skip it and keep playing rather than aborting.
			try {
				applyOp(session, e.op);
			} catch (err) {
				console.warn("[replay] skipped op", e.op.kind, (err as Error).message);
			}
		} else if (e.kind === "awareness") {
			opts.onAwareness?.(e.peer, e.x);
		} else {
			opts.onClear?.(e.peer);
		}
	}
}
