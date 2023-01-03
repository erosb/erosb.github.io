"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const fixedMaps_1 = require("./fixedMaps");
expect.extend({
    toMatchPositions(received, expected) {
        if (expected.length != received.length) {
            return {
                message: () => `expected ${expected.length} positions, received ${received.length}`,
                pass: false
            };
        }
        for (let expPos of expected) {
            let found = false;
            for (let recPos of received) {
                if (expPos.status === recPos.status
                    && expPos.xOffset === recPos.xOffset
                    && expPos.yOffset === recPos.yOffset) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return {
                    message: () => `expected ${expPos.status} position at (${expPos.xOffset}, ${expPos.yOffset}) is not found`,
                    pass: false
                };
            }
        }
        return {
            message: () => "passed",
            pass: true
        };
    }
});
describe("main", () => {
    it("fails if the arrow hits wall", () => __awaiter(void 0, void 0, void 0, function* () {
        const changeListener = jest.fn();
        const main = new _1.Main(() => new _1.GameMap({}), changeListener);
        yield main.executeProgram([_1.UP, _1.LEFT]);
        expect(changeListener.mock.calls[0][0]).toEqual({
            type: "FINAL",
            success: false,
            processedStep: {
                dir: _1.UP,
                index: 0
            }
        });
    }));
    it("goes in the direction if possible", () => __awaiter(void 0, void 0, void 0, function* () {
        const changeListener = jest.fn();
        const main = new _1.Main(() => new _1.GameMap({
            UP: {
                LEFT: {}
            },
            RIGHT: {}
        }), changeListener);
        yield main.executeProgram([_1.UP, _1.LEFT]);
        expect(changeListener.mock.calls[0][0]).toEqual({
            type: "MOVE",
            success: true,
            processedStep: {
                dir: _1.UP,
                index: 0
            }
        });
        expect(changeListener.mock.calls[1][0]).toEqual({
            type: "MOVE",
            success: true,
            processedStep: {
                dir: _1.LEFT,
                index: 1
            }
        });
    }));
});
describe("fixed position creation", () => {
    function empty(xOffset, yOffset) {
        return new _1.FixedPosition(_1.EMPTY, xOffset, yOffset);
    }
    it("creates fixed positions from GameMap", () => {
        const actual = fixedMaps_1.map1.toFixedPositions();
        expect(actual).toMatchPositions([
            new _1.FixedPosition(_1.DOG, 0, 0),
            empty(1, 0),
            empty(2, 0),
            empty(2, -1),
            empty(2, 1),
            empty(2, 2),
            empty(3, 1),
            empty(4, 1),
            empty(5, 1),
            new _1.FixedPosition(_1.BONE, 5, 0)
        ]);
    });
});
describe("Tiles", () => {
    it("dispatches state change event to subscriber", () => __awaiter(void 0, void 0, void 0, function* () {
        const main = new _1.Main(() => new _1.GameMap({
            RIGHT: {
                RIGHT: {
                    BONE: {}
                }
            }
        }), () => { });
        const tiles = main.getTiles();
        const listener0 = jest.fn(), listener1 = jest.fn(), listener2 = jest.fn();
        tiles[0].onStatusChange(listener0);
        tiles[1].onStatusChange(listener1);
        tiles[2].onStatusChange(listener2);
        yield main.executeProgram([_1.RIGHT, _1.RIGHT]);
        expect(listener0).toHaveBeenCalledWith(_1.VISITED);
        expect(listener1).toHaveBeenCalledWith(_1.DOG);
        expect(listener1).toHaveBeenCalledWith(_1.VISITED);
        expect(listener2).toHaveBeenCalledWith(_1.DOG);
    }));
});
describe("executeProgram", () => {
    it("does nothing on empty program", () => __awaiter(void 0, void 0, void 0, function* () {
        const listener = jest.fn();
        const main = new _1.Main(() => fixedMaps_1.map1, listener);
        yield main.executeProgram([]);
        expect(listener).not.toHaveBeenCalled();
    }));
    it("dispatches 1 move", () => __awaiter(void 0, void 0, void 0, function* () {
        const listener = jest.fn();
        const main = new _1.Main(() => fixedMaps_1.map1, listener);
        yield main.executeProgram([_1.RIGHT]);
        expect(listener).toHaveBeenCalled();
    }));
});
