import test from 'tape';
import linemate from '../src/linemate';

function clearHTML() {
  document.body.innerHTML = '';
}

test('it exists', (t) => {
  t.true(linemate, 'linemate exists');
  t.end();
});

test('custom defaults', (t) => {
  var custom = linemate.defaults({ color: 'orange' });
  t.equal('orange', custom.color);
  t.end();
});

test('canvas is created', (t) => {
  var div1 = document.createElement('div');
  var div2 = document.createElement('div');
  document.body.appendChild(div1);
  document.body.appendChild(div2);

  linemate.connect([div1, div2]);

  var canvas = document.querySelector('canvas');
  t.true(canvas, 'canvas exists');
  t.end();

  clearHTML();
});

test('canvas has correct styles', (t) => {
  var div1 = document.createElement('div');
  var div2 = document.createElement('div');

  // Style divs
  div1.style.position = 'absolute';
  div1.style.width = 1;
  div1.style.height = 1;
  div1.style.left = '0';
  div1.style.top = '0';

  div2.style.position = 'absolute';
  div2.style.width = '100px';
  div2.style.height = '100px';
  div2.style.left = '400px';
  div2.style.top = '200px';

  document.body.appendChild(div1);
  document.body.appendChild(div2);

  linemate.connect([div1, div2]);

  var canvas = document.querySelector('canvas');

  t.equal(canvas.style['z-index'], '-1');
  t.equal(canvas.style.width, '500px');
  t.equal(canvas.style.height, '300px');
  t.end();

  clearHTML();
});
