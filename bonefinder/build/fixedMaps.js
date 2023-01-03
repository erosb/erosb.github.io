"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map1 = void 0;
const _1 = require(".");
exports.map1 = new _1.GameMap({
    RIGHT: {
        RIGHT: {
            UP: {},
            DOWN: {
                DOWN: {},
                RIGHT: {
                    RIGHT: {
                        RIGHT: {
                            UP: {
                                BONE: {}
                            }
                        }
                    }
                }
            }
        }
    }
});
