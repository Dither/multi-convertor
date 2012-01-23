// Opera specific
function selText(w) { var t; return w ? w.document.getSelection() || (t = w.opera.lastClick && w.opera.lastClick.textArea) && t.value.substring(t.selectionStart, t.selectionEnd) : '' };

var background;
opera.extension.onmessage = function( event ){
	if(event.data == 'send_bg_port' ){
		background = event.source; // in case of need to send anything to background
		var channel = new MessageChannel();
		event.ports[0].postMessage('send_tab_port', [channel.port2] );
		//opera.postError('[MultiConvertor]: injected script sent it\'s port.');
		channel.port1.onmessage = onPopupMessageHandler;
	}
}

function onPopupMessageHandler(event){
    //opera.postError('[MultiConvertor]: injected script onPopupMessageHandler received '+event.data.type);
    switch (event.data.type) {
    case 'get-selection':
        var seltext = selText(window);
        if (seltext) event.source.postMessage({type:'give-selection', text: seltext});
        break;
    case 'get-url':
        if(window.location.href) event.source.postMessage({type:'give-url', text: window.location.href});
        break;
    default:
    }
}