import type { Predicate, NextFactory } from "../src/xrange";

import xrange from "../src/xrange";
import { REASONABLY_LARGE_NUMBER, takeProbe } from "./helpers";

it("should yield the value specified by the `next` function", () => {
	const range1 = xrange(0, (next) => next < 5, ([ last ]) => last + 1);
	const range2 = xrange(0, (next) => next > -5, ([ last ]) => last - 1);

	expect(Array.from(range1)).toEqual([ 0, 1, 2, 3, 4 ]);
	expect(Array.from(range2)).toEqual([ 0, -1, -2, -3, -4 ]);
});

it("should yield the same value if the `next` function returns a constant", () => {
	const limit = REASONABLY_LARGE_NUMBER / 4;
	const value = 42;
	const range = xrange(value, () => true, () => value);

	for (let iterations = 0; iterations < limit; iterations++)
		expect(range.next().value).toEqual(value);
});

it("should cast result of `next` to a number", () => {
	let value = 0;

	const obj = {
		valueOf() {
			return ++value;
		},
	};

	const range = xrange(value, (next) => next < 5, () => (obj as number));

	expect(Array.from(range)).toEqual([ 0, 1, 2, 3, 4 ]);
});

it("should iterate indefinitely if `predicate` always returns `true`", () => {
	const range = xrange(0, () => true, () => 1);
	let last = range.next();

	for (let iterations = 0; iterations < REASONABLY_LARGE_NUMBER; iterations++)
		last = range.next();

	expect(last.done).toBe(false);
});

it("should not iterate if `predicate` always returns `false`", () => {
	let value = 0;

	for (const _ of xrange(0, () => false, () => 1))
		++value;

	expect(value).toBe(0);
});

describe("working with the `memo` list", () => {
	const START = 6;
	const STOP = 9;

	const list: number[] = [];

	beforeEach(() => {
		list.length = 0;
	});

	afterEach(() => {
		expect(list).toEqual([ 6, 7, 8 ]);
	});

	it("should fill `memo` if it is used in the `predicate`", () => {
		const expectedMemos = [
			[],
			[6],
			[7, 6],
			[8, 7, 6],
		] as const;

		let callCount = 0;

		const shouldGo: Predicate = (next, memo) => {
			expect(memo).toEqual(expectedMemos[callCount++]);

			return next < STOP;
		};

		list.push(...xrange(START, shouldGo, ([ last ]) => last + 1));
	});

	it("should fill `memo` if it is used in the `next` function", () => {
		const expectedMemos = [
			[6],
			[7, 6],
			[8, 7, 6],
		] as const;

		let callCount = 0;

		const getNext: NextFactory = (memo) => {
			expect(memo).toEqual(expectedMemos[callCount++]);

			return memo[0] + 1;
		};

		list.push(...xrange(START, (next) => next < STOP, getNext));
	});

	it("should allow optimizing length of `memo`", () => {
		const maxMemo = 2;

		const expectedCalls = {
			shouldGo: [
				[ 6, [] ],
				[ 7, [ 6 ] ],
				[ 8, [ 7, 6 ] ],
				[ 9, [ 8, 7 ] ],
			],
			getNext: [
				[ [ 6 ] ],
				[ [ 7, 6 ] ],
				[ [ 8, 7 ] ],
			],
		} as const;

		let callCount = 0;

		const shouldGo: Predicate = (next, memo) => {
			const [ nextExpected, memoExpected ] = expectedCalls.shouldGo[callCount];

			expect(next).toEqual(nextExpected);
			expect(memo).toEqual(memoExpected);

			return next < STOP;
		};

		const getNext: NextFactory = (memo) => {
			const [ memoExpected ] = expectedCalls.getNext[callCount];

			expect(memo).toEqual(memoExpected);

			callCount++;

			return memo[0] + 1;
		};

		list.push(...xrange(START, shouldGo, getNext, maxMemo));
	});

	it("should not fill `memo` if it is unused", () => {
		let curr = START;

		const shouldGo: Predicate = (...args) => {
			expect(args[1]).toEqual([]);

			return curr < STOP;
		};

		const getNext: NextFactory = (...args) => {
			expect(args[0]).toEqual([]);

			return ++curr;
		};

		list.push(...xrange(curr, shouldGo, getNext));
	});
});

describe("producing number sequences", () => {
	const sum: NextFactory = (numbers) => numbers.reduce((sum, num) => sum! + num!, 0) as number;

	test.each(<const> [
		[ "Fibonacci", 2, [ 1, 1, 2, 3, 5, 8 ] ],
		[ '"pentanacci"', 5, [ 1, 1, 2, 4, 8, 16, 31, 61, 120, 236 ] ],
	])("should produce %s sequence", (name, maxMemo, sequenceExcerpt) => {
		const probe = takeProbe(sequenceExcerpt.length, xrange(1, () => true, sum, maxMemo));
		const last = probe[probe.length - 1];
		const numbers = probe.map((item) => item.value);

		expect(numbers).toEqual(sequenceExcerpt);
		expect(last.done).toBe(false);
	});
});
