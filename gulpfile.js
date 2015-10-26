var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var paths = {
  src: ['./src/*.js']
};

gulp.task('lint', function() {
  return gulp.src(paths.src)
    .pipe(jshint({
      esnext: true
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('babel', function() {
  return gulp.src(paths.src)
    .pipe(babel())
    .pipe(gulp.dest('pkg/'));
});

function compile(watch) {
  var bundler = watchify(browserify('./src/linemate.js', { debug: true }).transform(babelify.configure({
    plugins: ['object-assign']
  })));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('linemate.min.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'))
      .pipe(gulp.dest('./demo'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  gulp.watch(paths.src, ['lint', 'babel'])
  return compile(true);
};

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });
gulp.task('default', ['watch']);