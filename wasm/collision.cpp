#include <emscripten/emscripten.h>
#include <cmath>
#include <vector>

struct AABB {
    float x;
    float y;
    float width;
    float height;
};

struct Circle {
    float x;
    float y;
    float radius;
};

extern "C" {

EMSCRIPTEN_KEEPALIVE
bool checkAABBCollision(float ax, float ay, float aw, float ah,
                        float bx, float by, float bw, float bh) {
    AABB a = {ax, ay, aw, ah};
    AABB b = {bx, by, bw, bh};

    return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
}

EMSCRIPTEN_KEEPALIVE
bool checkAABBPrecise(float ax, float ay, float aw, float ah,
                      float bx, float by, float bw, float bh) {
    if (ax > bx + bw || ax + aw < bx) return false;
    if (ay > by + bh || ay + ah < by) return false;
    return true;
}

EMSCRIPTEN_KEEPALIVE
bool checkCircleAABB(float cx, float cy, float radius,
                    float bx, float by, float bw, float bh) {
    float nearestX = std::max(bx, std::min(cx, bx + bw));
    float nearestY = std::max(by, std::min(cy, by + bh));

    float dx = cx - nearestX;
    float dy = cy - nearestY;

    return (dx * dx + dy * dy) < (radius * radius);
}

EMSCRIPTEN_KEEPALIVE
bool checkCircleCircle(float c1x, float c1y, float r1,
                       float c2x, float c2y, float r2) {
    float dx = c1x - c2x;
    float dy = c1y - c2y;
    float distSq = dx * dx + dy * dy;
    float radiusSum = r1 + r2;
    return distSq < (radiusSum * radiusSum);
}

EMSCRIPTEN_KEEPALIVE
float calculateOverlap(float ax, float aw, float bx, float bw) {
    float aLeft = ax;
    float aRight = ax + aw;
    float bLeft = bx;
    float bRight = bx + bw;

    if (aRight <= bLeft || bRight <= aLeft) return 0.0f;

    float overlapLeft = std::max(aLeft, bLeft);
    float overlapRight = std::min(aRight, bRight);

    return overlapRight - overlapLeft;
}

EMSCRIPTEN_KEEPALIVE
float calculateOverlapY(float ay, float ah, float by, float bh) {
    float aTop = ay;
    float aBottom = ay + ah;
    float bTop = by;
    float bBottom = by + bh;

    if (aBottom <= bTop || bBottom <= aTop) return 0.0f;

    float overlapTop = std::max(aTop, bTop);
    float overlapBottom = std::min(aBottom, bBottom);

    return overlapBottom - overlapTop;
}

EMSCRIPTEN_KEEPALIVE
int checkCollisionWithResponse(float ax, float ay, float aw, float ah,
                               float bx, float by, float bw, float bh,
                               float playerVelX, float playerVelY) {
    if (!checkAABBCollision(ax, ay, aw, ah, bx, by, bw, bh)) {
        return 0;
    }

    float overlapX = calculateOverlap(ax, aw, bx, bw);
    float overlapY = calculateOverlapY(ay, ah, by, bh);

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

EMSCRIPTEN_KEEPALIVE
bool isPointInAABB(float px, float py, float ax, float ay, float aw, float ah) {
    return (px >= ax && px <= ax + aw && py >= ay && py <= ay + ah);
}

EMSCRIPTEN_KEEPALIVE
bool isPointInCircle(float px, float py, float cx, float cy, float radius) {
    float dx = px - cx;
    float dy = py - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
}

}
