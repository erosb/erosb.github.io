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
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWJ1bmRsZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7QUFDYjtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELFlBQVksR0FBRyx1QkFBdUIsR0FBRyxtQkFBbUIsR0FBRyxlQUFlLEdBQUcsZUFBZSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxZQUFZLEdBQUcsWUFBWSxHQUFHLGVBQWUsR0FBRyxXQUFXLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxZQUFZLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxVQUFVO0FBQzlVLFVBQVU7QUFDVixZQUFZO0FBQ1osYUFBYTtBQUNiLFlBQVk7QUFDWixZQUFZO0FBQ1osYUFBYTtBQUNiLFdBQVc7QUFDWCxlQUFlO0FBQ2YsWUFBWTtBQUNaLFlBQVk7QUFDWixXQUFXO0FBQ1gsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1QsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixhQUFhO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHlCQUF5QjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZOzs7Ozs7O1VDOU5aO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7QUN0QmE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsV0FBVyxtQkFBTyxDQUFDLHlCQUFHO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ib25lZmluZGVyLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2JvbmVmaW5kZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYm9uZWZpbmRlci8uL3NyYy9nYW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1haW4gPSBleHBvcnRzLlByb2dyYW1TdGVwTGlzdCA9IGV4cG9ydHMuUHJvZ3JhbVN0ZXAgPSBleHBvcnRzLk1hcFRpbGUgPSBleHBvcnRzLkdhbWVNYXAgPSBleHBvcnRzLksgPSBleHBvcnRzLkcgPSBleHBvcnRzLl8gPSBleHBvcnRzLkQgPSBleHBvcnRzLkIgPSBleHBvcnRzLkUgPSBleHBvcnRzLktFWSA9IGV4cG9ydHMuR0FURSA9IGV4cG9ydHMuTk9ORSA9IGV4cG9ydHMuVklTSVRFRCA9IGV4cG9ydHMuRE9HID0gZXhwb3J0cy5FTVBUWSA9IGV4cG9ydHMuQk9ORSA9IGV4cG9ydHMuTEVGVCA9IGV4cG9ydHMuUklHSFQgPSBleHBvcnRzLkRPV04gPSBleHBvcnRzLlVQID0gdm9pZCAwO1xuZXhwb3J0cy5VUCA9IFwiVVBcIjtcbmV4cG9ydHMuRE9XTiA9IFwiRE9XTlwiO1xuZXhwb3J0cy5SSUdIVCA9IFwiUklHSFRcIjtcbmV4cG9ydHMuTEVGVCA9IFwiTEVGVFwiO1xuZXhwb3J0cy5CT05FID0gXCJCT05FXCI7XG5leHBvcnRzLkVNUFRZID0gXCJFTVBUWVwiO1xuZXhwb3J0cy5ET0cgPSBcIkRPR1wiO1xuZXhwb3J0cy5WSVNJVEVEID0gXCJWSVNJVEVEXCI7XG5leHBvcnRzLk5PTkUgPSBcIk5PTkVcIjtcbmV4cG9ydHMuR0FURSA9IFwiR0FURVwiO1xuZXhwb3J0cy5LRVkgPSBcIktFWVwiO1xuZXhwb3J0cy5FID0gZXhwb3J0cy5FTVBUWTtcbmV4cG9ydHMuQiA9IGV4cG9ydHMuQk9ORTtcbmV4cG9ydHMuRCA9IGV4cG9ydHMuRE9HO1xuZXhwb3J0cy5fID0gZXhwb3J0cy5OT05FO1xuZXhwb3J0cy5HID0gZXhwb3J0cy5HQVRFO1xuZXhwb3J0cy5LID0gZXhwb3J0cy5LRVk7XG5jbGFzcyBHYW1lTWFwIHtcbiAgICBjb25zdHJ1Y3RvcihibHVlcHJpbnQpIHtcbiAgICAgICAgdGhpcy5ibHVlcHJpbnQgPSBibHVlcHJpbnQ7XG4gICAgICAgIHRoaXMudGlsZVBvc01hcHBpbmcgPSBbXTtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRoaXMuaW5pdFRpbGVzKCk7XG4gICAgfVxuICAgIGluaXRUaWxlcygpIHtcbiAgICAgICAgY29uc3QgcnZhbCA9IG5ldyBBcnJheSgpO1xuICAgICAgICBmb3IgKGxldCB5IGluIHRoaXMuYmx1ZXByaW50KSB7XG4gICAgICAgICAgICBmb3IgKGxldCB4IGluIHRoaXMuYmx1ZXByaW50W3ldKSB7XG4gICAgICAgICAgICAgICAgcnZhbC5wdXNoKG5ldyBNYXBUaWxlKHRoaXMuYmx1ZXByaW50W3ldW3hdLCBOdW1iZXIoeCksIE51bWJlcih5KSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydmFsO1xuICAgIH1cbiAgICBmaW5kVGlsZShwb3MpIHtcbiAgICAgICAgZm9yIChsZXQgcGFpciBvZiB0aGlzLnRpbGVQb3NNYXBwaW5nKSB7XG4gICAgICAgICAgICBpZiAocGFpclswXSA9PT0gcG9zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhaXJbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgXCJub3QgZm91bmRcIjtcbiAgICB9XG4gICAgZG9nVGlsZSgpIHtcbiAgICAgICAgY29uc3QgcnZhbCA9IHRoaXMudGlsZXMuZmlsdGVyKHRpbGUgPT4gdGlsZS5zdGF0dXMgPT09IGV4cG9ydHMuRE9HKTtcbiAgICAgICAgaWYgKHJ2YWwubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICB0aHJvdyBgJHtydmFsLmxlbmd0aH0gZG9nIHRpbGVzIGZvdW5kIGluc3RlYWQgb2YgMWA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJ2YWxbMF07XG4gICAgfVxuICAgIGFkamFjZW50VGlsZUJ5RGlyKGRpcikge1xuICAgICAgICBsZXQgY3VyID0gdGhpcy5kb2dUaWxlKCk7XG4gICAgICAgIGxldCB7IHhPZmZzZXQ6IHgsIHlPZmZzZXQ6IHkgfSA9IGN1cjtcbiAgICAgICAgc3dpdGNoIChkaXIpIHtcbiAgICAgICAgICAgIGNhc2UgZXhwb3J0cy5VUDpcbiAgICAgICAgICAgICAgICB5LS07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGV4cG9ydHMuRE9XTjpcbiAgICAgICAgICAgICAgICB5Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGV4cG9ydHMuTEVGVDpcbiAgICAgICAgICAgICAgICB4LS07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGV4cG9ydHMuUklHSFQ6XG4gICAgICAgICAgICAgICAgeCsrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGxldCBydmFsID0gdGhpcy50aWxlcy5maWx0ZXIodGlsZSA9PiB0aWxlLnhPZmZzZXQgPT09IHggJiYgdGlsZS55T2Zmc2V0ID09PSB5ICYmIHRpbGUuc3RhdHVzICE9IGV4cG9ydHMuTk9ORSk7XG4gICAgICAgIGlmIChydmFsLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHRocm93IFwic2hlZXRcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChydmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJ2YWxbMF07XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnRpbGVzLmZvckVhY2godGlsZSA9PiB0aWxlLnVwZGF0ZVN0YXR1cyh0aGlzLmJsdWVwcmludFt0aWxlLnlPZmZzZXRdW3RpbGUueE9mZnNldF0pKTtcbiAgICB9XG59XG5leHBvcnRzLkdhbWVNYXAgPSBHYW1lTWFwO1xuO1xuZnVuY3Rpb24gd2FpdChtcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXMgPT4gc2V0VGltZW91dChyZXMsIG1zKSk7XG59XG5jbGFzcyBNYXBUaWxlIHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIHhPZmZzZXQsIHlPZmZzZXQpIHtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMueE9mZnNldCA9IHhPZmZzZXQ7XG4gICAgICAgIHRoaXMueU9mZnNldCA9IHlPZmZzZXQ7XG4gICAgICAgIHRoaXMubGlzdGVuZXIgPSAoKSA9PiB7IH07XG4gICAgfVxuICAgIG9uU3RhdHVzQ2hhbmdlKGxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICB9XG4gICAgdXBkYXRlU3RhdHVzKG5ld1N0YXR1cykge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgdGhpcy5saXN0ZW5lcihuZXdTdGF0dXMpO1xuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLmxpc3RlbmVyKG51bGwpO1xuICAgIH1cbn1cbmV4cG9ydHMuTWFwVGlsZSA9IE1hcFRpbGU7XG5jbGFzcyBQcm9ncmFtU3RlcCB7XG4gICAgY29uc3RydWN0b3IoZGlyLCBjb250YWluaW5nTGlzdCkge1xuICAgICAgICB0aGlzLmRpciA9IGRpcjtcbiAgICAgICAgdGhpcy5jb250YWluaW5nTGlzdCA9IGNvbnRhaW5pbmdMaXN0O1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICAgIH1cbiAgICBkZWxldGUoKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmluZ0xpc3QuZGVsZXRlKHRoaXMpO1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGwgPT4gbC5kZWxldGVkKCkpO1xuICAgIH1cbiAgICBhZGRMaXN0ZW5lcihsKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobCk7XG4gICAgfVxuICAgIHJlbW92ZUxpc3RlbmVyKGwpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgICB9XG4gICAgdXBkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaChsID0+IGwuc3RhdHVzQ2hhbmdlZChzdGF0dXMpKTtcbiAgICB9XG59XG5leHBvcnRzLlByb2dyYW1TdGVwID0gUHJvZ3JhbVN0ZXA7XG5jbGFzcyBQcm9ncmFtU3RlcExpc3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnN0ZXBzID0gW107XG4gICAgfVxuICAgIGFkZFN0ZXAoZGlyKSB7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBuZXcgUHJvZ3JhbVN0ZXAoZGlyLCB0aGlzKTtcbiAgICAgICAgdGhpcy5zdGVwcy5wdXNoKHN0ZXApO1xuICAgICAgICByZXR1cm4gc3RlcDtcbiAgICB9XG4gICAgc3RlcFBlcmZvcm1lZChpbmRleCkge1xuICAgICAgICB0aGlzLnN0ZXBzW2luZGV4XS51cGRhdGVTdGF0dXMoXCJQRVJGT1JNRURcIik7XG4gICAgfVxuICAgIHN0ZXBGYWlsZWQoaW5kZXgpIHtcbiAgICAgICAgdGhpcy5zdGVwc1tpbmRleF0udXBkYXRlU3RhdHVzKFwiRkFJTEVEXCIpO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5zdGVwcy5mb3JFYWNoKHN0ZXAgPT4gc3RlcC51cGRhdGVTdGF0dXMoXCJERUZBVUxUXCIpKTtcbiAgICB9XG4gICAgZGVsZXRlKHN0ZXApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnN0ZXBzLmluZGV4T2Yoc3RlcCk7XG4gICAgICAgIHRoaXMuc3RlcHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgZGVsZXRlTGFzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RlcHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zdGVwc1t0aGlzLnN0ZXBzLmxlbmd0aCAtIDFdLmRlbGV0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlbGV0ZUFsbCgpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuc3RlcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUxhc3QoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b1Byb2dyYW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0ZXBzLm1hcChzdGVwID0+IHN0ZXAuZGlyKTtcbiAgICB9XG59XG5leHBvcnRzLlByb2dyYW1TdGVwTGlzdCA9IFByb2dyYW1TdGVwTGlzdDtcbmNsYXNzIE1haW4ge1xuICAgIGNvbnN0cnVjdG9yKG1hcFByb3ZpZGVyLCBwcm9ncmFtU3RlcExpc3QgPSBuZXcgUHJvZ3JhbVN0ZXBMaXN0KCkpIHtcbiAgICAgICAgdGhpcy5tYXBQcm92aWRlciA9IG1hcFByb3ZpZGVyO1xuICAgICAgICB0aGlzLnByb2dyYW1TdGVwTGlzdCA9IHByb2dyYW1TdGVwTGlzdDtcbiAgICB9XG4gICAgZXhlY3V0ZVByb2dyYW0oKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gdGhpcy5wcm9ncmFtU3RlcExpc3QudG9Qcm9ncmFtKCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImV4ZWN1dG5nIFwiLCBwKVxuICAgICAgICAgICAgY29uc3QgbWFwID0gdGhpcy5tYXBQcm92aWRlci5nZXRNYXAoKTtcbiAgICAgICAgICAgIG1hcC5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5wcm9ncmFtU3RlcExpc3QucmVzZXQoKTtcbiAgICAgICAgICAgIGxldCBjdXJyUG9zID0gbWFwLmRvZ1RpbGUoKTtcbiAgICAgICAgICAgIGxldCBwaWNrZWRVcEtleUNvdW50ID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4IGluIHApIHtcbiAgICAgICAgICAgICAgICBsZXQgZGlyID0gcFtpbmRleF07XG4gICAgICAgICAgICAgICAgeWllbGQgd2FpdCgyMDApO1xuICAgICAgICAgICAgICAgIGxldCBuZXh0UG9zID0gbWFwLmFkamFjZW50VGlsZUJ5RGlyKGRpcik7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRQb3MgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRQb3Muc3RhdHVzID09PSBleHBvcnRzLkdBVEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwaWNrZWRVcEtleUNvdW50LS0gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyYW1TdGVwTGlzdC5zdGVwRmFpbGVkKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobmV4dFBvcy5zdGF0dXMgPT09IGV4cG9ydHMuS0VZKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaWNrZWRVcEtleUNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VyclBvcy51cGRhdGVTdGF0dXMoZXhwb3J0cy5WSVNJVEVEKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dFBvcy51cGRhdGVTdGF0dXMoZXhwb3J0cy5ET0cpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyUG9zID0gbmV4dFBvcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9ncmFtU3RlcExpc3Quc3RlcFBlcmZvcm1lZChpbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyYW1TdGVwTGlzdC5zdGVwRmFpbGVkKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldFRpbGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXBQcm92aWRlci5nZXRNYXAoKS50aWxlcztcbiAgICB9XG4gICAgc2VsZWN0TWFwKG5hbWUpIHtcbiAgICAgICAgdGhpcy5tYXBQcm92aWRlci5nZXRNYXAoKS50aWxlcy5mb3JFYWNoKHRpbGUgPT4gdGlsZS5kaXNwb3NlKCkpO1xuICAgICAgICB0aGlzLnByb2dyYW1TdGVwTGlzdC5kZWxldGVBbGwoKTtcbiAgICAgICAgdGhpcy5tYXBQcm92aWRlci5zd2l0Y2hUb01hcChuYW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwUHJvdmlkZXIuZ2V0TWFwKCk7XG4gICAgfVxufVxuZXhwb3J0cy5NYWluID0gTWFpbjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IF8xID0gcmVxdWlyZShcIi5cIik7XG5jbGFzcyBSZWFsTWFwUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmFsbE1hcHMgPSB7XG4gICAgICAgICAgICBcImVsc8WRXCI6IG5ldyBfMS5HYW1lTWFwKFtcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLkQsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5CXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRV0sXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIFwibcOhc29kaWtcIjogbmV3IF8xLkdhbWVNYXAoW1xuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FXSxcbiAgICAgICAgICAgICAgICBbXzEuRCwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuRV0sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkVdLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuQiwgXzEuRSwgXzEuRSwgXzEuXywgXzEuX11cbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXCJoYXJtYWRpa1wiOiBuZXcgXzEuR2FtZU1hcChbXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkVdLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5FXSxcbiAgICAgICAgICAgICAgICBbXzEuRCwgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLkUsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkJdLFxuICAgICAgICAgICAgICAgIFtfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuX11cbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXCJrdWxjc29zXCI6IG5ldyBfMS5HYW1lTWFwKFtcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuSywgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkcsIF8xLkUsIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5fLCBfMS5ELCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5CLCBfMS5fXVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBcImjDoXJvbWt1bGNzb3NcIjogbmV3IF8xLkdhbWVNYXAoW1xuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5FLCBfMS5FLCBfMS5LLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkcsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkcsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkVdLFxuICAgICAgICAgICAgICAgIFtfMS5FLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5CXSxcbiAgICAgICAgICAgICAgICBbXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuSywgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuR10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLkQsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkssIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkJdXG4gICAgICAgICAgICBdKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmN1cnJlbnRNYXBOYW1lID0gXCJlbHPFkVwiO1xuICAgIH1cbiAgICBnZXRNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbE1hcHNbdGhpcy5jdXJyZW50TWFwTmFtZV07XG4gICAgfVxuICAgIHN3aXRjaFRvTWFwKG5hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFsbE1hcHNbbmFtZV0pXG4gICAgICAgICAgICB0aHJvdyBcIm1hcCBcIiArIG5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiO1xuICAgICAgICB0aGlzLmN1cnJlbnRNYXBOYW1lID0gbmFtZTtcbiAgICB9XG4gICAgbWFwTmFtZXMoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmFsbE1hcHMpO1xuICAgIH1cbn1cbmNvbnN0IG1hcFByb3ZpZGVyID0gbmV3IFJlYWxNYXBQcm92aWRlcigpO1xuY29uc3QgbWFpbiA9IG5ldyBfMS5NYWluKG1hcFByb3ZpZGVyKTtcbmNvbnN0IHBvc2l0aW9uTWVhc3VyZW1lbnRVbml0ID0gXCJ2aFwiO1xubGV0IHRvcE9mZnNldCA9IDA7XG5sZXQgbGVmdE9mZnNldCA9IDIwO1xubGV0IGNlbGxTaXplID0gODtcbmNsYXNzIFRpbGVWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlLCBjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy50aWxlID0gdGlsZTtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGVsLnN0eWxlLm1hcmdpbkxlZnQgPSAobGVmdE9mZnNldCArICh0aWxlLnhPZmZzZXQgKiBjZWxsU2l6ZSkpICsgcG9zaXRpb25NZWFzdXJlbWVudFVuaXQ7XG4gICAgICAgIGVsLnN0eWxlLm1hcmdpblRvcCA9ICh0b3BPZmZzZXQgKyAodGlsZS55T2Zmc2V0ICogY2VsbFNpemUpKSArIHBvc2l0aW9uTWVhc3VyZW1lbnRVbml0O1xuICAgICAgICBlbE1hcC5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHRoaXMudXBkYXRlKHRpbGUuc3RhdHVzKTtcbiAgICAgICAgdGlsZS5vblN0YXR1c0NoYW5nZShzdGF0dXMgPT4gdGhpcy51cGRhdGUoc3RhdHVzKSk7XG4gICAgfVxuICAgIHVwZGF0ZShzdGF0dXMpIHtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgXzEuRE9HOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJkb2dcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLWRvZ1wiPjwvaT4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBfMS5CT05FOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJib25lXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYS1zb2xpZCBmYS1ib25lXCI+PC9pPic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIF8xLkVNUFRZOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIF8xLlZJU0lURUQ6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcInZpc2l0ZWRcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLXBhd1wiPjwvaT4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBfMS5OT05FOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXzEuS0VZOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJrZXlcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLWtleVwiPjwvaT4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBfMS5HQVRFOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJnYXRlXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYS1zb2xpZCBmYS1kdW5nZW9uXCI+PC9pPic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG51bGw6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIFByb2dyYW1TdGVwVmlldyB7XG4gICAgY29uc3RydWN0b3Ioc3RlcCwgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmFtLXN0ZXBzXCIpKSB7XG4gICAgICAgIHRoaXMuc3RlcCA9IHN0ZXA7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlcIik7XG4gICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJmYS1zb2xpZCBmYS1hcnJvdy1cIiArIHRoaXMuc3RlcC5kaXIudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5lbCk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuc3RlcC5kZWxldGUoKSk7XG4gICAgICAgIHRoaXMuc3RlcC5hZGRMaXN0ZW5lcih0aGlzKTtcbiAgICB9XG4gICAgZGVsZXRlZCgpIHtcbiAgICAgICAgdGhpcy5zdGVwLnJlbW92ZUxpc3RlbmVyKHRoaXMpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcbiAgICB9XG4gICAgc3RhdHVzQ2hhbmdlZChzdGF0dXMpIHtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgXCJERUZBVUxUXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5jb2xvciA9IFwiIzY0MzIxZlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlBFUkZPUk1FRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUuY29sb3IgPSBcIiMzNDlkMzNcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJGQUlMRURcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnN0eWxlLmNvbG9yID0gXCJyZWRcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbnN0IGVsTWFwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXBcIik7XG5mdW5jdGlvbiByZW5kZXJNYXAobWFwKSB7XG4gICAgbWFwLnRpbGVzLmZvckVhY2godGlsZSA9PiBuZXcgVGlsZVZpZXcodGlsZSwgZWxNYXApKTtcbn1cbmNvbnN0IHN0ZXBzTW9kZWwgPSBtYWluLnByb2dyYW1TdGVwTGlzdDtcbmZvciAobGV0IGRpciBvZiBbXCJsZWZ0XCIsIFwicmlnaHRcIiwgXCJ1cFwiLCBcImRvd25cIl0pIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1cIiArIGRpcikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgbmV3IFByb2dyYW1TdGVwVmlldyhzdGVwc01vZGVsLmFkZFN0ZXAoZGlyLnRvVXBwZXJDYXNlKCkpKTtcbiAgICB9KTtcbn1cbmNvbnN0IGNvZGUyZGlyID0ge1xuICAgIDM4OiBcInVwXCIsXG4gICAgNDA6IFwiZG93blwiLFxuICAgIDM3OiBcImxlZnRcIixcbiAgICAzOTogXCJyaWdodFwiXG59O1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGUgPT4ge1xuICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XG4gICAgaWYgKGNvZGUyZGlyW2Uua2V5Q29kZV0pIHtcbiAgICAgICAgbmV3IFByb2dyYW1TdGVwVmlldyhzdGVwc01vZGVsLmFkZFN0ZXAoY29kZTJkaXJbZS5rZXlDb2RlXS50b1VwcGVyQ2FzZSgpKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgbWFpbi5leGVjdXRlUHJvZ3JhbSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT09IDQ2IHx8IGUua2V5Q29kZSA9PT0gOCkge1xuICAgICAgICBzdGVwc01vZGVsLmRlbGV0ZUxhc3QoKTtcbiAgICB9XG59KTtcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWV4ZWN1dGVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IG1haW4uZXhlY3V0ZVByb2dyYW0oKSk7XG5sZXQgbWFwU2VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXAtc2VsZWN0b3JcIik7XG5tYXBQcm92aWRlci5tYXBOYW1lcygpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgbGV0IG9wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgb3B0LmlubmVySFRNTCA9IG5hbWU7XG4gICAgb3B0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIG5hbWUpO1xuICAgIG1hcFNlbC5hcHBlbmRDaGlsZChvcHQpO1xufSk7XG5tYXBTZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBlID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICBjb25zdCBtYXBOYW1lID0gdGFyZ2V0LnZhbHVlO1xuICAgIGNvbnNvbGUubG9nKG1hcE5hbWUpO1xuICAgIHJlbmRlck1hcChtYWluLnNlbGVjdE1hcChtYXBOYW1lKSk7XG4gICAgdGFyZ2V0LmJsdXIoKTtcbiAgICBkb2N1bWVudC5ib2R5LmZvY3VzKCk7XG59KTtcbnJlbmRlck1hcChtYXBQcm92aWRlci5nZXRNYXAoKSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=