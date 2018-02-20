

if (
  !window.RTCPeerConnection &&
  navigator.userAgent.indexOf('Safari') !== -1 &&
  navigator.userAgent.indexOf('Chrome') === -1
) {
  const origin = window.location.origin;

  const loadedPromise = new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }

    window.addEventListener('DOMContentLoaded', resolve);
  });

  loadedPromise
    .then(() => {
      // Using an iframe will launch meet-electron if it is installed but won't take control away
      // by going to an error page if it isn't installed.
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframe.src = `meet://home${window.location.pathname}`;
    })
    .then(() => {
      // Need this not to happen synchronously with the iframe above so that the app launch attempt
      // occurs before going to the new page.
      window.location.href = `${origin}/electron/download`;
    });
}
