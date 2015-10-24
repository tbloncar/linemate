## :dancers: linemate.js

Render canvas lines between DOM nodes with ease.

### Installation

Install linemate with npm:

    npm install --save linemate

No `npm`? Grab `linemate.min.js` from `dist/` and include it in your project.
No dependencies are needed, and `linemate` is made global.

### Usage

Use linemate to render canvas lines between DOM nodes.

#### Example

Connect three `div` elements with red, dashed lines.
(Note that the options object is—as one might guess—**optional**. Defaults
are detailed below.)

Provide elements to connect:

```html
<div id="a" class="node"></div>
<div id="b" class="node"></div>
<div id="c" class="node"></div>
```

Use `linemate.connect` to add lines between the elements.
```js
window.addEventListener('load', function(e) {
  // Render some canvas lines!
  linemate.connect('.node', {
    color: '#ff3300',
    dashed: true,
    width: 10
  });
});
```

#### linemate.connect

Connect nodes such that the last node **is not** connected back to the first node.

```js
/*
 * Connect two or more DOM nodes without completeness.
 *
 * @param {Array[Node]|string} nodes - Array of two or more DOM nodes or a selector
 * @param {object} opts - An options object
 */
function connect(nodes, opts = {}) {
  // ...
}
```

#### linemate.complete

Connect nodes such that the last node **is** connected back to the first node.

```js
/*
 * Connect two or more DOM nodes with completeness.
 *
 * @param {Array[Node]|string} nodes - Array of two or more DOM nodes or a selector
 * @param {object} opts - An options object
 */
function complete(nodes, opts = {}) {
  // ...
}
```

#### linemate.custom

Connect nodes with your own custom algorithm.

```js
/*
 * Connect two or more DOM nodes with a custom
 * stroke algorithm.
 *
 * @param {Array[Node]|string} nodes - Array of two or more DOM nodes or a selector
 * @param {object} opts - An options object
 * @param {function} doStrokes - Custom stroke algorithm callback
 */
function custom(nodes, opts = {}, doStrokes) {
  // ...
}
```
##### Custom Example

In the custom stroke algorithm callback, we have access to both the canvas
`context` and the `pnodes` collection. The `pnodes` collection consists of
objects with an `entryPoint` and `exitPoint`—these are canvas coordinates for
each node derived from the `entryPoint` and `exitPoint` options. Each point has
an `x` and a `y` property.

In this example, we simply draw a wide pink line from the top left of the
canvas (0, 0) to each node entry point.

```js
linemate.custom('.node', {
  color: 'pink',
  width: 30
}, function(context, pnodes) {
  context.moveTo(0, 0);

  for(var i = 0, l = pnodes.length; i < l; i++) {
    var pnode = pnodes[i];

    context.lineTo(pnode.entryPoint.x, pnode.entryPoint.y);
    context.moveTo(0, 0);
  }
});
```
#### linemate.confine

By default, linemate will append the canvas to `document.body`. If the nodes
that you wish to connect are positioned absolutely within some parent element
other than `document.body`, you'll want to confine linemate to that parent node.

```js
/*
 * Confine linemate to a common parent node
 * other than 'document.body'
 *
 * @param {string|Node} node - A selector or DOM node
 */
function confine(node) {
  // ...
}
```

##### Confine Example

If we have an absolutely positioned `#container` node, we can confine our
canvas to this parent node with `linemate.confine`.

Child nodes within parent node:
```html
<div id="container">
  <div id="a" class="node"></div>
  <div id="b" class="node"></div>
  <div id="c" class="node"></div>
</div>
```

Confine canvas to parent node:
```js
linemate.confine('#container-1');
linemate.connect('.node');
```

### Options

The options object can be used to modify canvas line styles, node entry and exit points, etc.

| Option          | Description                   | Default
|-----------------|-------------------------------|---------------------------
| cap             | [CanvasRenderingContext2D.lineCap](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap) | 'round'
| color           | [CanvasRenderingContext2D.strokeStyle](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle) | '#000'
| dashed          | [CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash) | false
| dashOffset      | [CanvasRenderingContext2D.lineDashOffset](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset) | 0
| dashSegments    | [CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash) segments | [5, 15]
| entryPoint      | The location at which each node is entered by an incoming line (valid values outlined below) | 'center'
| exitPoint       | The location at which each node is exited by an outgoing line (valid values outlined below) | 'center'
| join            | [CanvasRenderingContext2D.lineJoin](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin) | 'round'
| miterLimit      | [CanvasRenderingContext2D.miterLimit](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit) | 10
| width           | [CanvasRenderingContext2D.lineWidth](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth) | 1

Valid values for `entryPoint` and `exitPoint` options include the following:

- 'center'
- 'topLeft'
- 'top'
- 'topRight'
- 'right'
- 'bottomRight'
- 'bottom'
- 'bottomLeft'
- 'left'

### License

Copyright (c) 2015 Travis Loncar.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
