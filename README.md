## linecook.js

Cook up canvas lines between DOM nodes with ease.

### Usage

Use linecook to render canvas lines between DOM nodes.

#### Basic Example

Connect three `div` elements with red, dashed lines, entering
each element at the bottom (center) and exiting at the top (center).
(Note that the options object is—as one might surmise—optional. Defaults
are detailed below.)

Provide elements to connect:

```html
<div id="a" class="box"></div>
<div id="b" class="box"></div>
<div id="c" class="box"></div>
```

Use `linecook.connect` to add lines between the elements.
```js
window.addEventListener('load', function(e) {
  // Create an incomplete graph
  linecook.connect('.box', {
    color: '#ff3300',
    dashed: true,
    entryPoint: 'bottom',
    exitPoint: 'top',
    width: 10
  });
});
```

