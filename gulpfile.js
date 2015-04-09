var gulp = require('gulp'),
    bower = require('gulp-bower'),
    exec = require('child_process').exec;

gulp.task('default', function(){
  bower()
    .pipe(gulp.dest('public/js/lib/'));
});

gulp.task('cordova-bower', function () {
  // couldn't figure out how to get bower to run in a different directory
  exec('cd opentok-meet-cordova;bower install');
});

gulp.task('cordova', function (cb) {
  // Copy over the single-sourced JS
  gulp.src('./public/js/*.js')
    .pipe(gulp.dest('opentok-meet-cordova/www/js'));
  
  // Copy over the single-source CSS
  gulp.src('./public/css/*.css')
    .pipe(gulp.dest('opentok-meet-cordova/www/css'));
  
  // Copy over the images
  gulp.src('./public/images/*.*')
    .pipe(gulp.dest('opentok-meet-cordova/www/images'));

  var prepare = function () {
    // Add the ios platform
    exec('cd opentok-meet-cordova;cordova platform add ios', function (err) {
      // Prepare for ios
      if (!err) {
        // If there's no error then you haven't already installed the platform
        console.warn('If you want to hide the status bar you may need to add the following to' +
          ' OpenTokMeet-Info.plist');
        console.warn('<key>UIStatusBarHidden</key>\n' +
                  '<true/>\n' +
                  '<key>UIViewControllerBasedStatusBarAppearance</key>\n' +
                  '<false/>\n' +
                    '<key>CFBundleURLTypes</key>\n' +
                    '<array>\n' +
                    '<dict>\n' +
                    '<key>CFBundleTypeRole</key>\n' +
                    '<string>Viewer</string>\n' +
                    '<key>CFBundleURLIconFile</key>\n' +
                    '<string>Icon-72</string>\n' +
                    '<key>CFBundleURLName</key>\n' +
                    '<string>com.tokbox.meet</string>\n' +
                    '<key>CFBundleURLSchemes</key>\n' +
                    '<array>\n' +
                    '<string>otmeet</string>\n' +
                    '</array>\n' +
                    '</dict>\n' +
                    '</array>\n'
        );
      }
      exec('cd opentok-meet-cordova;cordova prepare ios', function (err) {
        if (err) cb(err);
        else {
          // Copy over icons
          gulp.src('./opentok-meet-cordova/src/icon/ios7/*.png')
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
  
  var cordovaPlugins = {
    'com.tokbox.cordova.opentok': 'https://github.com/songz/cordova-plugin-opentok.git',
    'com.phonegap.plugin.statusbar': 'https://github.com/phonegap-build/StatusBarPlugin.git',
    'com.verso.cordova.clipboard': 'https://github.com/VersoSolutions/CordovaClipboard',
    'org.apache.cordova.splashscreen': 'org.apache.cordova.splashscreen'
  };
  // Install the cordova plugins if they're not already there
  exec('cd opentok-meet-cordova;cordova plugin list', function (err, stdout) {
    if (err) {
      cb(err);
      return;
    }
    var plugins = Object.keys(cordovaPlugins);
    var getNextPlugin = function() {
      var key = plugins.pop();
      if (!key) {
        prepare();
        return;
      }
      if (stdout.indexOf(key) < 0) {
        console.log('Installing cordova plugin from: ' + cordovaPlugins[key]);
        exec('cd opentok-meet-cordova;cordova plugin add ' + cordovaPlugins[key],
            function (err, stdout) {
          console.log(stdout);
          if (err) cb(err);
          else {
            getNextPlugin();
          }
        });
      } else {
        getNextPlugin();
      }
    };
    getNextPlugin();
  });
});

gulp.task('serve-ios', ['cordova'], function () {
  exec('cd opentok-meet-cordova;cordova serve ios');
});