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

    // public equals(obj: Cell) {
    //     return this.x == obj.x && this.y == obj.y && this.cellType == obj.cellType;
    // }
    
    // public hashCode(obj: MyBean) {
    //     return obj.id
    // }
}