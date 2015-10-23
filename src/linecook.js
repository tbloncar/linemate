import utils from './utils';

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

const defaults = {
  color: '#000',
  entryPoint: 'center',
  exitPoint: 'center',
  order: 'keep',
  width: 1
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

function styleCanvas(canvas, ratio, bounds) {
  const canvasWidth = bounds.right - bounds.left;
  const canvasHeight = bounds.bottom - bounds.top;

  canvas.style.position = 'absolute';
  canvas.style['z-index'] = -1;
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
  let ratio = utils.getCanvasScaleRatio(context);

  context.scale(ratio, ratio);
  styleCanvas(canvas, ratio, bounds);
  document.body.appendChild(canvas);

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
  opts = Object.assign({}, defaults, opts);
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

  // Begin path and move to first node's exit point
  context.beginPath();
  context.moveTo(pnodes[0].exitPoint.x, pnodes[0].exitPoint.y);

  return { context, pnodes };
}


/*
 * Connect two or more DOM nodes without
 * completeness.
 *
 * @param {Array[Node]} - An array of two or more DOM nodes
 * @param {object} - An options object
 */
function connect(nodes, opts) {
  // Canvas setup and node processing
  const { context, pnodes } = setup(nodes, opts);

  // Method-specific algorithm
  for(let i = 1, l = pnodes.length; i < l; i++) {
    let pnode = pnodes[i];

    context.lineTo(pnode.entryPoint.x, pnode.entryPoint.y);
    context.moveTo(pnode.exitPoint.x, pnode.exitPoint.y);
  }

  context.stroke();
}

const linecook = {
  connect
};

export default linecook;
