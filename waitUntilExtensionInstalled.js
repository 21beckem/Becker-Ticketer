function confirmBeckerTicketerIsInstalled() {
    const overlay = document.getElementById("ConnectingToExtensionOverlay");
    if (overlay) {
        overlay.remove();
        console.log("Becker Ticketer installation verified.");
    }
}
// add loader style
const style = document.createElement("style");
style.textContent = `
.overlayWrapper {
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0px 0px 7px -1px black;
    min-width: 230px;
}
.waitingForExtensionLoader {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    transform: translateY(10px) scale(1.2);
}
.waitingForExtensionLoader div {
    --c: no-repeat linear-gradient(var(--gen-orange) 0 0);
    background: 
        var(--c),var(--c),var(--c),
        var(--c),var(--c),var(--c),
        var(--c),var(--c),var(--c);
    background-size: 16px 16px;
    animation: 
        l32-1 1s infinite,
        l32-2 1s infinite;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
@keyframes l32-1 {
    0%,100% {width:45px;height: 45px}
    35%,65% {width:65px;height: 65px}
}
@keyframes l32-2 {
    0%,40%  {background-position: 0 0,0 50%, 0 100%,50% 100%,100% 100%,100% 50%,100% 0,50% 0,  50% 50% }
    60%,100%{background-position: 0 50%, 0 100%,50% 100%,100% 100%,100% 50%,100% 0,50% 0,0 0,  50% 50% }
}
`;
document.head.appendChild(style);

// create overlay
const overlay = document.createElement("div");
overlay.id = "ConnectingToExtensionOverlay";
overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;";
overlay.innerHTML = `
<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
    <div class="overlayWrapper">
        <br>
        <div class="waitingForExtensionLoader"><div></div></div>
        <br>
        <h3>Connecting to the<br>Becker Ticketer Extension</h3>
        <br>
        <a href="https://21beckem.github.io/Becker-Ticketer/install.html" target="_blank" style="font-size: 12px; padding: 10px; border: 1px solid var(--gen-orange); background-color: rgba(255,255,255,0.85); color: var(--gen-orange); cursor: pointer;">I Do Not Have the Extension Installed</a>
        <br><br>
    </div>
</div>`;
// add to page
document.body.appendChild(overlay);


// if extension already injected, remove overlay
try {
    if (BECKERTICKETEREXTENSIONISINSTALLED) {
        confirmBeckerTicketerIsInstalled();
    }
} catch (e) {}