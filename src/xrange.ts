import type XRange from "./typings/xrange";
import type Predicate from "./typings/predicate";
import type NextFactory from "./typings/next-factory";
import type { Memo } from "./typings/next-factory";

export type { XRange, Predicate, NextFactory };

export default function* xrangeFunctional(start: number, predicate: Predicate, next: NextFactory, maxMemo = Infinity): XRange {
	const memoNeeded = maxMemo > 0 && (predicate.length >= 2 || next.length >= 1);
	const memo: number[] = [];

	let curr = +start;

	while (predicate(curr, memo)) {
		yield curr;

		if (memoNeeded) {
			memo.unshift(curr);

			if (memo.length > maxMemo)
				memo.pop();
		}

		curr = +next(memo as Memo);
	}

	return NaN;
}
