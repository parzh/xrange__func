export default interface Predicate {
	(next: number, memo: ReadonlyArray<number | undefined>): boolean;
}
