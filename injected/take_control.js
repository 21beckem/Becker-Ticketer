window.opener.postMessage({type: 'window_loaded'}, '*');
window.addEventListener('message', async function(event) {
    if (event.data.hasOwnProperty('type')) {
        if (event.data.type === 'take_control') {
            let res = await eval(event.data.code);
            event.source.postMessage({type: 'control_taken', result: res }, event.origin);
        }
    }
    console.log('Received message:', event.data);
});