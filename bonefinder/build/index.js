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
exports.Main = exports.ProgramBuilder = exports.FixedPosition = exports.GameMap = exports.VISITED = exports.DOG = exports.EMPTY = exports.BONE = exports.LEFT = exports.RIGHT = exports.DOWN = exports.UP = void 0;
exports.UP = "UP";
exports.DOWN = "DOWN";
exports.RIGHT = "RIGHT";
exports.LEFT = "LEFT";
exports.BONE = "BONE";
exports.EMPTY = "EMPTY";
exports.DOG = "DOG";
exports.VISITED = "VISITED";
class GameMap {
    constructor(rootPosition) {
        this.rootPosition = rootPosition;
        this.tilePosMapping = [];
        this.tiles = this.toFixedPositions();
    }
    toFixedPositions() {
        const rval = new Array();
        let x = 0, y = 0;
        rval.push(this.createPos(this.rootPosition, exports.DOG, x, y));
        for (let i of this.toFixed(this.rootPosition))
            rval.push(i);
        return rval;
    }
    createPos(position, status, x, y) {
        const rval = new FixedPosition(status, x, y);
        this.tilePosMapping.push([position, rval]);
        return rval;
    }
    toFixed(position, x = 0, y = 0) {
        const rval = new Array();
        if (position[exports.BONE]) {
            rval.push(this.createPos(position, exports.BONE, x, y));
            return rval;
        }
        for (let dir in position) {
            const oldLeftOffset = x;
            const oldTopOffset = y;
            switch (dir) {
                case exports.UP:
                    y--;
                    break;
                case exports.DOWN:
                    y++;
                    break;
                case exports.LEFT:
                    x--;
                    break;
                case exports.RIGHT:
                    x++;
                    break;
            }
            if (!position[dir][exports.BONE]) {
                rval.push(this.createPos(position[dir], exports.EMPTY, x, y));
            }
            for (let i of this.toFixed(position[dir], x, y))
                rval.push(i);
            x = oldLeftOffset;
            y = oldTopOffset;
        }
        return rval;
    }
    findTile(pos) {
        for (let pair of this.tilePosMapping) {
            if (pair[0] === pos) {
                return pair[1];
            }
        }
        throw "not found";
    }
    reset() {
        this.tilePosMapping.forEach(pair => {
            const pos = pair[1];
            if (pair[0] === this.rootPosition) {
                pos.updateStatus(exports.DOG);
            }
            else if (pair[0][exports.BONE] !== undefined) {
                pos.updateStatus(exports.BONE);
            }
            else if (pos.status === "VISITED" || pos.status === "DOG") {
                pos.updateStatus("EMPTY");
            }
        });
    }
}
exports.GameMap = GameMap;
function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}
class FixedPosition {
    constructor(status, xOffset, yOffset) {
        this.status = status;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.listener = () => { };
    }
    onStatusChange(listener) {
        this.listener = listener;
    }
    updateStatus(newStatus) {
        this.status = newStatus;
        this.listener(newStatus);
    }
}
exports.FixedPosition = FixedPosition;
function contains(pos, dir) {
    return pos[dir] !== undefined;
}
class ProgramBuilder {
    constructor() {
        this.program = [];
    }
    add(direction) {
        this.program.push(direction);
        this.listener(this.program);
    }
    delete(index) {
        this.program.splice(index, 1);
        this.listener(this.program);
    }
}
exports.ProgramBuilder = ProgramBuilder;
class Main {
    constructor(mapProvider, changeListener, programBuilder = new ProgramBuilder()) {
        this.mapProvider = mapProvider;
        this.changeListener = changeListener;
        this.programBuilder = programBuilder;
        this.map = mapProvider();
    }
    executeProgram(p = this.programBuilder.program) {
        return __awaiter(this, void 0, void 0, function* () {
            this.map.reset();
            let currPos = this.map.rootPosition;
            for (let index in p) {
                yield wait(200);
                const dir = p[index];
                if (!contains(currPos, dir)) {
                    this.changeListener({
                        type: "FINAL",
                        success: false,
                        processedStep: { dir, index: Number(index) }
                    });
                    return;
                }
                else {
                    this.changeListener({
                        type: "MOVE",
                        success: true,
                        processedStep: { dir, index: Number(index) }
                    });
                }
                this.map.findTile(currPos).updateStatus(exports.VISITED);
                currPos = currPos[dir];
                this.map.findTile(currPos).updateStatus(exports.DOG);
            }
        });
    }
    getTiles() {
        return this.map.tiles;
    }
}
exports.Main = Main;
