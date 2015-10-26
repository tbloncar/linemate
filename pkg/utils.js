"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function getCanvasScaleRatio(context) {
  // source: http://www.html5rocks.com/en/tutorials/canvas/hidpi/
  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

  return devicePixelRatio / backingStoreRatio;
}

var utils = {
  getCanvasScaleRatio: getCanvasScaleRatio
};

exports["default"] = utils;
module.exports = exports["default"];