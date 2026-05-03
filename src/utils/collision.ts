export interface AABB {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Circle {
    x: number;
    y: number;
    radius: number;
}

export class CollisionJS {
    static checkAABBCollision(
        ax: number, ay: number, aw: number, ah: number,
        bx: number, by: number, bw: number, bh: number
    ): boolean {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    static checkAABBPrecise(
        ax: number, ay: number, aw: number, ah: number,
        bx: number, by: number, bw: number, bh: number
    ): boolean {
        if (ax > bx + bw || ax + aw < bx) return false;
        if (ay > by + bh || ay + ah < by) return false;
        return true;
    }

    static checkCircleAABB(
        cx: number, cy: number, radius: number,
        bx: number, by: number, bw: number, bh: number
    ): boolean {
        const nearestX = Math.max(bx, Math.min(cx, bx + bw));
        const nearestY = Math.max(by, Math.min(cy, by + bh));

        const dx = cx - nearestX;
        const dy = cy - nearestY;

        return (dx * dx + dy * dy) < (radius * radius);
    }

    static checkCircleCircle(
        c1x: number, c1y: number, r1: number,
        c2x: number, c2y: number, r2: number
    ): boolean {
        const dx = c1x - c2x;
        const dy = c1y - c2y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = r1 + r2;
        return distSq < (radiusSum * radiusSum);
    }

    static calculateOverlap(ax: number, aw: number, bx: number, bw: number): number {
        const aLeft = ax;
        const aRight = ax + aw;
        const bLeft = bx;
        const bRight = bx + bw;

        if (aRight <= bLeft || bRight <= aLeft) return 0;

        const overlapLeft = Math.max(aLeft, bLeft);
        const overlapRight = Math.min(aRight, bRight);

        return overlapRight - overlapLeft;
    }

    static calculateOverlapY(ay: number, ah: number, by: number, bh: number): number {
        const aTop = ay;
        const aBottom = ay + ah;
        const bTop = by;
        const bBottom = by + bh;

        if (aBottom <= bTop || bBottom <= aTop) return 0;

        const overlapTop = Math.max(aTop, bTop);
        const overlapBottom = Math.min(aBottom, bBottom);

        return overlapBottom - overlapTop;
    }

    static checkCollisionWithResponse(
        ax: number, ay: number, aw: number, ah: number,
        bx: number, by: number, bw: number, bh: number,
        _playerVelX: number, _playerVelY: number
    ): number {
        if (!this.checkAABBCollision(ax, ay, aw, ah, bx, by, bw, bh)) {
            return 0;
        }

        const overlapX = this.calculateOverlap(ax, aw, bx, bw);
        const overlapY = this.calculateOverlapY(ay, ah, by, bh);

        if (overlapX < overlapY) {
            if (ax < bx) {
                return 1;
            } else {
                return 2;
            }
        } else {
            if (ay < by) {
                return 3;
            } else {
                return 4;
            }
        }
    }

    static isPointInAABB(px: number, py: number, ax: number, ay: number, aw: number, ah: number): boolean {
        return px >= ax && px <= ax + aw && py >= ay && py <= ay + ah;
    }

    static isPointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
        const dx = px - cx;
        const dy = py - cy;
        return (dx * dx + dy * dy) <= (radius * radius);
    }
}
