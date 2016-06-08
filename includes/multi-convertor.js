(function() {

var browser_type,
    BROWSER_CHROME = 1,
    BROWSER_SAFARI = 2,
    BROWSER_OPERA = 3;

if (typeof browser === 'undefined' && typeof chrome !== 'undefined') browser = chrome;
if ((!!window.browser && !!window.browser.runtime) || (typeof InstallTrigger !== 'undefined')) browser_type = BROWSER_CHROME
else if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) browser_type = BROWSER_SAFARI;
else browser_type = BROWSER_OPERA;

var selText = function() {},
    sendMessage = function() {};

var onPopupMessageHandler = function(ev) {
    //opera.postError('[MultiConvertor]: injected script onPopupMessageHandler received '+event.data.type);
    switch (ev.data.type) {
        case 'get-selection':
            var seltext = selText(window);
            if (seltext)
                sendMessage({type: 'give-selection', text: seltext.toString() }, ev.source);
        break;
        case 'get-url':
            if (window.location.href)
                sendMessage({type: 'give-url', text: window.location.href}, ev.source);
        break;
        default:
    }
}

if (browser_type === BROWSER_OPERA) {
    // Opera specific
    sendMessage = function(message, where) {
        where.postMessage(message);
    }
    selText = function (w) {
        var t;
        return w ? w.document.getSelection() || (t = w.opera.lastClick && w.opera.lastClick.textArea) && t.value.substring(t.selectionStart, t.selectionEnd) : '' };
    var background;
    opera.extension.onmessage = function(event) {
        if (event.data == 'send_bg_port') {
            background = event.source; // in case of need to send anything to background
            var channel = new MessageChannel();
            event.ports[0].postMessage('send_tab_port', [channel.port2]);
            //opera.postError('[MultiConvertor]: injected script sent it\'s port.');

            channel.port1.onmessage = onPopupMessageHandler;
        }
    }
} else if (browser_type === BROWSER_CHROME) {
    selText = function(w) {
        var userSelection;
        if (window.getSelection) {
            // W3C Ranges
            userSelection = window.getSelection();
            // Get the range:
            /*if (userSelection.getRangeAt)
                var range = userSelection.getRangeAt(0);
            else {
                var range = document.createRange();
                range.setStart(userSelection.anchorNode, userSelection.anchorOffset);
                range.setEnd(userSelection.focusNode, userSelection.focusOffset);
            }

            // And the HTML:
            var clonedSelection = range.cloneContents();
            var div = document.createElement('div');
            div.appendChild(clonedSelection);
            return div.innerHTML;*/
            return userSelection;
        } else {
            return '';
        }

    };
    browser.runtime.onConnect.addListener(function(port) {
        sendMessage = function(message) {
            port.postMessage({data: message});
        }
        port.onMessage.addListener(onPopupMessageHandler);
    });
}

})();
