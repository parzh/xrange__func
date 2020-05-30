import type { XRange } from "../src/xrange";

export const REASONABLY_LARGE_NUMBER = 5184;

export function takeProbe(probeLength: number, range: XRange): readonly IteratorResult<number, number>[] {
	const probe: IteratorResult<number, number>[] = [];

	for (let i = 0; i < probeLength; i++)
		probe.push(range.next());

	return probe;
}
