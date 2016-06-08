if (typeof browser === 'undefined' && typeof chrome !== 'undefined') browser = chrome;

function doParse() {
    if (document.getElementById('inputtext').value === '') return;
    document.getElementById('encode').disabled = true;

    var text = document.getElementById('inputtext').value;
    var method = document.getElementById('encmethod').value;
    var direction = document.getElementById('encdirection').value;

    //log('['+text + ' '+ method + ' '+ direction);
    if (METHODS[method]) {
        if (METHODS[method].init) METHODS[method].init();
        switch (direction) {
            case 'encode':
                if (METHODS[method].encode) text = METHODS[method].encode(text);
                break;
            case 'decode':
                if (METHODS[method].decode) text = METHODS[method].decode(text);
                break;
            case 'guess':
                if (METHODS[method].guess) text = METHODS[method].guess(text);
                break;
        }
    }

    if (text) document.getElementById('inputtext').value = text;
    document.getElementById('inputtext').focus();
    setTimeout(function() {
        document.getElementById('encode').disabled = false;
    }, 100);
}

function getHelp() {
    try {
        if (!METHODS[document.getElementById('encmethod').value]) return;
        alert('Help: \n' + METHODS[document.getElementById('encmethod').value].help);
    } catch (e) {}
}

function onMessageHandler(response) {
    //log('[the popup.html onMessageHandler received: ' + event.data.type);
    document.getElementById('inputtext').value = response.data.text;
    document.getElementById('inputtext').focus();
}

function log() {
    console.log('[MultiConvertor]: ' + Array.prototype.slice.call(arguments));
}

var theport, sendMessage = function(){}, onPageConnected = function(){};

// Opera specific
if (typeof window.opera !== 'undefined') {
    sendMessage = function (message) {
        if (theport && message) theport.postMessage(message);
        //log('[the popup.html sendMessage sent ' + message.type);
    };

    onPageConnected = function(){
        if (opera.extension) opera.extension.onmessage = function(event) {
            if (event.data == "send_tab_port") {
                if (event.ports.length > 0) {
                    theport = event.ports[0];
                    theport.onmessage = onMessageHandler;
                    //log('[the popup.html received port ' + theport);
                }
            }
        };
    };
}

if (typeof window.browser !== 'undefined') {
    sendMessage = function(message) {
       browser.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            if (!tabs[0]) return;
            theport = browser.tabs.connect(tabs[0].id);
            theport.onMessage.removeListener(onMessageHandler);
            theport.onMessage.addListener(onMessageHandler);
            if (message) theport.postMessage({data: message});
        });
        //log('[ the popup.html sendMessage sent ' + message.type);
    };
}

document.addEventListener("DOMContentLoaded", function() {
    onPageConnected();
    document.getElementsByTagName('html')[0].setAttribute('lang', window.navigator.language.slice(0, 2));

    document.getElementById('getsel').addEventListener('click', function() {
        sendMessage({type:'get-selection'});
    }, false);

    document.getElementById('geturl').addEventListener('click', function() {
        sendMessage({type:'get-url'});
    }, false);

    document.getElementById('gethelp').addEventListener('click', function() {
        getHelp();
    }, false);

    var selector = document.getElementById('encmethod');
    if (selector) {
        for (var method in METHODS) {
            if (!METHODS[method].name) continue;
            var opt = document.createElement('option');
            opt.innerHTML = METHODS[method].name;
            opt.value = method.toString();
            selector.appendChild(opt);
        }

        document.getElementById('encmethod').addEventListener('change', function() {
            document.getElementById('encdirection').disabled = false;
            var method = this.value;
            if (!(METHODS[method].encode && METHODS[method].decode)) {
                document.getElementById('encdirection').value = 'encode';
                document.getElementById('encdirection').disabled = true;
            } else {
                document.getElementById('encdirection').value = 'guess';
            }
        }, false);

        document.getElementById('encode').addEventListener('click', function(e) {
            doParse();
            e.preventDefault();
        }, false);

    }
    document.getElementById('inputtext').focus();
}, false);
