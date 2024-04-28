export enum CellType {
    ZERO = 0,
    ONE,
    TWO,
    THREE,
    FOUR,
    FIVE,
    SIX,
    SEVEN,
    EIGHT,
    BOMB,
    UNKNOWN,
    FLAG,
    FREE,
}

export class Cell {
	public readonly x: number;
	public readonly y: number;
	public readonly cellType: CellType;

	public constructor(x: number, y: number, cellType: CellType) {
		this.x = x;
		this.y = y;
		this.cellType = cellType;
	}
}