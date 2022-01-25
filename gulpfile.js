var gulp = require('gulp');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass')(require('sass'));
var cleanCss = require('gulp-clean-css');
var rename = require('gulp-rename');
var colors = require('ansi-colors');
var log = require('fancy-log');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(cleanCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, gulp.series(['sass']));
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('install',  gulp.series(['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      log('bower', colors.cyan(data.id), data.message);
    });
}));

gulp.task('default', gulp.series( ['sass']));
