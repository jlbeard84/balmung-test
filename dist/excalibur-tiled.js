(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("excalibur"));
	else if(typeof define === 'function' && define.amd)
		define(["excalibur"], factory);
	else if(typeof exports === 'object')
		exports["Extensions.Tiled"] = factory(require("excalibur"));
	else
		root["Extensions.Tiled"] = factory(root["ex"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var excalibur_1 = __webpack_require__(1);
var TiledMapFormat;
(function (TiledMapFormat) {
    /**
     * TMX map layer format
     * @unsupported
     */
    TiledMapFormat[TiledMapFormat["TMX"] = 0] = "TMX";
    /**
     * JSON map layer format
     */
    TiledMapFormat[TiledMapFormat["JSON"] = 1] = "JSON";
})(TiledMapFormat = exports.TiledMapFormat || (exports.TiledMapFormat = {}));
var TiledResource = (function (_super) {
    __extends(TiledResource, _super);
    function TiledResource(path, mapFormat) {
        if (mapFormat === void 0) { mapFormat = TiledMapFormat.JSON; }
        var _this = this;
        switch (mapFormat) {
            case TiledMapFormat.JSON:
                _this = _super.call(this, path, "application/json") || this;
                break;
            default:
                throw "The format " + mapFormat + " is not currently supported. Please export Tiled map as JSON.";
        }
        _this.mapFormat = mapFormat;
        _this.imagePathAccessor = function (p) {
            // Use absolute path if specified
            if (p.indexOf('/') === 0) {
                return p;
            }
            // Load relative to map path
            var pp = path.split('/');
            var relPath = pp.concat([]);
            if (pp.length > 0) {
                // remove file part of path
                relPath.splice(-1);
            }
            relPath.push(p);
            return relPath.join('/');
        };
        return _this;
    }
    TiledResource.prototype.load = function () {
        var _this = this;
        var p = new excalibur_1.Promise();
        _super.prototype.load.call(this).then(function (map) {
            var promises = [];
            // retrieve images from tilesets and create textures
            _this.data.tilesets.forEach(function (ts) {
                var tx = new excalibur_1.Texture(_this.imagePathAccessor(ts.image, ts));
                ts.imageTexture = tx;
                promises.push(tx.load());
                excalibur_1.Logger.getInstance().debug("[Tiled] Loading associated tileset: " + ts.image);
            });
            excalibur_1.Promise.join.apply(_this, promises).then(function () {
                p.resolve(map);
            }, function (value) {
                p.reject(value);
            });
        });
        return p;
    };
    TiledResource.prototype.processData = function (data) {
        if (typeof data !== "string") {
            throw "Tiled map resource " + this.path + " is not the correct content type";
        }
        if (data === void 0) {
            throw "Tiled map resource " + this.path + " is empty";
        }
        switch (this.mapFormat) {
            case TiledMapFormat.JSON:
                return parseJsonMap(data);
        }
    };
    TiledResource.prototype.getTilesetForTile = function (gid) {
        for (var i = this.data.tilesets.length - 1; i >= 0; i--) {
            var ts = this.data.tilesets[i];
            if (ts.firstgid <= gid) {
                return ts;
            }
        }
        return null;
    };
    TiledResource.prototype.getTileMap = function () {
        var map = new excalibur_1.TileMap(0, 0, this.data.tilewidth, this.data.tileheight, this.data.height, this.data.width);
        // register sprite sheets for each tileset in map
        for (var _i = 0, _a = this.data.tilesets; _i < _a.length; _i++) {
            var ts = _a[_i];
            var cols = Math.floor(ts.imagewidth / ts.tilewidth);
            var rows = Math.floor(ts.imageheight / ts.tileheight);
            var ss = new excalibur_1.SpriteSheet(ts.imageTexture, cols, rows, ts.tilewidth, ts.tileheight);
            map.registerSpriteSheet(ts.firstgid.toString(), ss);
        }
        for (var _b = 0, _c = this.data.layers; _b < _c.length; _b++) {
            var layer = _c[_b];
            if (layer.type === "tilelayer") {
                for (var i = 0; i < layer.data.length; i++) {
                    var gid = layer.data[i];
                    if (gid !== 0) {
                        var ts = this.getTilesetForTile(gid);
                        map.data[i].sprites.push(new excalibur_1.TileSprite(ts.firstgid.toString(), gid - ts.firstgid));
                    }
                }
            }
        }
        return map;
    };
    return TiledResource;
}(excalibur_1.Resource));
exports.default = TiledResource;
/**
 * Handles parsing of JSON tiled data
 */
var parseJsonMap = function (data) {
    var json = JSON.parse(data);
    // Decompress layers
    if (json.layers) {
        for (var _i = 0, _a = json.layers; _i < _a.length; _i++) {
            var layer = _a[_i];
            if (typeof layer.data === "string") {
                if (layer.encoding === "base64") {
                    layer.data = decompressors.decompressBase64(layer.data, layer.encoding);
                }
            }
            else {
                layer.data = decompressors.decompressCsv(layer.data);
            }
        }
    }
    return json;
};
/**
 * Decompression implementations
 */
var decompressors = {
    /**
     * Simplest (passes data through since it's uncompressed)
     */
    decompressCsv: function (data) {
        return data;
    },
    /**
     * Uses base64.js implementation to decode string into byte array
     * and then converts (with/without compression) to array of numbers
     */
    decompressBase64: function (b64, encoding) {
        var i, j, l, tmp, placeHolders, arr;
        if (b64.length % 4 > 0) {
            throw new Error('Invalid string. Length must be a multiple of 4');
        }
        var Arr = (typeof Uint8Array !== 'undefined')
            ? Uint8Array
            : Array;
        var PLUS = '+'.charCodeAt(0);
        var SLASH = '/'.charCodeAt(0);
        var NUMBER = '0'.charCodeAt(0);
        var LOWER = 'a'.charCodeAt(0);
        var UPPER = 'A'.charCodeAt(0);
        var PLUS_URL_SAFE = '-'.charCodeAt(0);
        var SLASH_URL_SAFE = '_'.charCodeAt(0);
        function decode(elt) {
            var code = elt.charCodeAt(0);
            if (code === PLUS || code === PLUS_URL_SAFE)
                return 62; // '+'
            if (code === SLASH || code === SLASH_URL_SAFE)
                return 63; // '/'
            if (code < NUMBER)
                return -1; // no match
            if (code < NUMBER + 10)
                return code - NUMBER + 26 + 26;
            if (code < UPPER + 26)
                return code - UPPER;
            if (code < LOWER + 26)
                return code - LOWER + 26;
        }
        // the number of equal signs (place holders)
        // if there are two placeholders, than the two characters before it
        // represent one byte
        // if there is only one, then the three characters before it represent 2 bytes
        // this is just a cheap hack to not do indexOf twice
        var len = b64.length;
        placeHolders = b64.charAt(len - 2) === '=' ? 2 : b64.charAt(len - 1) === '=' ? 1 : 0;
        // base64 is 4/3 + up to two characters of the original data
        arr = new Arr(b64.length * 3 / 4 - placeHolders);
        // if there are placeholders, only get up to the last complete 4 chars
        l = placeHolders > 0 ? b64.length - 4 : b64.length;
        var L = 0;
        function push(v) {
            arr[L++] = v;
        }
        for (i = 0, j = 0; i < l; i += 4, j += 3) {
            tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3));
            push((tmp & 0xFF0000) >> 16);
            push((tmp & 0xFF00) >> 8);
            push(tmp & 0xFF);
        }
        if (placeHolders === 2) {
            tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4);
            push(tmp & 0xFF);
        }
        else if (placeHolders === 1) {
            tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2);
            push((tmp >> 8) & 0xFF);
            push(tmp & 0xFF);
        }
        // Byte array
        // TODO handle compression
        var toNumber = function (byteArray) {
            var value = 0;
            for (var i = byteArray.length - 1; i >= 0; i--) {
                value = (value * 256) + byteArray[i] * 1;
            }
            return value;
        };
        var resultLen = arr.length / 4;
        var result = new Array(resultLen);
        for (i = 0; i < resultLen; i++) {
            result[i] = toNumber(arr.slice(i * 4, i * 4 + 3));
        }
        return result;
    }
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=excalibur-tiled.js.map