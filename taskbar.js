(function () {
    const style = document.createElement('style');
    style.textContent = `
#taskbar {
    position: fixed;
    right: -120px;
    top: 50%;
    transform: translateY(-50%);
    transition: right 0.3s ease;
    background: rgba(200, 200, 200, .3);
    backdrop-filter: blur(2px);
    border-radius: 10px 0 0 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 15px;
    width: 40px;
    z-index: 1000;
}
#taskbar div {
    width: 40px;
    height: 40px;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
    box-shadow: 0 0 7px -4px black;
    border-radius: 20px;
    transition: width 0.03s ease, height 0.03s ease;
    position: relative;
}
#taskbar div tip {
    background-color: white;
    padding: 5px 10px;
    top: 50%;
    position: absolute;
    transform: translate(calc(-100% - 10px), -50%);
    font-size: 14px;
    box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 3px;
    white-space: nowrap;
}
#taskbar div[tooltip-visible] tip {
    opacity: 1;
}
    `;
    document.head.appendChild(style);
    
    const taskbar = document.getElementById('taskbar');
    const icons = document.querySelectorAll('#taskbar div');
    const revealThreshold = 30;  // pixels from right edge to trigger taskbar reveal
    let inRange = false;

    // Event listener for mouse movement across the document
    window.addEventListener('mousemove', (event) => {
        const { clientX, clientY } = event;
        const windowWidth = window.innerWidth;

        // Show taskbar if mouse is near the right edge or currently over the taskbar
        if (clientX > windowWidth - revealThreshold || taskbar.contains(event.target)) {
            taskbar.style.right = '0px';
        } else {
            taskbar.style.right = '-120px';
        }

        // Iterate over each icon to apply a scaling effect based on the cursor distance
        icons.forEach(icon => {
            const rect = icon.getBoundingClientRect();
            const iconCenterX = rect.left + rect.width / 2;
            const iconCenterY = rect.top + rect.height / 2;
            const distance = Math.hypot(clientX - iconCenterX, clientY - iconCenterY);

            // Define the scaling range and the effective "influence" radius of the mouse
            const minScale = 1;
            const maxScale = 1.7;
            const influenceRadius = 100;  // radius in pixels for scaling effect

            let scale = minScale;
            if (distance < influenceRadius) {
                scale = minScale + (maxScale - minScale) * (1 - distance / influenceRadius);
            }
            // icon.style.transform = `scale(${scale})`;
            icon.style.width = `${scale * 40}px`;
            icon.style.height = `${scale * 40}px`;
        });
    });

    // make tooltop objects
    icons.forEach(icon => {
        const tip = document.createElement('tip');
        tip.textContent = icon.getAttribute('tooltip');
        icon.insertBefore(tip, icon.firstChild);
    });

    // Tooltip timers
    const hoverTimeMap = new Map();
    icons.forEach(icon => {
        let tooltipTimeout;

        icon.addEventListener('mouseenter', () => {
            tooltipTimeout = setTimeout(() => {
                icon.setAttribute('tooltip-visible', 'true');
            }, 750);  // 1 second delay to show tooltip
            hoverTimeMap.set(icon, tooltipTimeout);
        });

        icon.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeMap.get(icon));
            icon.removeAttribute('tooltip-visible');
            hoverTimeMap.delete(icon);
        });
    });

})();