/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Main = exports.ProgramStepList = exports.ProgramStep = exports.MapTile = exports.GameMap = exports.K = exports.G = exports._ = exports.D = exports.B = exports.E = exports.KEY = exports.GATE = exports.NONE = exports.VISITED = exports.DOG = exports.EMPTY = exports.BONE = exports.LEFT = exports.RIGHT = exports.DOWN = exports.UP = void 0;
exports.UP = "UP";
exports.DOWN = "DOWN";
exports.RIGHT = "RIGHT";
exports.LEFT = "LEFT";
exports.BONE = "BONE";
exports.EMPTY = "EMPTY";
exports.DOG = "DOG";
exports.VISITED = "VISITED";
exports.NONE = "NONE";
exports.GATE = "GATE";
exports.KEY = "KEY";
exports.E = exports.EMPTY;
exports.B = exports.BONE;
exports.D = exports.DOG;
exports._ = exports.NONE;
exports.G = exports.GATE;
exports.K = exports.KEY;
class GameMap {
    constructor(blueprint) {
        this.blueprint = blueprint;
        this.tilePosMapping = [];
        this.tiles = this.initTiles();
    }
    initTiles() {
        const rval = new Array();
        for (let y in this.blueprint) {
            for (let x in this.blueprint[y]) {
                rval.push(new MapTile(this.blueprint[y][x], Number(x), Number(y)));
            }
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
    dogTile() {
        const rval = this.tiles.filter(tile => tile.status === exports.DOG);
        if (rval.length !== 1) {
            throw `${rval.length} dog tiles found instead of 1`;
        }
        return rval[0];
    }
    adjacentTileByDir(dir) {
        let cur = this.dogTile();
        let { xOffset: x, yOffset: y } = cur;
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
        let rval = this.tiles.filter(tile => tile.xOffset === x && tile.yOffset === y && tile.status != exports.NONE);
        if (rval.length > 1) {
            throw "sheet";
        }
        else if (rval.length === 0) {
            return null;
        }
        return rval[0];
    }
    reset() {
        this.tiles.forEach(tile => tile.updateStatus(this.blueprint[tile.yOffset][tile.xOffset]));
    }
}
exports.GameMap = GameMap;
;
function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}
class MapTile {
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
    dispose() {
        this.listener(null);
    }
}
exports.MapTile = MapTile;
class ProgramStep {
    constructor(dir, containingList) {
        this.dir = dir;
        this.containingList = containingList;
        this.listeners = [];
    }
    delete() {
        this.containingList.delete(this);
        this.listeners.forEach(l => l.deleted());
    }
    addListener(l) {
        this.listeners.push(l);
    }
    removeListener(l) {
        this.listeners = [];
    }
    updateStatus(status) {
        this.status = status;
        this.listeners.forEach(l => l.statusChanged(status));
    }
}
exports.ProgramStep = ProgramStep;
class ProgramStepList {
    constructor() {
        this.steps = [];
    }
    addStep(dir) {
        const step = new ProgramStep(dir, this);
        this.steps.push(step);
        return step;
    }
    stepPerformed(index) {
        this.steps[index].updateStatus("PERFORMED");
    }
    stepFailed(index) {
        this.steps[index].updateStatus("FAILED");
    }
    reset() {
        this.steps.forEach(step => step.updateStatus("DEFAULT"));
    }
    delete(step) {
        const index = this.steps.indexOf(step);
        this.steps.splice(index, 1);
    }
    deleteLast() {
        if (this.steps.length > 0) {
            this.steps[this.steps.length - 1].delete();
        }
    }
    deleteAll() {
        while (this.steps.length) {
            this.deleteLast();
        }
    }
    toProgram() {
        return this.steps.map(step => step.dir);
    }
}
exports.ProgramStepList = ProgramStepList;
class Main {
    constructor(mapProvider, programStepList = new ProgramStepList()) {
        this.mapProvider = mapProvider;
        this.programStepList = programStepList;
    }
    executeProgram() {
        return __awaiter(this, void 0, void 0, function* () {
            const p = this.programStepList.toProgram();
            // console.log("executng ", p)
            const map = this.mapProvider.getMap();
            map.reset();
            this.programStepList.reset();
            let currPos = map.dogTile();
            let pickedUpKeyCount = 0;
            for (let index in p) {
                let dir = p[index];
                yield wait(200);
                let nextPos = map.adjacentTileByDir(dir);
                if (nextPos !== null) {
                    if (nextPos.status === exports.GATE) {
                        if (pickedUpKeyCount-- === 0) {
                            this.programStepList.stepFailed(index);
                            return;
                        }
                    }
                    else if (nextPos.status === exports.KEY) {
                        pickedUpKeyCount++;
                    }
                    currPos.updateStatus(exports.VISITED);
                    nextPos.updateStatus(exports.DOG);
                    currPos = nextPos;
                    this.programStepList.stepPerformed(index);
                }
                else {
                    this.programStepList.stepFailed(index);
                    return;
                }
            }
        });
    }
    getTiles() {
        return this.mapProvider.getMap().tiles;
    }
    selectMap(name) {
        this.mapProvider.getMap().tiles.forEach(tile => tile.dispose());
        this.programStepList.deleteAll();
        this.mapProvider.switchToMap(name);
        return this.mapProvider.getMap();
    }
}
exports.Main = Main;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const _1 = __webpack_require__(/*! . */ "./src/index.ts");
class RealMapProvider {
    constructor() {
        this.allMaps = {
            "első": new _1.GameMap([
                [_1._, _1._, _1.E, _1._, _1._, _1._],
                [_1.D, _1.E, _1.E, _1._, _1._, _1._],
                [_1._, _1._, _1.E, _1._, _1._, _1.B],
                [_1._, _1._, _1.E, _1.E, _1.E, _1.E],
            ]),
            "második": new _1.GameMap([
                [_1._, _1._, _1.E, _1.E, _1.E, _1.E, _1.E, _1.E, _1.E],
                [_1.D, _1.E, _1.E, _1._, _1._, _1._, _1.E, _1._, _1.E],
                [_1._, _1._, _1.E, _1.E, _1.E, _1.E, _1.E, _1.E, _1.E],
                [_1._, _1._, _1.E, _1._, _1._, _1._, _1.E, _1._, _1._],
                [_1._, _1._, _1.E, _1._, _1.B, _1.E, _1.E, _1._, _1._]
            ]),
            "harmadik": new _1.GameMap([
                [_1._, _1._, _1._, _1.E, _1.E, _1.E, _1._, _1.E, _1.E, _1.E, _1._, _1._, _1.E, _1.E, _1.E, _1.E],
                [_1._, _1._, _1._, _1.E, _1._, _1._, _1._, _1.E, _1._, _1.E, _1._, _1._, _1.E, _1._, _1._, _1.E],
                [_1.D, _1._, _1._, _1.E, _1._, _1._, _1._, _1.E, _1._, _1.E, _1.E, _1.E, _1.E, _1._, _1._, _1._],
                [_1.E, _1._, _1._, _1.E, _1._, _1.E, _1.E, _1.E, _1._, _1.E, _1._, _1._, _1._, _1._, _1.E, _1.B],
                [_1.E, _1.E, _1._, _1.E, _1.E, _1.E, _1._, _1._, _1._, _1.E, _1.E, _1._, _1._, _1._, _1.E, _1._],
                [_1.E, _1.E, _1.E, _1.E, _1._, _1.E, _1.E, _1.E, _1._, _1._, _1.E, _1.E, _1.E, _1.E, _1.E, _1._]
            ]),
            "kulcsos": new _1.GameMap([
                [_1._, _1._, _1._, _1.E, _1.E, _1.E, _1._, _1.E, _1.E, _1.E, _1.E, _1._],
                [_1._, _1.E, _1.E, _1.E, _1._, _1.E, _1._, _1.E, _1._, _1._, _1.E, _1._],
                [_1._, _1.E, _1._, _1._, _1._, _1.E, _1.E, _1.E, _1._, _1.E, _1.E, _1._],
                [_1._, _1.K, _1._, _1._, _1._, _1._, _1._, _1._, _1._, _1.E, _1._, _1._],
                [_1._, _1.E, _1.E, _1.E, _1.E, _1.E, _1._, _1.E, _1.E, _1.G, _1.E, _1._],
                [_1._, _1._, _1._, _1.D, _1._, _1.E, _1.E, _1.E, _1._, _1._, _1.B, _1._]
            ]),
            "háromkulcsos": new _1.GameMap([
                [_1._, _1.E, _1.E, _1.K, _1._, _1.E, _1._, _1._, _1._, _1.E, _1.E, _1._, _1.E, _1.E, _1.E, _1._],
                [_1.E, _1.E, _1._, _1.E, _1._, _1.E, _1.E, _1.E, _1._, _1.E, _1._, _1._, _1.E, _1._, _1.E, _1._],
                [_1.E, _1._, _1.E, _1.E, _1.E, _1.E, _1._, _1.G, _1.E, _1.E, _1.E, _1.G, _1.E, _1._, _1.E, _1.E],
                [_1.E, _1._, _1.E, _1._, _1._, _1._, _1._, _1._, _1._, _1._, _1.E, _1._, _1.E, _1._, _1._, _1.B],
                [_1.E, _1.E, _1.E, _1.E, _1._, _1._, _1._, _1.E, _1.K, _1.E, _1.E, _1._, _1.E, _1._, _1.E, _1.G],
                [_1._, _1.D, _1._, _1.E, _1.E, _1.K, _1._, _1._, _1._, _1._, _1._, _1._, _1.E, _1.E, _1._, _1.B]
            ]),
            "Négykulcsos": new _1.GameMap([
                [_1.B, _1._, _1._, _1.E, _1.E, _1.E, _1._, _1._, _1._, _1._, _1._, _1._, _1.E, _1._, _1.E, _1.E, _1.K, _1.E],
                [_1.E, _1.E, _1.E, _1.E, _1._, _1.G, _1._, _1._, _1.E, _1.E, _1.E, _1._, _1.E, _1.E, _1.E, _1._, _1._, _1.E],
                [_1._, _1._, _1.E, _1._, _1._, _1.E, _1._, _1.E, _1.E, _1._, _1.G, _1.E, _1.E, _1._, _1._, _1._, _1.E, _1.E],
                [_1._, _1._, _1.E, _1._, _1.E, _1.E, _1.E, _1.E, _1._, _1._, _1._, _1.E, _1.E, _1.G, _1.E, _1.E, _1.E, _1._],
                [_1.B, _1._, _1.E, _1.K, _1._, _1.E, _1._, _1.E, _1._, _1._, _1.K, _1._, _1._, _1.E, _1._, _1._, _1._, _1._],
                [_1.E, _1.G, _1.E, _1._, _1._, _1._, _1.E, _1.E, _1.K, _1._, _1.E, _1.E, _1.E, _1.E, _1.E, _1.E, _1.E, _1.D]
            ])
        };
        this.currentMapName = "első";
    }
    getMap() {
        return this.allMaps[this.currentMapName];
    }
    switchToMap(name) {
        if (!this.allMaps[name])
            throw "map " + name + " does not exist";
        this.currentMapName = name;
    }
    mapNames() {
        return Object.keys(this.allMaps);
    }
}
const mapProvider = new RealMapProvider();
const main = new _1.Main(mapProvider);
const positionMeasurementUnit = "vh";
let topOffset = 0;
let leftOffset = 20;
let cellSize = 8;
class TileView {
    constructor(tile, container) {
        this.tile = tile;
        this.container = container;
        const el = this.el = document.createElement("div");
        el.style.marginLeft = (leftOffset + (tile.xOffset * cellSize)) + positionMeasurementUnit;
        el.style.marginTop = (topOffset + (tile.yOffset * cellSize)) + positionMeasurementUnit;
        elMap.appendChild(el);
        this.update(tile.status);
        tile.onStatusChange(status => this.update(status));
    }
    update(status) {
        switch (status) {
            case _1.DOG:
                this.el.className = "dog";
                this.el.innerHTML = '<i class="fa-solid fa-dog"></i>';
                break;
            case _1.BONE:
                this.el.className = "bone";
                this.el.innerHTML = '<i class="fa-solid fa-bone"></i>';
                break;
            case _1.EMPTY:
                this.el.className = "";
                this.el.innerHTML = "";
                break;
            case _1.VISITED:
                this.el.className = "visited";
                this.el.innerHTML = '<i class="fa-solid fa-paw"></i>';
                break;
            case _1.NONE:
                this.el.className = "none";
                this.el.innerHTML = '';
                break;
            case _1.KEY:
                this.el.className = "key";
                this.el.innerHTML = '<i class="fa-solid fa-key"></i>';
                break;
            case _1.GATE:
                this.el.className = "gate";
                this.el.innerHTML = '<i class="fa-solid fa-dungeon"></i>';
                break;
            case null:
                this.el.remove();
                break;
        }
    }
}
class ProgramStepView {
    constructor(step, container = document.getElementById("program-steps")) {
        this.step = step;
        this.container = container;
        this.el = document.createElement("i");
        this.el.className = "fa-solid fa-arrow-" + this.step.dir.toLocaleLowerCase();
        this.container.appendChild(this.el);
        this.el.addEventListener("click", () => this.step.delete());
        this.step.addListener(this);
    }
    deleted() {
        this.step.removeListener(this);
        this.container.removeChild(this.el);
    }
    statusChanged(status) {
        switch (status) {
            case "DEFAULT":
                this.el.style.color = "#64321f";
                break;
            case "PERFORMED":
                this.el.style.color = "#349d33";
                break;
            case "FAILED":
                this.el.style.color = "red";
                break;
        }
    }
}
const elMap = document.getElementById("map");
function renderMap(map) {
    map.tiles.forEach(tile => new TileView(tile, elMap));
}
const stepsModel = main.programStepList;
for (let dir of ["left", "right", "up", "down"]) {
    document.getElementById("add-" + dir).addEventListener("click", () => {
        new ProgramStepView(stepsModel.addStep(dir.toUpperCase()));
    });
}
const code2dir = {
    38: "up",
    40: "down",
    37: "left",
    39: "right"
};
document.addEventListener("keyup", e => {
    console.log(e.keyCode);
    if (code2dir[e.keyCode]) {
        new ProgramStepView(stepsModel.addStep(code2dir[e.keyCode].toUpperCase()));
    }
    else if (e.keyCode === 13) {
        main.executeProgram();
    }
    else if (e.keyCode === 46 || e.keyCode === 8) {
        stepsModel.deleteLast();
    }
});
document.getElementById("btn-execute").addEventListener("click", () => main.executeProgram());
let mapSel = document.getElementById("map-selector");
mapProvider.mapNames().forEach(name => {
    let opt = document.createElement("option");
    opt.innerHTML = name;
    opt.setAttribute("value", name);
    mapSel.appendChild(opt);
});
mapSel.addEventListener("change", e => {
    const target = e.target;
    const mapName = target.value;
    console.log(mapName);
    renderMap(main.selectMap(mapName));
    target.blur();
    document.body.focus();
});
renderMap(mapProvider.getMap());

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWJ1bmRsZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7QUFDYjtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELFlBQVksR0FBRyx1QkFBdUIsR0FBRyxtQkFBbUIsR0FBRyxlQUFlLEdBQUcsZUFBZSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxZQUFZLEdBQUcsWUFBWSxHQUFHLGVBQWUsR0FBRyxXQUFXLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxZQUFZLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxVQUFVO0FBQzlVLFVBQVU7QUFDVixZQUFZO0FBQ1osYUFBYTtBQUNiLFlBQVk7QUFDWixZQUFZO0FBQ1osYUFBYTtBQUNiLFdBQVc7QUFDWCxlQUFlO0FBQ2YsWUFBWTtBQUNaLFlBQVk7QUFDWixXQUFXO0FBQ1gsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1QsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixhQUFhO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHlCQUF5QjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZOzs7Ozs7O1VDOU5aO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7QUN0QmE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsV0FBVyxtQkFBTyxDQUFDLHlCQUFHO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYm9uZWZpbmRlci8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9ib25lZmluZGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JvbmVmaW5kZXIvLi9zcmMvZ2FtZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5NYWluID0gZXhwb3J0cy5Qcm9ncmFtU3RlcExpc3QgPSBleHBvcnRzLlByb2dyYW1TdGVwID0gZXhwb3J0cy5NYXBUaWxlID0gZXhwb3J0cy5HYW1lTWFwID0gZXhwb3J0cy5LID0gZXhwb3J0cy5HID0gZXhwb3J0cy5fID0gZXhwb3J0cy5EID0gZXhwb3J0cy5CID0gZXhwb3J0cy5FID0gZXhwb3J0cy5LRVkgPSBleHBvcnRzLkdBVEUgPSBleHBvcnRzLk5PTkUgPSBleHBvcnRzLlZJU0lURUQgPSBleHBvcnRzLkRPRyA9IGV4cG9ydHMuRU1QVFkgPSBleHBvcnRzLkJPTkUgPSBleHBvcnRzLkxFRlQgPSBleHBvcnRzLlJJR0hUID0gZXhwb3J0cy5ET1dOID0gZXhwb3J0cy5VUCA9IHZvaWQgMDtcbmV4cG9ydHMuVVAgPSBcIlVQXCI7XG5leHBvcnRzLkRPV04gPSBcIkRPV05cIjtcbmV4cG9ydHMuUklHSFQgPSBcIlJJR0hUXCI7XG5leHBvcnRzLkxFRlQgPSBcIkxFRlRcIjtcbmV4cG9ydHMuQk9ORSA9IFwiQk9ORVwiO1xuZXhwb3J0cy5FTVBUWSA9IFwiRU1QVFlcIjtcbmV4cG9ydHMuRE9HID0gXCJET0dcIjtcbmV4cG9ydHMuVklTSVRFRCA9IFwiVklTSVRFRFwiO1xuZXhwb3J0cy5OT05FID0gXCJOT05FXCI7XG5leHBvcnRzLkdBVEUgPSBcIkdBVEVcIjtcbmV4cG9ydHMuS0VZID0gXCJLRVlcIjtcbmV4cG9ydHMuRSA9IGV4cG9ydHMuRU1QVFk7XG5leHBvcnRzLkIgPSBleHBvcnRzLkJPTkU7XG5leHBvcnRzLkQgPSBleHBvcnRzLkRPRztcbmV4cG9ydHMuXyA9IGV4cG9ydHMuTk9ORTtcbmV4cG9ydHMuRyA9IGV4cG9ydHMuR0FURTtcbmV4cG9ydHMuSyA9IGV4cG9ydHMuS0VZO1xuY2xhc3MgR2FtZU1hcCB7XG4gICAgY29uc3RydWN0b3IoYmx1ZXByaW50KSB7XG4gICAgICAgIHRoaXMuYmx1ZXByaW50ID0gYmx1ZXByaW50O1xuICAgICAgICB0aGlzLnRpbGVQb3NNYXBwaW5nID0gW107XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aGlzLmluaXRUaWxlcygpO1xuICAgIH1cbiAgICBpbml0VGlsZXMoKSB7XG4gICAgICAgIGNvbnN0IHJ2YWwgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgZm9yIChsZXQgeSBpbiB0aGlzLmJsdWVwcmludCkge1xuICAgICAgICAgICAgZm9yIChsZXQgeCBpbiB0aGlzLmJsdWVwcmludFt5XSkge1xuICAgICAgICAgICAgICAgIHJ2YWwucHVzaChuZXcgTWFwVGlsZSh0aGlzLmJsdWVwcmludFt5XVt4XSwgTnVtYmVyKHgpLCBOdW1iZXIoeSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnZhbDtcbiAgICB9XG4gICAgZmluZFRpbGUocG9zKSB7XG4gICAgICAgIGZvciAobGV0IHBhaXIgb2YgdGhpcy50aWxlUG9zTWFwcGluZykge1xuICAgICAgICAgICAgaWYgKHBhaXJbMF0gPT09IHBvcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYWlyWzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IFwibm90IGZvdW5kXCI7XG4gICAgfVxuICAgIGRvZ1RpbGUoKSB7XG4gICAgICAgIGNvbnN0IHJ2YWwgPSB0aGlzLnRpbGVzLmZpbHRlcih0aWxlID0+IHRpbGUuc3RhdHVzID09PSBleHBvcnRzLkRPRyk7XG4gICAgICAgIGlmIChydmFsLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgdGhyb3cgYCR7cnZhbC5sZW5ndGh9IGRvZyB0aWxlcyBmb3VuZCBpbnN0ZWFkIG9mIDFgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydmFsWzBdO1xuICAgIH1cbiAgICBhZGphY2VudFRpbGVCeURpcihkaXIpIHtcbiAgICAgICAgbGV0IGN1ciA9IHRoaXMuZG9nVGlsZSgpO1xuICAgICAgICBsZXQgeyB4T2Zmc2V0OiB4LCB5T2Zmc2V0OiB5IH0gPSBjdXI7XG4gICAgICAgIHN3aXRjaCAoZGlyKSB7XG4gICAgICAgICAgICBjYXNlIGV4cG9ydHMuVVA6XG4gICAgICAgICAgICAgICAgeS0tO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBleHBvcnRzLkRPV046XG4gICAgICAgICAgICAgICAgeSsrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBleHBvcnRzLkxFRlQ6XG4gICAgICAgICAgICAgICAgeC0tO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBleHBvcnRzLlJJR0hUOlxuICAgICAgICAgICAgICAgIHgrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBsZXQgcnZhbCA9IHRoaXMudGlsZXMuZmlsdGVyKHRpbGUgPT4gdGlsZS54T2Zmc2V0ID09PSB4ICYmIHRpbGUueU9mZnNldCA9PT0geSAmJiB0aWxlLnN0YXR1cyAhPSBleHBvcnRzLk5PTkUpO1xuICAgICAgICBpZiAocnZhbC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aHJvdyBcInNoZWV0XCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocnZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydmFsWzBdO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy50aWxlcy5mb3JFYWNoKHRpbGUgPT4gdGlsZS51cGRhdGVTdGF0dXModGhpcy5ibHVlcHJpbnRbdGlsZS55T2Zmc2V0XVt0aWxlLnhPZmZzZXRdKSk7XG4gICAgfVxufVxuZXhwb3J0cy5HYW1lTWFwID0gR2FtZU1hcDtcbjtcbmZ1bmN0aW9uIHdhaXQobXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzID0+IHNldFRpbWVvdXQocmVzLCBtcykpO1xufVxuY2xhc3MgTWFwVGlsZSB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCB4T2Zmc2V0LCB5T2Zmc2V0KSB7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLnhPZmZzZXQgPSB4T2Zmc2V0O1xuICAgICAgICB0aGlzLnlPZmZzZXQgPSB5T2Zmc2V0O1xuICAgICAgICB0aGlzLmxpc3RlbmVyID0gKCkgPT4geyB9O1xuICAgIH1cbiAgICBvblN0YXR1c0NoYW5nZShsaXN0ZW5lcikge1xuICAgICAgICB0aGlzLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgfVxuICAgIHVwZGF0ZVN0YXR1cyhuZXdTdGF0dXMpIHtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBuZXdTdGF0dXM7XG4gICAgICAgIHRoaXMubGlzdGVuZXIobmV3U3RhdHVzKTtcbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcihudWxsKTtcbiAgICB9XG59XG5leHBvcnRzLk1hcFRpbGUgPSBNYXBUaWxlO1xuY2xhc3MgUHJvZ3JhbVN0ZXAge1xuICAgIGNvbnN0cnVjdG9yKGRpciwgY29udGFpbmluZ0xpc3QpIHtcbiAgICAgICAgdGhpcy5kaXIgPSBkaXI7XG4gICAgICAgIHRoaXMuY29udGFpbmluZ0xpc3QgPSBjb250YWluaW5nTGlzdDtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB9XG4gICAgZGVsZXRlKCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5pbmdMaXN0LmRlbGV0ZSh0aGlzKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaChsID0+IGwuZGVsZXRlZCgpKTtcbiAgICB9XG4gICAgYWRkTGlzdGVuZXIobCkge1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGwpO1xuICAgIH1cbiAgICByZW1vdmVMaXN0ZW5lcihsKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gICAgfVxuICAgIHVwZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2gobCA9PiBsLnN0YXR1c0NoYW5nZWQoc3RhdHVzKSk7XG4gICAgfVxufVxuZXhwb3J0cy5Qcm9ncmFtU3RlcCA9IFByb2dyYW1TdGVwO1xuY2xhc3MgUHJvZ3JhbVN0ZXBMaXN0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zdGVwcyA9IFtdO1xuICAgIH1cbiAgICBhZGRTdGVwKGRpcikge1xuICAgICAgICBjb25zdCBzdGVwID0gbmV3IFByb2dyYW1TdGVwKGRpciwgdGhpcyk7XG4gICAgICAgIHRoaXMuc3RlcHMucHVzaChzdGVwKTtcbiAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgfVxuICAgIHN0ZXBQZXJmb3JtZWQoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5zdGVwc1tpbmRleF0udXBkYXRlU3RhdHVzKFwiUEVSRk9STUVEXCIpO1xuICAgIH1cbiAgICBzdGVwRmFpbGVkKGluZGV4KSB7XG4gICAgICAgIHRoaXMuc3RlcHNbaW5kZXhdLnVwZGF0ZVN0YXR1cyhcIkZBSUxFRFwiKTtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuc3RlcHMuZm9yRWFjaChzdGVwID0+IHN0ZXAudXBkYXRlU3RhdHVzKFwiREVGQVVMVFwiKSk7XG4gICAgfVxuICAgIGRlbGV0ZShzdGVwKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zdGVwcy5pbmRleE9mKHN0ZXApO1xuICAgICAgICB0aGlzLnN0ZXBzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgIGRlbGV0ZUxhc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0ZXBzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc3RlcHNbdGhpcy5zdGVwcy5sZW5ndGggLSAxXS5kZWxldGUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZWxldGVBbGwoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnN0ZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGVMYXN0KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9Qcm9ncmFtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGVwcy5tYXAoc3RlcCA9PiBzdGVwLmRpcik7XG4gICAgfVxufVxuZXhwb3J0cy5Qcm9ncmFtU3RlcExpc3QgPSBQcm9ncmFtU3RlcExpc3Q7XG5jbGFzcyBNYWluIHtcbiAgICBjb25zdHJ1Y3RvcihtYXBQcm92aWRlciwgcHJvZ3JhbVN0ZXBMaXN0ID0gbmV3IFByb2dyYW1TdGVwTGlzdCgpKSB7XG4gICAgICAgIHRoaXMubWFwUHJvdmlkZXIgPSBtYXBQcm92aWRlcjtcbiAgICAgICAgdGhpcy5wcm9ncmFtU3RlcExpc3QgPSBwcm9ncmFtU3RlcExpc3Q7XG4gICAgfVxuICAgIGV4ZWN1dGVQcm9ncmFtKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3QgcCA9IHRoaXMucHJvZ3JhbVN0ZXBMaXN0LnRvUHJvZ3JhbSgpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJleGVjdXRuZyBcIiwgcClcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMubWFwUHJvdmlkZXIuZ2V0TWFwKCk7XG4gICAgICAgICAgICBtYXAucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvZ3JhbVN0ZXBMaXN0LnJlc2V0KCk7XG4gICAgICAgICAgICBsZXQgY3VyclBvcyA9IG1hcC5kb2dUaWxlKCk7XG4gICAgICAgICAgICBsZXQgcGlja2VkVXBLZXlDb3VudCA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleCBpbiBwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRpciA9IHBbaW5kZXhdO1xuICAgICAgICAgICAgICAgIHlpZWxkIHdhaXQoMjAwKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBvcyA9IG1hcC5hZGphY2VudFRpbGVCeURpcihkaXIpO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0UG9zICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0UG9zLnN0YXR1cyA9PT0gZXhwb3J0cy5HQVRFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGlja2VkVXBLZXlDb3VudC0tID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmFtU3RlcExpc3Quc3RlcEZhaWxlZChpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG5leHRQb3Muc3RhdHVzID09PSBleHBvcnRzLktFWSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGlja2VkVXBLZXlDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGN1cnJQb3MudXBkYXRlU3RhdHVzKGV4cG9ydHMuVklTSVRFRCk7XG4gICAgICAgICAgICAgICAgICAgIG5leHRQb3MudXBkYXRlU3RhdHVzKGV4cG9ydHMuRE9HKTtcbiAgICAgICAgICAgICAgICAgICAgY3VyclBvcyA9IG5leHRQb3M7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZ3JhbVN0ZXBMaXN0LnN0ZXBQZXJmb3JtZWQoaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmFtU3RlcExpc3Quc3RlcEZhaWxlZChpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRUaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwUHJvdmlkZXIuZ2V0TWFwKCkudGlsZXM7XG4gICAgfVxuICAgIHNlbGVjdE1hcChuYW1lKSB7XG4gICAgICAgIHRoaXMubWFwUHJvdmlkZXIuZ2V0TWFwKCkudGlsZXMuZm9yRWFjaCh0aWxlID0+IHRpbGUuZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5wcm9ncmFtU3RlcExpc3QuZGVsZXRlQWxsKCk7XG4gICAgICAgIHRoaXMubWFwUHJvdmlkZXIuc3dpdGNoVG9NYXAobmFtZSk7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcFByb3ZpZGVyLmdldE1hcCgpO1xuICAgIH1cbn1cbmV4cG9ydHMuTWFpbiA9IE1haW47XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBfMSA9IHJlcXVpcmUoXCIuXCIpO1xuY2xhc3MgUmVhbE1hcFByb3ZpZGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5hbGxNYXBzID0ge1xuICAgICAgICAgICAgXCJlbHPFkVwiOiBuZXcgXzEuR2FtZU1hcChbXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5ELCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuQl0sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkVdLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBcIm3DoXNvZGlrXCI6IG5ldyBfMS5HYW1lTWFwKFtcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRV0sXG4gICAgICAgICAgICAgICAgW18xLkQsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkVdLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkIsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl9dXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIFwiaGFybWFkaWtcIjogbmV3IF8xLkdhbWVNYXAoW1xuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuRV0sXG4gICAgICAgICAgICAgICAgW18xLkQsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5FLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5CXSxcbiAgICAgICAgICAgICAgICBbXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl9dXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIFwia3VsY3Nvc1wiOiBuZXcgXzEuR2FtZU1hcChbXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLkssIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5HLCBfMS5FLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuXywgXzEuRCwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuQiwgXzEuX11cbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXCJow6Fyb21rdWxjc29zXCI6IG5ldyBfMS5HYW1lTWFwKFtcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuRSwgXzEuRSwgXzEuSywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5HLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5HLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FXSxcbiAgICAgICAgICAgICAgICBbXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuQl0sXG4gICAgICAgICAgICAgICAgW18xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkssIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkddLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5ELCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5LLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5CXVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBcIk7DqWd5a3VsY3Nvc1wiOiBuZXcgXzEuR2FtZU1hcChbXG4gICAgICAgICAgICAgICAgW18xLkIsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkssIF8xLkVdLFxuICAgICAgICAgICAgICAgIFtfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5HLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5FXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuXywgXzEuRywgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuRV0sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkcsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5CLCBfMS5fLCBfMS5FLCBfMS5LLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5LLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuRSwgXzEuRywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuSywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRF1cbiAgICAgICAgICAgIF0pXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY3VycmVudE1hcE5hbWUgPSBcImVsc8WRXCI7XG4gICAgfVxuICAgIGdldE1hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsTWFwc1t0aGlzLmN1cnJlbnRNYXBOYW1lXTtcbiAgICB9XG4gICAgc3dpdGNoVG9NYXAobmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMuYWxsTWFwc1tuYW1lXSlcbiAgICAgICAgICAgIHRocm93IFwibWFwIFwiICsgbmFtZSArIFwiIGRvZXMgbm90IGV4aXN0XCI7XG4gICAgICAgIHRoaXMuY3VycmVudE1hcE5hbWUgPSBuYW1lO1xuICAgIH1cbiAgICBtYXBOYW1lcygpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuYWxsTWFwcyk7XG4gICAgfVxufVxuY29uc3QgbWFwUHJvdmlkZXIgPSBuZXcgUmVhbE1hcFByb3ZpZGVyKCk7XG5jb25zdCBtYWluID0gbmV3IF8xLk1haW4obWFwUHJvdmlkZXIpO1xuY29uc3QgcG9zaXRpb25NZWFzdXJlbWVudFVuaXQgPSBcInZoXCI7XG5sZXQgdG9wT2Zmc2V0ID0gMDtcbmxldCBsZWZ0T2Zmc2V0ID0gMjA7XG5sZXQgY2VsbFNpemUgPSA4O1xuY2xhc3MgVGlsZVZpZXcge1xuICAgIGNvbnN0cnVjdG9yKHRpbGUsIGNvbnRhaW5lcikge1xuICAgICAgICB0aGlzLnRpbGUgPSB0aWxlO1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZWwuc3R5bGUubWFyZ2luTGVmdCA9IChsZWZ0T2Zmc2V0ICsgKHRpbGUueE9mZnNldCAqIGNlbGxTaXplKSkgKyBwb3NpdGlvbk1lYXN1cmVtZW50VW5pdDtcbiAgICAgICAgZWwuc3R5bGUubWFyZ2luVG9wID0gKHRvcE9mZnNldCArICh0aWxlLnlPZmZzZXQgKiBjZWxsU2l6ZSkpICsgcG9zaXRpb25NZWFzdXJlbWVudFVuaXQ7XG4gICAgICAgIGVsTWFwLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdGhpcy51cGRhdGUodGlsZS5zdGF0dXMpO1xuICAgICAgICB0aWxlLm9uU3RhdHVzQ2hhbmdlKHN0YXR1cyA9PiB0aGlzLnVwZGF0ZShzdGF0dXMpKTtcbiAgICB9XG4gICAgdXBkYXRlKHN0YXR1cykge1xuICAgICAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSBfMS5ET0c6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcImRvZ1wiO1xuICAgICAgICAgICAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZmEtc29saWQgZmEtZG9nXCI+PC9pPic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIF8xLkJPTkU6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcImJvbmVcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLWJvbmVcIj48L2k+JztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXzEuRU1QVFk6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXzEuVklTSVRFRDpcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IFwidmlzaXRlZFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZmEtc29saWQgZmEtcGF3XCI+PC9pPic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIF8xLk5PTkU6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBfMS5LRVk6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcImtleVwiO1xuICAgICAgICAgICAgICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZmEtc29saWQgZmEta2V5XCI+PC9pPic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIF8xLkdBVEU6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcImdhdGVcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLWR1bmdlb25cIj48L2k+JztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgbnVsbDpcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuY2xhc3MgUHJvZ3JhbVN0ZXBWaWV3IHtcbiAgICBjb25zdHJ1Y3RvcihzdGVwLCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2dyYW0tc3RlcHNcIikpIHtcbiAgICAgICAgdGhpcy5zdGVwID0gc3RlcDtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgIHRoaXMuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaVwiKTtcbiAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcImZhLXNvbGlkIGZhLWFycm93LVwiICsgdGhpcy5zdGVwLmRpci50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmVsKTtcbiAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5zdGVwLmRlbGV0ZSgpKTtcbiAgICAgICAgdGhpcy5zdGVwLmFkZExpc3RlbmVyKHRoaXMpO1xuICAgIH1cbiAgICBkZWxldGVkKCkge1xuICAgICAgICB0aGlzLnN0ZXAucmVtb3ZlTGlzdGVuZXIodGhpcyk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuZWwpO1xuICAgIH1cbiAgICBzdGF0dXNDaGFuZ2VkKHN0YXR1cykge1xuICAgICAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSBcIkRFRkFVTFRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnN0eWxlLmNvbG9yID0gXCIjNjQzMjFmXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiUEVSRk9STUVEXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5jb2xvciA9IFwiIzM0OWQzM1wiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIkZBSUxFRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUuY29sb3IgPSBcInJlZFwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuY29uc3QgZWxNYXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hcFwiKTtcbmZ1bmN0aW9uIHJlbmRlck1hcChtYXApIHtcbiAgICBtYXAudGlsZXMuZm9yRWFjaCh0aWxlID0+IG5ldyBUaWxlVmlldyh0aWxlLCBlbE1hcCkpO1xufVxuY29uc3Qgc3RlcHNNb2RlbCA9IG1haW4ucHJvZ3JhbVN0ZXBMaXN0O1xuZm9yIChsZXQgZGlyIG9mIFtcImxlZnRcIiwgXCJyaWdodFwiLCBcInVwXCIsIFwiZG93blwiXSkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkLVwiICsgZGlyKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBuZXcgUHJvZ3JhbVN0ZXBWaWV3KHN0ZXBzTW9kZWwuYWRkU3RlcChkaXIudG9VcHBlckNhc2UoKSkpO1xuICAgIH0pO1xufVxuY29uc3QgY29kZTJkaXIgPSB7XG4gICAgMzg6IFwidXBcIixcbiAgICA0MDogXCJkb3duXCIsXG4gICAgMzc6IFwibGVmdFwiLFxuICAgIDM5OiBcInJpZ2h0XCJcbn07XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZSA9PiB7XG4gICAgY29uc29sZS5sb2coZS5rZXlDb2RlKTtcbiAgICBpZiAoY29kZTJkaXJbZS5rZXlDb2RlXSkge1xuICAgICAgICBuZXcgUHJvZ3JhbVN0ZXBWaWV3KHN0ZXBzTW9kZWwuYWRkU3RlcChjb2RlMmRpcltlLmtleUNvZGVdLnRvVXBwZXJDYXNlKCkpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZS5rZXlDb2RlID09PSAxMykge1xuICAgICAgICBtYWluLmV4ZWN1dGVQcm9ncmFtKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gNDYgfHwgZS5rZXlDb2RlID09PSA4KSB7XG4gICAgICAgIHN0ZXBzTW9kZWwuZGVsZXRlTGFzdCgpO1xuICAgIH1cbn0pO1xuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tZXhlY3V0ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gbWFpbi5leGVjdXRlUHJvZ3JhbSgpKTtcbmxldCBtYXBTZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hcC1zZWxlY3RvclwiKTtcbm1hcFByb3ZpZGVyLm1hcE5hbWVzKCkuZm9yRWFjaChuYW1lID0+IHtcbiAgICBsZXQgb3B0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICBvcHQuaW5uZXJIVE1MID0gbmFtZTtcbiAgICBvcHQuc2V0QXR0cmlidXRlKFwidmFsdWVcIiwgbmFtZSk7XG4gICAgbWFwU2VsLmFwcGVuZENoaWxkKG9wdCk7XG59KTtcbm1hcFNlbC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGUgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgIGNvbnN0IG1hcE5hbWUgPSB0YXJnZXQudmFsdWU7XG4gICAgY29uc29sZS5sb2cobWFwTmFtZSk7XG4gICAgcmVuZGVyTWFwKG1haW4uc2VsZWN0TWFwKG1hcE5hbWUpKTtcbiAgICB0YXJnZXQuYmx1cigpO1xuICAgIGRvY3VtZW50LmJvZHkuZm9jdXMoKTtcbn0pO1xucmVuZGVyTWFwKG1hcFByb3ZpZGVyLmdldE1hcCgpKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==