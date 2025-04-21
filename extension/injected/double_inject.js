const script = document.createElement("script");
script.type = "text/javascript";
script.id = "injectorScriptForGenesysModder";
script.src = document.currentScript.getAttribute("to-set-src");
document.body.appendChild(script);