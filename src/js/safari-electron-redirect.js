'use strict';

if (
  navigator.userAgent.indexOf('Safari') !== -1 &&
  navigator.userAgent.indexOf('Chrome') === -1
) {
  var origin = location.origin;

  var loadedPromise = new Promise(function(resolve) {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }

    window.addEventListener('DOMContentLoaded', resolve);
  });

  loadedPromise
    .then(function() {
      // Using an iframe will launch meet-electron if it is installed but won't take control away
      // by going to an error page if it isn't installed.
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = 'meet://home' + location.pathname;
    })
    .then(function() {
      // Need this not to happen synchronously with the iframe above so that the app launch attempt
      // occurs before going to the new page.
      location.href = origin + '/electron/download';
    });
}
