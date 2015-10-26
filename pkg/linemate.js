/**
 *     ___                            __
 *    / (_)___  ___  ____ ___  ____ _/ /____
 *   / / / __ \/ _ \/ __ `__ \/ __ `/ __/ _ \
 *  / / / / / /  __/ / / / / / /_/ / /_/  __/
 * /_/_/_/ /_/\___/_/ /_/ /_/\__,_/\__/\___/

 * linemate.js | version 0.1.3
 * (c) Travis Loncar (https://github.com/tbloncar)
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _babelCorePolyfill = require('babel-core/polyfill');

var _babelCorePolyfill2 = _interopRequireDefault(_babelCorePolyfill);

var confinedTo = document.body;
var ratio = 1; // Canvas scale ratio

var canvasClass = 'linemate-canvas';
var pointLabels = {
  center: 0,
  topLeft: 1,
  top: 2,
  topRight: 3,
  right: 4,
  bottomRight: 5,
  bottom: 6,
  bottomLeft: 7,
  left: 8
};

var defaultOpts = {
  cap: 'round',
  color: '#000',
  dashed: false,
  dashOffset: 0,
  dashSegments: [5, 15],
  entryPoint: 'center',
  exitPoint: 'center',
  join: 'round',
  miterLimit: 10,
  width: 1,
  zIndex: -1
};

var Node = (function () {
  function Node(node, opts) {
    _classCallCheck(this, Node);

    this.dom = node;
    this.oh = node.offsetHeight;
    this.ow = node.offsetWidth;
    this.nt = node.offsetTop;
    this.nb = this.nt + this.oh;
    this.nl = node.offsetLeft;
    this.nr = this.nl + this.ow;

    this.setPath(opts.entryPoint, opts.exitPoint);
  }

  _createClass(Node, [{
    key: 'setPath',
    value: function setPath(entryLabel, exitLabel) {
      this.entryPoint = this.getPoint(entryLabel);
      this.exitPoint = this.getPoint(exitLabel);
    }
  }, {
    key: 'getCoord',
    value: function getCoord(abbr) {
      switch (abbr) {
        case 'hc':
          return this.nl + this.ow / 2;
        case 'vc':
          return this.nt + this.oh / 2;
        case 't':
          return this.nt;
        case 'r':
          return this.nr;
        case 'b':
          return this.nb;
        case 'l':
          return this.nl;
      }
    }
  }, {
    key: 'getPoint',
    value: function getPoint(label) {
      var n = this;

      switch (pointLabels[label]) {
        case pointLabels.center:
          return new Point(n.getCoord('hc'), n.getCoord('vc'));
        case pointLabels.topLeft:
          return new Point(n.getCoord('l'), n.getCoord('t'));
        case pointLabels.top:
          return new Point(n.getCoord('hc'), n.getCoord('t'));
        case pointLabels.topRight:
          return new Point(n.getCoord('r'), n.getCoord('t'));
        case pointLabels.right:
          return new Point(n.getCoord('r'), n.getCoord('vc'));
        case pointLabels.bottomRight:
          return new Point(n.getCoord('r'), n.getCoord('b'));
        case pointLabels.bottom:
          return new Point(n.getCoord('hc'), n.getCoord('b'));
        case pointLabels.bottomLeft:
          return new Point(n.getCoord('l'), n.getCoord('b'));
        case pointLabels.left:
          return new Point(n.getCoord('l'), n.getCoord('vc'));
        default:
          throw 'Invalid point label provided!';
      }
    }
  }]);

  return Node;
})();

var Bounds = function Bounds(top, right, bottom, left) {
  _classCallCheck(this, Bounds);

  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.left = left;
};

var Point = (function () {
  function Point(x, y) {
    _classCallCheck(this, Point);

    this.x = x;
    this.y = y;
  }

  _createClass(Point, [{
    key: 'getLocalizedCopy',
    value: function getLocalizedCopy(bounds) {
      return new Point(this.x - bounds.left, this.y - bounds.top);
    }
  }]);

  return Point;
})();

function decorateCanvas(canvas, ratio, bounds) {
  var canvasWidth = bounds.right - bounds.left;
  var canvasHeight = bounds.bottom - bounds.top;

  if (canvas.classList) {
    canvas.classList.add(canvasClass);
  } else {
    canvas.className += ' ' + canvasClass;
  }

  canvas.style.position = 'absolute';
  canvas.style['z-index'] = defaultOpts.zIndex;
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';
  canvas.style.left = bounds.left + 'px';
  canvas.style.top = bounds.top + 'px';
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
}

function createCanvas(bounds) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  ratio = _utils2['default'].getCanvasScaleRatio(context);

  context.scale(ratio, ratio);
  decorateCanvas(canvas, ratio, bounds);
  confinedTo.appendChild(canvas);

  return context;
}

function getCanvasBounds(nodes) {
  var minL = Number.MAX_VALUE;
  var minT = Number.MAX_VALUE;
  var maxB = 0;
  var maxR = 0;

  nodes.forEach(function (node) {
    if (node.nt < minT) minT = node.nt;
    if (node.nb > maxB) maxB = node.nb;
    if (node.nl < minL) minL = node.nl;
    if (node.nr > maxR) maxR = node.nr;
  });

  return new Bounds(minT, maxR, maxB, minL);
}

function setup(nodes, opts) {
  opts = Object.assign({}, defaultOpts, opts);
  nodes = nodes.map(function (node) {
    return new Node(node, opts);
  });

  var bounds = getCanvasBounds(nodes);
  var context = createCanvas(bounds);

  // Map nodes to path nodes, adjusting entry/exit
  // points with canvas bounds
  var pnodes = nodes.map(function (n) {
    return {
      entryPoint: n.entryPoint.getLocalizedCopy(bounds),
      exitPoint: n.exitPoint.getLocalizedCopy(bounds)
    };
  });

  context.strokeStyle = opts.color;
  context.lineWidth = opts.width;
  context.lineCap = opts.cap;
  context.lineJoin = opts.join;
  context.miterLimit = opts.miterLimit;

  if (opts.dashed) {
    context.setLineDash(opts.dashSegments);
    context.lineDashOffset = opts.dashOffset;
  }

  context.beginPath();

  return { context: context, pnodes: pnodes };
}

function draw(nodes, opts, doStrokes) {
  // Use selector to collect nodes
  if (typeof nodes === 'string') {
    var selector = nodes;
    nodes = Array.from(document.querySelectorAll(nodes));

    if (!nodes.length) {
      throw 'No nodes found for the provided selector: ' + selector;
    }
  }

  if (nodes.length < 2) {
    if (nodes.length === 0) {
      throw 'No nodes provided!';
    } else {
      console.warn('Please provide at least two DOM nodes!');
    }
  }

  // If 'nodes' is an array of selectors,
  // map to DOM nodes
  if (typeof nodes[0] === 'string') {
    nodes = nodes.map(function (n) {
      return document.querySelector(node);
    });
  }

  // Canvas setup and node processing

  var _setup = setup(nodes, opts);

  var context = _setup.context;
  var pnodes = _setup.pnodes;

  // Method-specific stroke algorithm
  doStrokes(context, pnodes);

  // Commence stroke
  context.stroke();
}

function doConnect(context, pnodes) {
  context.moveTo(pnodes[0].exitPoint.x * ratio, pnodes[0].exitPoint.y * ratio);

  for (var i = 1, l = pnodes.length; i < l; i++) {
    var pnode = pnodes[i];

    context.lineTo(pnode.entryPoint.x * ratio, pnode.entryPoint.y * ratio);
    context.moveTo(pnode.exitPoint.x * ratio, pnode.exitPoint.y * ratio);
  }
}

/*
 * Set custom default options
 *
 * @param {object} custom - Custom linemate defaults
 */
function defaults() {
  var custom = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  Object.assign(defaultOpts, custom);

  return defaultOpts;
}

/*
 * Confine linemate to a common parent node
 * other than 'document.body'
 *
 * @param {string|Node} node - A selector or DOM node
 */
function confine(node) {
  if (typeof node === 'string') {
    confinedTo = document.querySelector(node);
  } else {
    confinedTo = node;
  }
}

/*
 * Clear linemate canvases
 */
function clear() {
  var canvasNodes = Array.from(confinedTo.querySelectorAll('.' + canvasClass));
  canvasNodes.forEach(function (cn) {
    return confinedTo.removeChild(cn);
  });
}

/*
 * Connect two or more DOM nodes without completeness.
 *
 * @param {Array[string]|string} nodes - Array of two or more selectors or a selector
 * @param {object} opts - An options object
 */
function connect(nodes) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  draw(nodes, opts, doConnect);
}

/*
 * Connect two or more DOM nodes with completeness.
 *
 * @param {Array[string]|string} nodes - Array of two or more selectors or a selector
 * @param {object} opts - An options object
 */
function complete(nodes) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  draw(nodes, opts, function (context, pnodes) {
    doConnect(context, pnodes);

    // Connect back to first node to complete path
    context.lineTo(pnodes[0].entryPoint.x * ratio, pnodes[0].entryPoint.y * ratio);
  });
}

/*
 * Connect two or more DOM nodes with a custom
 * stroke algorithm.
 *
 * @param {Array[string]|string} nodes - Array of two or more selectors or a selector
 * @param {object} opts - An options object
 * @param {function} doStrokes - Custom stroke algorithm callback
 */
function custom(nodes, opts, doStrokes) {
  var options = opts || {};
  draw(nodes, options, doStrokes);
}

var linemate = {
  defaults: defaults,
  confine: confine,
  clear: clear,
  connect: connect,
  complete: complete,
  custom: custom
};

window.linemate = linemate;

exports['default'] = linemate;
module.exports = exports['default'];