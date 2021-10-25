export type Memo = [ number, ...(number | undefined)[] ];

export default interface NextFactory {
	(memo: Readonly<Memo>): number;
}
