async function loadJsFile(s) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "injectorScriptForGenesysModder";
    script.src = s;
    document.body.appendChild(script);
}
window.addEventListener('load', () => {
    if (window.location.href.includes("apps.usw2.pure.cloud/directory")) {
        loadJsFile( chrome.extension.getURL('injected/genesys.js') );
    }
    else if (window.location.href.includes("us1.teamdynamix.com")) {
        loadJsFile( chrome.extension.getURL('injected/ai_form.js') );
    }
});