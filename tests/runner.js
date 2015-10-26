var polyfill = require('babel-core/polyfill');
var run = require('tape-run');
var browserify = require('browserify');
var babel = require('babelify');

browserify(__dirname + '/linemate.js')
  .transform(babel.configure({ plugins: ['object-assign'] }))
  .bundle()
  .pipe(run())
  .on('results', console.log)
  .pipe(process.stdout);
