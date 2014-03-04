var gulp = require('gulp'),
    bower = require('gulp-bower');

gulp.task('default', function(){
  bower()
    .pipe(gulp.dest('public/js/lib/'));
});