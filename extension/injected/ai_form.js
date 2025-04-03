(function() {
    function jsonToFormData(json) {
        const formData = new FormData();
        for (const key in json) {
            if (json.hasOwnProperty(key)) {
                const value = json[key];
    
                if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
                    // Recursively append nested objects and arrays
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            }
        }
        return formData;
    }
    async function TD_Fetch(flowPId, data) {
        const token = AppFormRenderPage._data.et;
        let fromJson = {
            customerId: 10,
            flowPId: flowPId,
            flowVersion: 0,
            t: token,
            vt: '',
            data: data,
            waitForTimeout: '',
            preview: false
        }
    
        let form = jsonToFormData(fromJson);
    
        const res = await fetch('/tdapp/app/form/api/v1/event', {
            method: 'POST',
            body: form
        });
        return await res.json();
    }
    const getElementsByText = (str, tag) => {
        tag = (tag) ? tag : 'button';
        return Array.prototype.slice.call(document.getElementsByTagName(tag)).filter(el => el.textContent.trim() === str.trim());
    }
    window.addEventListener("message", async function(event) {
        const { action, inputPlaceholder, requestId, valueToSet } = event.data;
        let response = { requestId, success: true };

        // try {
        switch (action) {
            case 'getAroundTheForm':
                console.log(inputPlaceholder, valueToSet);
                response.data = await TD_Fetch(inputPlaceholder, valueToSet);
                break;
            case 'getInput':
                response.data = document.querySelector('input[placeholder="'+inputPlaceholder+'"]').value;
                break;
            case 'getTextarea':
                response.data = document.querySelector('textarea[placeholder="'+inputPlaceholder+'"]').value;
                break;
            case 'click':
                getElementsByText(inputPlaceholder, valueToSet)[0].click();
                response.data = true;
                break;
            case 'setTextarea':
                document.querySelector('textarea[placeholder="'+inputPlaceholder+'"]').value = String(valueToSet);
                response.data = true;
                break;
            case 'setInput':
                document.querySelector('input[placeholder="'+inputPlaceholder+'"]').value = String(valueToSet);
                response.data = true;
                break;
            case 'getSelectOptions':
                response.data = Array.from(document.querySelector('SELECT').querySelectorAll('OPTION')).map(x => [x.value,x.innerText]);
                break;
            case 'waitForLoad':
                while ( document.querySelector('.k-loading-mask, .loading-mask') ) {
                    await new Promise(r => requestAnimationFrame(r));
                }
                response.data = true;
                break;
            default:
                response.success = false;
                response.error = 'Unknown action';
        }
        // } catch (error) {
        //     response.success = false;
        //     response.error = error.message;
        // }

        window.parent.postMessage(response, "*");
    });

    window.parent.postMessage({ success: true, data: 'AI-Form communication script injected and running.' }, "*");
    console.log('AI-Form communication script injected and running.');
})();