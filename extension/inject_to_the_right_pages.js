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
    if (urlMatches("apps.usw2.pure.cloud/directory")) {
        loadJsFile( chrome.runtime.getURL('injected/genesys.js') );
    }
    else if (urlMatches("us1.teamdynamix.com")) {
        loadJsFile( chrome.runtime.getURL('injected/ai_form.js') );
    }
    else if (urlMatches(["github.io/Becker-Ticketer", "127.0.0.1:5500", "localhost:5500"])) {
        loadJsFile( chrome.runtime.getURL('injected/confirm_extension.js') );
    }
});