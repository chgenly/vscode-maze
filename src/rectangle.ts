export class Rectangle {
    public static xywh(x: number, y: number, w: number,  h: number): Rectangle {
        return new Rectangle(x, y, x+w, y+h);
    }
    
    public static xyxy(x1: number, y1: number, x2: number,  y2: number): Rectangle {
        return new Rectangle(x1, y1, x2, y2);
    }
    
    constructor(
        public readonly x1: number, public readonly y1: number,
        public readonly x2: number, public readonly y2: number) {
    }

    get width(): number {
        return this.x2 - this.x1;
    }

    get height(): number {
        return this.y2 - this.y1;
    }

    public isAboveBottom(r: Rectangle) {
        return this.y2 < r.y2;
    }

    public isBelowTop(r: Rectangle) {
        return this.y1 > r.y1;
    }

    public isLeftOfRight(r: Rectangle) {
        return this.x2 < r.x2;
    }

    public isRightOfLeft(r: Rectangle) {
        return this.x1 > r.x1;
    }

    public alignTopWith(top: number): Rectangle {
        return Rectangle.xywh(this.x1, top, this.width, this.height);
    }
 
    public alignBottomWith(bottom: number): Rectangle {
        return Rectangle.xywh(this.x1, bottom-this.height, this.width, this.height);
    }

    public alignLeftWith(left: number): Rectangle {
        return Rectangle.xywh(left, this.y1, this.width, this.height);
    }

    public alignRightWith(right: number): Rectangle {
        return Rectangle.xywh(right-this.width, this.y1, this.width, this.height);
    }

    public toString(): string {
        return `rect ${this.x1}, ${this.y1} -- ${this.x2}, ${this.y2} w=${this.width} h=${this.height}`;
    }
}