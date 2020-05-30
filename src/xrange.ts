export type XRange = Generator<number, number>;

export interface Predicate {
	(next: number, memo: ReadonlyArray<number | undefined>): boolean;
}

/** @private */
type NextFactoryMemo = [ number, ...(number | undefined)[] ];

export interface NextFactory {
	(memo: Readonly<NextFactoryMemo>): number;
}

/** @internal */
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

		curr = +next(memo as NextFactoryMemo);
	}

	return NaN;
}
