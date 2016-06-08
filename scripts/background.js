// Opera specific
if (typeof window.opera !== 'undefined') {
  var menu_resized = false, debug_output = false;
  function log(){ if (debug_output) opera.postError(Array.prototype.slice.call(arguments))}
  function setupConnection() { opera.extension.onconnect = onConnectHandler; }
  function onConnectHandler(event) {
      //log('[MultiConvertor]: background script received a message '+event.data);
      if (event && event.origin && event.origin.indexOf('popup.html') > -1 && event.origin.indexOf('widget://') > -1) {
          var tab = opera.extension.tabs.getFocused();
          if (tab) {
              tab.postMessage('send_bg_port', [event.source]);
              //log('[MultiConvertor]: background script sent popup\'s port to injected script.');
          }
      }
  }
  window.addEventListener('load', function () {
    var theButton;
    var toolbarUIItemProperties = {
      title: 'MultiConvertor',
      icon: 'icons/icon16.png',
      popup: {
        href: 'popup.html',
        width: 620,
        height: 450
      }
    }
    theButton = opera.contexts.toolbar.createItem(toolbarUIItemProperties);
    opera.contexts.toolbar.addItem(theButton);
    setupConnection();
  }, false);
}
