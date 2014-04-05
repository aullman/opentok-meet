var gulp = require('gulp'),
    bower = require('gulp-bower'),
    exec = require('child_process').exec;

gulp.task('default', function(){
  bower()
    .pipe(gulp.dest('public/js/lib/'));
});

gulp.task('cordova-bower', function (cb) {
  // couldn't figure out how to get bower to run in a different directory
  exec('cd opentok-meet-cordova;bower install');
  
  // Compile common-js-helpers
  exec('cd opentok-meet-cordova/www/js/lib/common-js-helpers;npm install;grunt', function (err, stdout) {
    console.log(stdout);
    cb(err);
  });
});

gulp.task('cordova', ['cordova-bower'], function (cb) {
  // Copy over the single-sourced JS
  gulp.src('./public/js/*.js')
    .pipe(gulp.dest('opentok-meet-cordova/www/js'));
  
  // Copy over the single-source CSS
  gulp.src('./public/css/*.css')
    .pipe(gulp.dest('opentok-meet-cordova/www/css'));
  
  // Copy over the images
  gulp.src('./public/images/*.png')
    .pipe(gulp.dest('opentok-meet-cordova/www/images'));

  var prepare = function () {
    // Add the ios platform
    exec('cd opentok-meet-cordova;cordova platform add ios', function (err) {
      // Prepare for ios
      exec('cd opentok-meet-cordova;cordova prepare ios', function (err) {
        if (err) cb(err);
        else {
          // Copy over icons
          gulp.src('./opentok-meet-cordova/src/icons/ios7/*.png')
            .pipe(gulp.dest('opentok-meet-cordova/platforms/ios/OpenTokMeet/Resources/icons'));
          // Copy over splash screens
          gulp.src('./opentok-meet-cordova/src/splash/*.png')
            .pipe(gulp.dest('opentok-meet-cordova/platforms/ios/OpenTokMeet/Resources/splash'));
          exec('open opentok-meet-cordova/platforms/ios/OpenTokMeet.xcodeproj');
          cb();
        }
      });
    });
  };
  
  // Install the opentok cordova plugin if it's not already there
  var output = exec('cd opentok-meet-cordova;cordova plugin list', function (err, stdout, stderr) {
    if (err) {
      cb(err);
      return;
    }    
    if (stdout.indexOf('com.tokbox.cordova.opentok') < 0) {
      console.log('Installing cordova plugin from https://github.com/aullman/cordova-plugin-opentok/');
      exec('cd opentok-meet-cordova;cordova plugin add https://github.com/aullman/cordova-plugin-opentok/', function (err, stdout, stderr) {
        console.log(stdout);
        if (err) cb(err);
        else {
          prepare();
        }
      });
    } else {
      prepare();
    }
  });
});

gulp.task('serve-ios', ['cordova'], function (cb) {
  exec('cd opentok-meet-cordova;cordova serve ios');
});