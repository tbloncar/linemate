/**
 *     ___                            __
 *    / (_)___  ___  ____ ___  ____ _/ /____
 *   / / / __ \/ _ \/ __ `__ \/ __ `/ __/ _ \
 *  / / / / / /  __/ / / / / / /_/ / /_/  __/
 * /_/_/_/ /_/\___/_/ /_/ /_/\__,_/\__/\___/

 * linemate.js | version 0.1.4
 * (c) Travis Loncar (https://github.com/tbloncar)
 */

import utils from './utils';

let confinedTo = document.body;
let ratio = 1; // Canvas scale ratio

const canvasClass = 'linemate-canvas';
const pointLabels = {
  center: 0,
  topLeft: 1,
  top: 2,
  topRight: 3,
  right: 4,
  bottomRight: 5,
  bottom: 6,
  bottomLeft: 7,
  left: 8,
};

let defaultOpts = {
  cap: 'round',
  color: '#000',
  dashed: false,
  dashOffset: 0,
  dashSegments: [5, 15],
  entryPoint: 'center',
  exitPoint: 'center',
  join: 'round',
  miterLimit: 10,
  path: 'shortest',
  width: 1,
  zIndex: -1
};

class Node {
  constructor(node, opts) {
    this.dom = node;
    this.oh = node.offsetHeight;
    this.ow = node.offsetWidth;
    this.nt = node.offsetTop;
    this.nb = this.nt + this.oh;
    this.nl = node.offsetLeft;
    this.nr = this.nl + this.ow;

    this.setPath(opts.entryPoint, opts.exitPoint);
  }

  setPath(entryLabel, exitLabel) {
    this.entryPoint = this.getPoint(entryLabel);
    this.exitPoint = this.getPoint(exitLabel);
  }

  getCoord(abbr) {
    switch(abbr) {
    case 'hc':
      return this.nl + this.ow/2;
    case 'vc':
      return this.nt + this.oh/2;
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

  getPoint(label) {
    const n = this;

    switch(pointLabels[label]) {
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
}

class Bounds {
  constructor(top, right, bottom, left) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getLocalizedCopy(bounds) {
    return new Point(this.x - bounds.left, this.y - bounds.top);
  }
}

function decorateCanvas(canvas, ratio, bounds) {
  const canvasWidth = bounds.right - bounds.left;
  const canvasHeight = bounds.bottom - bounds.top;

  if(canvas.classList) {
    canvas.classList.add(canvasClass);
  } else {
    canvas.className += ` ${canvasClass}`;
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
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  ratio = utils.getCanvasScaleRatio(context);

  context.scale(ratio, ratio);
  decorateCanvas(canvas, ratio, bounds);
  confinedTo.appendChild(canvas);

  return context;
}

function getCanvasBounds(nodes) {
  let minL = Number.MAX_VALUE;
  let minT = Number.MAX_VALUE;
  let maxB = 0;
  let maxR = 0;

  nodes.forEach(node => {
    if(node.nt < minT) minT = node.nt;
    if(node.nb > maxB) maxB = node.nb;
    if(node.nl < minL) minL = node.nl;
    if(node.nr > maxR) maxR = node.nr;
  });

  return new Bounds(minT, maxR, maxB, minL);
}

function setup(nodes, opts) {
  opts = Object.assign({}, defaultOpts, opts);
  nodes = nodes.map((node) => new Node(node, opts));

  const bounds = getCanvasBounds(nodes);
  const context = createCanvas(bounds);

  // Map nodes to path nodes, adjusting entry/exit
  // points with canvas bounds
  let pnodes = nodes.map(n => {
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

  if(opts.dashed) {
    context.setLineDash(opts.dashSegments);
    context.lineDashOffset = opts.dashOffset;
  }

  context.beginPath();

  return { context, pnodes };
}

function draw(nodes, opts, doStrokes) {
  // Use selector to collect nodes
  if(typeof nodes === 'string') {
    let selector = nodes;
    nodes = Array.from(document.querySelectorAll(nodes));

    if(!nodes.length) {
      throw `No nodes found for the provided selector: ${selector}`;
    }
  }

  if(nodes.length < 2) {
    if(nodes.length === 0) {
      throw `No nodes provided!`;
    } else {
      console.warn('Please provide at least two DOM nodes!');
    }
  }

  // If 'nodes' is an array of selectors,
  // map to DOM nodes
  if(typeof nodes[0] === 'string') {
    nodes = nodes.map(n => document.querySelector(node));
  }

  // Canvas setup and node processing
  const { context, pnodes } = setup(nodes, opts);

  // Method-specific stroke algorithm
  doStrokes(context, pnodes, opts);

  // Commence stroke
  context.stroke();
}

// Draw strategy for "shortest" path
function drawShortestPath(context, nextNode) {
  context.lineTo(nextNode.entryPoint.x * ratio, nextNode.entryPoint.y * ratio);
}

// Draw strategy for "square-v" path
function drawSquareVPath(context, lastNode, nextNode) {
  const lastExitPoint = new Point(lastNode.exitPoint.x * ratio, lastNode.exitPoint.y * ratio);
  const nextEntryPoint = new Point(nextNode.entryPoint.x * ratio, nextNode.entryPoint.y * ratio);
  const minY = Math.min(lastExitPoint.y, nextEntryPoint.y);
  const midY = minY + Math.abs(lastExitPoint.y - nextEntryPoint.y)/2;

  context.lineTo(lastExitPoint.x, midY);
  context.moveTo(lastExitPoint.x, midY);
  context.lineTo(nextEntryPoint.x, midY);
  context.moveTo(nextEntryPoint.x, midY);
  context.lineTo(nextEntryPoint.x, nextEntryPoint.y);
  context.moveTo(nextEntryPoint.x, nextEntryPoint.y);
}

// Draw strategy for "square-h" path
function drawSquareHPath(context, lastNode, nextNode) {
  const lastExitPoint = new Point(lastNode.exitPoint.x * ratio, lastNode.exitPoint.y * ratio);
  const nextEntryPoint = new Point(nextNode.entryPoint.x * ratio, nextNode.entryPoint.y * ratio);
  const minX = Math.min(lastExitPoint.x, nextEntryPoint.x);
  const midX = minX + Math.abs(lastExitPoint.x - nextEntryPoint.x)/2;

  context.lineTo(midX, lastExitPoint.y);
  context.moveTo(midX, lastExitPoint.y);
  context.lineTo(midX, nextEntryPoint.y);
  context.moveTo(midX, nextEntryPoint.y);
  context.lineTo(nextEntryPoint.x, nextEntryPoint.y);
  context.moveTo(nextEntryPoint.x, nextEntryPoint.y);
}

function doConnect(context, pnodes, opts) {
  context.moveTo(pnodes[0].exitPoint.x * ratio, pnodes[0].exitPoint.y * ratio);

  for(let i = 1, l = pnodes.length; i < l; i++) {
    const lastNode = pnodes[i - 1];
    const pnode = pnodes[i];

    switch(opts.path) {
    case 'shortest':
      drawShortestPath(context, pnode);
      break;
    case 'square-v':
      drawSquareVPath(context, lastNode, pnode);
      break;
    case 'square-h':
      drawSquareHPath(context, lastNode, pnode);
      break;
    }

    context.moveTo(pnode.exitPoint.x, pnode.exitPoint.y);
  }
}

/*
 * Set custom default options
 *
 * @param {object} custom - Custom linemate defaults
 */
function defaults(custom = {}) {
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
  if(typeof node === 'string') {
    confinedTo = document.querySelector(node);
  } else {
    confinedTo = node;
  }
}

/*
 * Clear linemate canvases
 */
function clear() {
  const canvasNodes = Array.from(confinedTo.querySelectorAll(`.${canvasClass}`));
  canvasNodes.forEach(cn => confinedTo.removeChild(cn));
}

/*
 * Connect two or more DOM nodes without completeness.
 *
 * @param {Array[string]|string} nodes - Array of two or more selectors or a selector
 * @param {object} opts - An options object
 */
function connect(nodes, opts = {}) {
  draw(nodes, opts, doConnect);
}

/*
 * Connect two or more DOM nodes with completeness.
 *
 * @param {Array[string]|string} nodes - Array of two or more selectors or a selector
 * @param {object} opts - An options object
 */
function complete(nodes, opts = {}) {
  opts = Object.assign({}, defaultOpts, opts);

  draw(nodes, opts, (context, pnodes, opts) => {
    doConnect(context, pnodes, opts);

    const firstNode = pnodes[0];
    const lastNode = pnodes[pnodes.length - 1];

    // Connect back to first node to complete path
    switch(opts.path) {
    case 'shortest':
      drawShortestPath(context, firstNode);
      break;
    case 'square-v':
      drawSquareVPath(context, lastNode, firstNode);
      break;
    case 'square-h':
      drawSquareHPath(context, lastNode, firstNode);
      break;
    }
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
  const options = opts || {};
  draw(nodes, options, doStrokes);
}

const linemate = {
  defaults,
  confine,
  clear,
  connect,
  complete,
  custom
};

window.linemate = linemate;

export default linemate;
