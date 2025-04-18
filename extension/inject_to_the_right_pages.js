async function loadJsFile(s) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "injectorScriptForGenesysModder";
    script.src = s;
    document.body.appendChild(script);
}
function urlMatches(urlArr) {
    found = false;
    if (typeof urlArr === 'string') {
        return window.location.href.includes(urlArr);
    }
    urlArr.forEach(url => {
        if (window.location.href.includes(url)) {
            found = true;
        }
    });
    return found;
}
window.addEventListener('load', () => {
    // if (urlMatches("apps.usw2.pure.cloud/directory")) {
    //     loadJsFile( 'https://21beckem.github.io/Becker-Ticketer/extension/injected/genesys.js' );
    // }
    // else if (urlMatches("us1.teamdynamix.com")) {
    //     loadJsFile( 'https://21beckem.github.io/Becker-Ticketer/extension/injected/ai_form.js' );
    // }
    // else if (urlMatches(["github.io/Becker-Ticketer", "127.0.0.1:5500", "localhost:5500"])) {
    //     loadJsFile( 'https://21beckem.github.io/Becker-Ticketer/extension/injected/confirm_extension.js' );
    // }
    // else if (urlMatches("apps.usw2.pure.cloud/messaging-gadget")) {
    //     loadJsFile( 'https://21beckem.github.io/Becker-Ticketer/extension/injected/injected/chat_responses.js' );
    // }
    if (urlMatches("apps.usw2.pure.cloud/directory")) {
        loadJsFile( chrome.runtime.getURL('injected/genesys.js') );
    }
    else if (urlMatches("us1.teamdynamix.com")) {
        loadJsFile( chrome.runtime.getURL('injected/ai_form.js') );
    }
    else if (urlMatches(["github.io/Becker-Ticketer", "127.0.0.1:5500", "localhost:5500"])) {
        loadJsFile( chrome.runtime.getURL('injected/confirm_extension.js') );
    }
    else if (urlMatches("apps.usw2.pure.cloud/messaging-gadget")) {
        loadJsFile( chrome.runtime.getURL('injected/chat_responses.js') );
    }
});