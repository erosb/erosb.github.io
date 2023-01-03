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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWJ1bmRsZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWE7QUFDYjtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELFlBQVksR0FBRyx1QkFBdUIsR0FBRyxtQkFBbUIsR0FBRyxlQUFlLEdBQUcsZUFBZSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxZQUFZLEdBQUcsWUFBWSxHQUFHLGVBQWUsR0FBRyxXQUFXLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxZQUFZLEdBQUcsYUFBYSxHQUFHLFlBQVksR0FBRyxVQUFVO0FBQzlVLFVBQVU7QUFDVixZQUFZO0FBQ1osYUFBYTtBQUNiLFlBQVk7QUFDWixZQUFZO0FBQ1osYUFBYTtBQUNiLFdBQVc7QUFDWCxlQUFlO0FBQ2YsWUFBWTtBQUNaLFlBQVk7QUFDWixXQUFXO0FBQ1gsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1QsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixhQUFhO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHlCQUF5QjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZOzs7Ozs7O1VDOU5aO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7QUN0QmE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsV0FBVyxtQkFBTyxDQUFDLHlCQUFHO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCIsInNvdXJjZXMiOlsid2VicGFjazovL2Fycm93LXByb2dyYW1taW5nLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL2Fycm93LXByb2dyYW1taW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Fycm93LXByb2dyYW1taW5nLy4vc3JjL2dhbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTWFpbiA9IGV4cG9ydHMuUHJvZ3JhbVN0ZXBMaXN0ID0gZXhwb3J0cy5Qcm9ncmFtU3RlcCA9IGV4cG9ydHMuTWFwVGlsZSA9IGV4cG9ydHMuR2FtZU1hcCA9IGV4cG9ydHMuSyA9IGV4cG9ydHMuRyA9IGV4cG9ydHMuXyA9IGV4cG9ydHMuRCA9IGV4cG9ydHMuQiA9IGV4cG9ydHMuRSA9IGV4cG9ydHMuS0VZID0gZXhwb3J0cy5HQVRFID0gZXhwb3J0cy5OT05FID0gZXhwb3J0cy5WSVNJVEVEID0gZXhwb3J0cy5ET0cgPSBleHBvcnRzLkVNUFRZID0gZXhwb3J0cy5CT05FID0gZXhwb3J0cy5MRUZUID0gZXhwb3J0cy5SSUdIVCA9IGV4cG9ydHMuRE9XTiA9IGV4cG9ydHMuVVAgPSB2b2lkIDA7XG5leHBvcnRzLlVQID0gXCJVUFwiO1xuZXhwb3J0cy5ET1dOID0gXCJET1dOXCI7XG5leHBvcnRzLlJJR0hUID0gXCJSSUdIVFwiO1xuZXhwb3J0cy5MRUZUID0gXCJMRUZUXCI7XG5leHBvcnRzLkJPTkUgPSBcIkJPTkVcIjtcbmV4cG9ydHMuRU1QVFkgPSBcIkVNUFRZXCI7XG5leHBvcnRzLkRPRyA9IFwiRE9HXCI7XG5leHBvcnRzLlZJU0lURUQgPSBcIlZJU0lURURcIjtcbmV4cG9ydHMuTk9ORSA9IFwiTk9ORVwiO1xuZXhwb3J0cy5HQVRFID0gXCJHQVRFXCI7XG5leHBvcnRzLktFWSA9IFwiS0VZXCI7XG5leHBvcnRzLkUgPSBleHBvcnRzLkVNUFRZO1xuZXhwb3J0cy5CID0gZXhwb3J0cy5CT05FO1xuZXhwb3J0cy5EID0gZXhwb3J0cy5ET0c7XG5leHBvcnRzLl8gPSBleHBvcnRzLk5PTkU7XG5leHBvcnRzLkcgPSBleHBvcnRzLkdBVEU7XG5leHBvcnRzLksgPSBleHBvcnRzLktFWTtcbmNsYXNzIEdhbWVNYXAge1xuICAgIGNvbnN0cnVjdG9yKGJsdWVwcmludCkge1xuICAgICAgICB0aGlzLmJsdWVwcmludCA9IGJsdWVwcmludDtcbiAgICAgICAgdGhpcy50aWxlUG9zTWFwcGluZyA9IFtdO1xuICAgICAgICB0aGlzLnRpbGVzID0gdGhpcy5pbml0VGlsZXMoKTtcbiAgICB9XG4gICAgaW5pdFRpbGVzKCkge1xuICAgICAgICBjb25zdCBydmFsID0gbmV3IEFycmF5KCk7XG4gICAgICAgIGZvciAobGV0IHkgaW4gdGhpcy5ibHVlcHJpbnQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IHggaW4gdGhpcy5ibHVlcHJpbnRbeV0pIHtcbiAgICAgICAgICAgICAgICBydmFsLnB1c2gobmV3IE1hcFRpbGUodGhpcy5ibHVlcHJpbnRbeV1beF0sIE51bWJlcih4KSwgTnVtYmVyKHkpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJ2YWw7XG4gICAgfVxuICAgIGZpbmRUaWxlKHBvcykge1xuICAgICAgICBmb3IgKGxldCBwYWlyIG9mIHRoaXMudGlsZVBvc01hcHBpbmcpIHtcbiAgICAgICAgICAgIGlmIChwYWlyWzBdID09PSBwb3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFpclsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBcIm5vdCBmb3VuZFwiO1xuICAgIH1cbiAgICBkb2dUaWxlKCkge1xuICAgICAgICBjb25zdCBydmFsID0gdGhpcy50aWxlcy5maWx0ZXIodGlsZSA9PiB0aWxlLnN0YXR1cyA9PT0gZXhwb3J0cy5ET0cpO1xuICAgICAgICBpZiAocnZhbC5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHRocm93IGAke3J2YWwubGVuZ3RofSBkb2cgdGlsZXMgZm91bmQgaW5zdGVhZCBvZiAxYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnZhbFswXTtcbiAgICB9XG4gICAgYWRqYWNlbnRUaWxlQnlEaXIoZGlyKSB7XG4gICAgICAgIGxldCBjdXIgPSB0aGlzLmRvZ1RpbGUoKTtcbiAgICAgICAgbGV0IHsgeE9mZnNldDogeCwgeU9mZnNldDogeSB9ID0gY3VyO1xuICAgICAgICBzd2l0Y2ggKGRpcikge1xuICAgICAgICAgICAgY2FzZSBleHBvcnRzLlVQOlxuICAgICAgICAgICAgICAgIHktLTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZXhwb3J0cy5ET1dOOlxuICAgICAgICAgICAgICAgIHkrKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZXhwb3J0cy5MRUZUOlxuICAgICAgICAgICAgICAgIHgtLTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZXhwb3J0cy5SSUdIVDpcbiAgICAgICAgICAgICAgICB4Kys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJ2YWwgPSB0aGlzLnRpbGVzLmZpbHRlcih0aWxlID0+IHRpbGUueE9mZnNldCA9PT0geCAmJiB0aWxlLnlPZmZzZXQgPT09IHkgJiYgdGlsZS5zdGF0dXMgIT0gZXhwb3J0cy5OT05FKTtcbiAgICAgICAgaWYgKHJ2YWwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhyb3cgXCJzaGVldFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJ2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcnZhbFswXTtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMudGlsZXMuZm9yRWFjaCh0aWxlID0+IHRpbGUudXBkYXRlU3RhdHVzKHRoaXMuYmx1ZXByaW50W3RpbGUueU9mZnNldF1bdGlsZS54T2Zmc2V0XSkpO1xuICAgIH1cbn1cbmV4cG9ydHMuR2FtZU1hcCA9IEdhbWVNYXA7XG47XG5mdW5jdGlvbiB3YWl0KG1zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlcyA9PiBzZXRUaW1lb3V0KHJlcywgbXMpKTtcbn1cbmNsYXNzIE1hcFRpbGUge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgeE9mZnNldCwgeU9mZnNldCkge1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy54T2Zmc2V0ID0geE9mZnNldDtcbiAgICAgICAgdGhpcy55T2Zmc2V0ID0geU9mZnNldDtcbiAgICAgICAgdGhpcy5saXN0ZW5lciA9ICgpID0+IHsgfTtcbiAgICB9XG4gICAgb25TdGF0dXNDaGFuZ2UobGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgIH1cbiAgICB1cGRhdGVTdGF0dXMobmV3U3RhdHVzKSB7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICB0aGlzLmxpc3RlbmVyKG5ld1N0YXR1cyk7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXIobnVsbCk7XG4gICAgfVxufVxuZXhwb3J0cy5NYXBUaWxlID0gTWFwVGlsZTtcbmNsYXNzIFByb2dyYW1TdGVwIHtcbiAgICBjb25zdHJ1Y3RvcihkaXIsIGNvbnRhaW5pbmdMaXN0KSB7XG4gICAgICAgIHRoaXMuZGlyID0gZGlyO1xuICAgICAgICB0aGlzLmNvbnRhaW5pbmdMaXN0ID0gY29udGFpbmluZ0xpc3Q7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gICAgfVxuICAgIGRlbGV0ZSgpIHtcbiAgICAgICAgdGhpcy5jb250YWluaW5nTGlzdC5kZWxldGUodGhpcyk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2gobCA9PiBsLmRlbGV0ZWQoKSk7XG4gICAgfVxuICAgIGFkZExpc3RlbmVyKGwpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaChsKTtcbiAgICB9XG4gICAgcmVtb3ZlTGlzdGVuZXIobCkge1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICAgIH1cbiAgICB1cGRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKGwgPT4gbC5zdGF0dXNDaGFuZ2VkKHN0YXR1cykpO1xuICAgIH1cbn1cbmV4cG9ydHMuUHJvZ3JhbVN0ZXAgPSBQcm9ncmFtU3RlcDtcbmNsYXNzIFByb2dyYW1TdGVwTGlzdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuc3RlcHMgPSBbXTtcbiAgICB9XG4gICAgYWRkU3RlcChkaXIpIHtcbiAgICAgICAgY29uc3Qgc3RlcCA9IG5ldyBQcm9ncmFtU3RlcChkaXIsIHRoaXMpO1xuICAgICAgICB0aGlzLnN0ZXBzLnB1c2goc3RlcCk7XG4gICAgICAgIHJldHVybiBzdGVwO1xuICAgIH1cbiAgICBzdGVwUGVyZm9ybWVkKGluZGV4KSB7XG4gICAgICAgIHRoaXMuc3RlcHNbaW5kZXhdLnVwZGF0ZVN0YXR1cyhcIlBFUkZPUk1FRFwiKTtcbiAgICB9XG4gICAgc3RlcEZhaWxlZChpbmRleCkge1xuICAgICAgICB0aGlzLnN0ZXBzW2luZGV4XS51cGRhdGVTdGF0dXMoXCJGQUlMRURcIik7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnN0ZXBzLmZvckVhY2goc3RlcCA9PiBzdGVwLnVwZGF0ZVN0YXR1cyhcIkRFRkFVTFRcIikpO1xuICAgIH1cbiAgICBkZWxldGUoc3RlcCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3RlcHMuaW5kZXhPZihzdGVwKTtcbiAgICAgICAgdGhpcy5zdGVwcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBkZWxldGVMYXN0KCkge1xuICAgICAgICBpZiAodGhpcy5zdGVwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0ZXBzW3RoaXMuc3RlcHMubGVuZ3RoIC0gMV0uZGVsZXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGVsZXRlQWxsKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5zdGVwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlTGFzdCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvUHJvZ3JhbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RlcHMubWFwKHN0ZXAgPT4gc3RlcC5kaXIpO1xuICAgIH1cbn1cbmV4cG9ydHMuUHJvZ3JhbVN0ZXBMaXN0ID0gUHJvZ3JhbVN0ZXBMaXN0O1xuY2xhc3MgTWFpbiB7XG4gICAgY29uc3RydWN0b3IobWFwUHJvdmlkZXIsIHByb2dyYW1TdGVwTGlzdCA9IG5ldyBQcm9ncmFtU3RlcExpc3QoKSkge1xuICAgICAgICB0aGlzLm1hcFByb3ZpZGVyID0gbWFwUHJvdmlkZXI7XG4gICAgICAgIHRoaXMucHJvZ3JhbVN0ZXBMaXN0ID0gcHJvZ3JhbVN0ZXBMaXN0O1xuICAgIH1cbiAgICBleGVjdXRlUHJvZ3JhbSgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSB0aGlzLnByb2dyYW1TdGVwTGlzdC50b1Byb2dyYW0oKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZXhlY3V0bmcgXCIsIHApXG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLm1hcFByb3ZpZGVyLmdldE1hcCgpO1xuICAgICAgICAgICAgbWFwLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLnByb2dyYW1TdGVwTGlzdC5yZXNldCgpO1xuICAgICAgICAgICAgbGV0IGN1cnJQb3MgPSBtYXAuZG9nVGlsZSgpO1xuICAgICAgICAgICAgbGV0IHBpY2tlZFVwS2V5Q291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaW5kZXggaW4gcCkge1xuICAgICAgICAgICAgICAgIGxldCBkaXIgPSBwW2luZGV4XTtcbiAgICAgICAgICAgICAgICB5aWVsZCB3YWl0KDIwMCk7XG4gICAgICAgICAgICAgICAgbGV0IG5leHRQb3MgPSBtYXAuYWRqYWNlbnRUaWxlQnlEaXIoZGlyKTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dFBvcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFBvcy5zdGF0dXMgPT09IGV4cG9ydHMuR0FURSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBpY2tlZFVwS2V5Q291bnQtLSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZ3JhbVN0ZXBMaXN0LnN0ZXBGYWlsZWQoaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChuZXh0UG9zLnN0YXR1cyA9PT0gZXhwb3J0cy5LRVkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpY2tlZFVwS2V5Q291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdXJyUG9zLnVwZGF0ZVN0YXR1cyhleHBvcnRzLlZJU0lURUQpO1xuICAgICAgICAgICAgICAgICAgICBuZXh0UG9zLnVwZGF0ZVN0YXR1cyhleHBvcnRzLkRPRyk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJQb3MgPSBuZXh0UG9zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyYW1TdGVwTGlzdC5zdGVwUGVyZm9ybWVkKGluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZ3JhbVN0ZXBMaXN0LnN0ZXBGYWlsZWQoaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0VGlsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcFByb3ZpZGVyLmdldE1hcCgpLnRpbGVzO1xuICAgIH1cbiAgICBzZWxlY3RNYXAobmFtZSkge1xuICAgICAgICB0aGlzLm1hcFByb3ZpZGVyLmdldE1hcCgpLnRpbGVzLmZvckVhY2godGlsZSA9PiB0aWxlLmRpc3Bvc2UoKSk7XG4gICAgICAgIHRoaXMucHJvZ3JhbVN0ZXBMaXN0LmRlbGV0ZUFsbCgpO1xuICAgICAgICB0aGlzLm1hcFByb3ZpZGVyLnN3aXRjaFRvTWFwKG5hbWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5tYXBQcm92aWRlci5nZXRNYXAoKTtcbiAgICB9XG59XG5leHBvcnRzLk1haW4gPSBNYWluO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgXzEgPSByZXF1aXJlKFwiLlwiKTtcbmNsYXNzIFJlYWxNYXBQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuYWxsTWFwcyA9IHtcbiAgICAgICAgICAgIFwiZWxzxZFcIjogbmV3IF8xLkdhbWVNYXAoW1xuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuRCwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkJdLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FXSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXCJtw6Fzb2Rpa1wiOiBuZXcgXzEuR2FtZU1hcChbXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkUsIF8xLkVdLFxuICAgICAgICAgICAgICAgIFtfMS5ELCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5FXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRV0sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5CLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fXVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBcImhhcm1hZGlrXCI6IG5ldyBfMS5HYW1lTWFwKFtcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRV0sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkVdLFxuICAgICAgICAgICAgICAgIFtfMS5ELCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuRSwgXzEuXywgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuXywgXzEuXywgXzEuRSwgXzEuQl0sXG4gICAgICAgICAgICAgICAgW18xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fXVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBcImt1bGNzb3NcIjogbmV3IF8xLkdhbWVNYXAoW1xuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5FLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuRSwgXzEuXywgXzEuXywgXzEuRSwgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLkUsIF8xLl8sIF8xLl8sIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLl9dLFxuICAgICAgICAgICAgICAgIFtfMS5fLCBfMS5LLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5fLCBfMS5FLCBfMS5fLCBfMS5fXSxcbiAgICAgICAgICAgICAgICBbXzEuXywgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuRSwgXzEuXywgXzEuRSwgXzEuRSwgXzEuRywgXzEuRSwgXzEuX10sXG4gICAgICAgICAgICAgICAgW18xLl8sIF8xLl8sIF8xLl8sIF8xLkQsIF8xLl8sIF8xLkUsIF8xLkUsIF8xLkUsIF8xLl8sIF8xLl8sIF8xLkIsIF8xLl9dXG4gICAgICAgICAgICBdKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmN1cnJlbnRNYXBOYW1lID0gXCJlbHPFkVwiO1xuICAgIH1cbiAgICBnZXRNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbE1hcHNbdGhpcy5jdXJyZW50TWFwTmFtZV07XG4gICAgfVxuICAgIHN3aXRjaFRvTWFwKG5hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFsbE1hcHNbbmFtZV0pXG4gICAgICAgICAgICB0aHJvdyBcIm1hcCBcIiArIG5hbWUgKyBcIiBkb2VzIG5vdCBleGlzdFwiO1xuICAgICAgICB0aGlzLmN1cnJlbnRNYXBOYW1lID0gbmFtZTtcbiAgICB9XG4gICAgbWFwTmFtZXMoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmFsbE1hcHMpO1xuICAgIH1cbn1cbmNvbnN0IG1hcFByb3ZpZGVyID0gbmV3IFJlYWxNYXBQcm92aWRlcigpO1xuY29uc3QgbWFpbiA9IG5ldyBfMS5NYWluKG1hcFByb3ZpZGVyKTtcbmNvbnN0IHBvc2l0aW9uTWVhc3VyZW1lbnRVbml0ID0gXCJ2aFwiO1xubGV0IHRvcE9mZnNldCA9IDA7XG5sZXQgbGVmdE9mZnNldCA9IDIwO1xubGV0IGNlbGxTaXplID0gODtcbmNsYXNzIFRpbGVWaWV3IHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlLCBjb250YWluZXIpIHtcbiAgICAgICAgdGhpcy50aWxlID0gdGlsZTtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGVsLnN0eWxlLm1hcmdpbkxlZnQgPSAobGVmdE9mZnNldCArICh0aWxlLnhPZmZzZXQgKiBjZWxsU2l6ZSkpICsgcG9zaXRpb25NZWFzdXJlbWVudFVuaXQ7XG4gICAgICAgIGVsLnN0eWxlLm1hcmdpblRvcCA9ICh0b3BPZmZzZXQgKyAodGlsZS55T2Zmc2V0ICogY2VsbFNpemUpKSArIHBvc2l0aW9uTWVhc3VyZW1lbnRVbml0O1xuICAgICAgICBlbE1hcC5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHRoaXMudXBkYXRlKHRpbGUuc3RhdHVzKTtcbiAgICAgICAgdGlsZS5vblN0YXR1c0NoYW5nZShzdGF0dXMgPT4gdGhpcy51cGRhdGUoc3RhdHVzKSk7XG4gICAgfVxuICAgIHVwZGF0ZShzdGF0dXMpIHtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgXzEuRE9HOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJkb2dcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLWRvZ1wiPjwvaT4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBfMS5CT05FOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJib25lXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYS1zb2xpZCBmYS1ib25lXCI+PC9pPic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIF8xLkVNUFRZOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIF8xLlZJU0lURUQ6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5jbGFzc05hbWUgPSBcInZpc2l0ZWRcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLXBhd1wiPjwvaT4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBfMS5OT05FOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXzEuS0VZOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJrZXlcIjtcbiAgICAgICAgICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZhLXNvbGlkIGZhLWtleVwiPjwvaT4nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBfMS5HQVRFOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJnYXRlXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYS1zb2xpZCBmYS1kdW5nZW9uXCI+PC9pPic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG51bGw6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIFByb2dyYW1TdGVwVmlldyB7XG4gICAgY29uc3RydWN0b3Ioc3RlcCwgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9ncmFtLXN0ZXBzXCIpKSB7XG4gICAgICAgIHRoaXMuc3RlcCA9IHN0ZXA7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlcIik7XG4gICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJmYS1zb2xpZCBmYS1hcnJvdy1cIiArIHRoaXMuc3RlcC5kaXIudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5lbCk7XG4gICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuc3RlcC5kZWxldGUoKSk7XG4gICAgICAgIHRoaXMuc3RlcC5hZGRMaXN0ZW5lcih0aGlzKTtcbiAgICB9XG4gICAgZGVsZXRlZCgpIHtcbiAgICAgICAgdGhpcy5zdGVwLnJlbW92ZUxpc3RlbmVyKHRoaXMpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcbiAgICB9XG4gICAgc3RhdHVzQ2hhbmdlZChzdGF0dXMpIHtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgXCJERUZBVUxUXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5lbC5zdHlsZS5jb2xvciA9IFwiIzY0MzIxZlwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIlBFUkZPUk1FRFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuZWwuc3R5bGUuY29sb3IgPSBcIiMzNDlkMzNcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJGQUlMRURcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmVsLnN0eWxlLmNvbG9yID0gXCJyZWRcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbmNvbnN0IGVsTWFwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXBcIik7XG5mdW5jdGlvbiByZW5kZXJNYXAobWFwKSB7XG4gICAgbWFwLnRpbGVzLmZvckVhY2godGlsZSA9PiBuZXcgVGlsZVZpZXcodGlsZSwgZWxNYXApKTtcbn1cbmNvbnN0IHN0ZXBzTW9kZWwgPSBtYWluLnByb2dyYW1TdGVwTGlzdDtcbmZvciAobGV0IGRpciBvZiBbXCJsZWZ0XCIsIFwicmlnaHRcIiwgXCJ1cFwiLCBcImRvd25cIl0pIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1cIiArIGRpcikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgbmV3IFByb2dyYW1TdGVwVmlldyhzdGVwc01vZGVsLmFkZFN0ZXAoZGlyLnRvVXBwZXJDYXNlKCkpKTtcbiAgICB9KTtcbn1cbmNvbnN0IGNvZGUyZGlyID0ge1xuICAgIDM4OiBcInVwXCIsXG4gICAgNDA6IFwiZG93blwiLFxuICAgIDM3OiBcImxlZnRcIixcbiAgICAzOTogXCJyaWdodFwiXG59O1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGUgPT4ge1xuICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XG4gICAgaWYgKGNvZGUyZGlyW2Uua2V5Q29kZV0pIHtcbiAgICAgICAgbmV3IFByb2dyYW1TdGVwVmlldyhzdGVwc01vZGVsLmFkZFN0ZXAoY29kZTJkaXJbZS5rZXlDb2RlXS50b1VwcGVyQ2FzZSgpKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgbWFpbi5leGVjdXRlUHJvZ3JhbSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLmtleUNvZGUgPT09IDQ2IHx8IGUua2V5Q29kZSA9PT0gOCkge1xuICAgICAgICBzdGVwc01vZGVsLmRlbGV0ZUxhc3QoKTtcbiAgICB9XG59KTtcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWV4ZWN1dGVcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IG1haW4uZXhlY3V0ZVByb2dyYW0oKSk7XG5sZXQgbWFwU2VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXAtc2VsZWN0b3JcIik7XG5tYXBQcm92aWRlci5tYXBOYW1lcygpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgbGV0IG9wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgb3B0LmlubmVySFRNTCA9IG5hbWU7XG4gICAgb3B0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIG5hbWUpO1xuICAgIG1hcFNlbC5hcHBlbmRDaGlsZChvcHQpO1xufSk7XG5tYXBTZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBlID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICBjb25zdCBtYXBOYW1lID0gdGFyZ2V0LnZhbHVlO1xuICAgIGNvbnNvbGUubG9nKG1hcE5hbWUpO1xuICAgIHJlbmRlck1hcChtYWluLnNlbGVjdE1hcChtYXBOYW1lKSk7XG4gICAgdGFyZ2V0LmJsdXIoKTtcbiAgICBkb2N1bWVudC5ib2R5LmZvY3VzKCk7XG59KTtcbnJlbmRlck1hcChtYXBQcm92aWRlci5nZXRNYXAoKSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=