"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
function onChange(change) {
    if (change.type === "MOVE") {
    }
}
const map = new _1.GameMap({
    RIGHT: {
        RIGHT: {
            UP: {},
            DOWN: {
                DOWN: {},
                RIGHT: {
                    RIGHT: {
                        RIGHT: {
                            UP: { BONE: {} }
                        }
                    }
                }
            }
        }
    }
});
const main = new _1.Main(() => map, onChange);
class TileView {
    constructor(tile, container) {
        this.tile = tile;
        this.container = container;
        const elPos = this.elPos = document.createElement("div");
        elPos.style.marginLeft = (leftOffset + (tile.xOffset * cellSize)) + positionMeasurementUnit;
        elPos.style.marginTop = (topOffset + (tile.yOffset * cellSize)) + positionMeasurementUnit;
        elMap.appendChild(elPos);
        this.update(tile.status);
        tile.onStatusChange(status => this.update(status));
    }
    update(status) {
        switch (status) {
            case _1.DOG:
                this.elPos.className = "dog";
                this.elPos.innerHTML = '<i class="fa-solid fa-dog"></i>';
                break;
            case _1.BONE:
                this.elPos.className = "bone";
                this.elPos.innerHTML = '<i class="fa-solid fa-bone"></i>';
                break;
            case _1.EMPTY:
                this.elPos.className = "";
                this.elPos.innerHTML = "";
                break;
            case _1.VISITED:
                this.elPos.className = "visited";
                this.elPos.innerHTML = '<i class="fa-solid fa-paw"></i>';
        }
    }
}
const elMap = document.getElementById("map");
const positionMeasurementUnit = "px";
let topOffset = 0;
let leftOffset = 200;
let cellSize = 50;
function renderMap(map) {
    map.tiles.forEach(tile => new TileView(tile, elMap));
}
const pb = main.programBuilder;
pb.listener = (program) => {
    const elSteps = document.getElementById("program-steps");
    elSteps.innerHTML = "";
    program.forEach(dir => {
        const el = document.createElement("i");
        el.className = "fa-solid fa-arrow-" + dir.toLocaleLowerCase();
        elSteps.appendChild(el);
    });
};
for (let dir of ["left", "right", "up", "down"]) {
    document.getElementById("add-" + dir).addEventListener("click", () => {
        pb.add(dir.toUpperCase());
    });
}
document.getElementById("btn-execute").addEventListener("click", () => main.executeProgram());
renderMap(map);
//main.executeProgram([RIGHT, RIGHT, DOWN, RIGHT, RIGHT]).then()
