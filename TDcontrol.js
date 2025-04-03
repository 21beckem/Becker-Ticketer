class TDcontroler {
    constructor(iframe) {
        this.iframe = iframe;
        this.iframeReady = false;

        this.readyMessageHandlerForEventListener = this.handleReadyMessage.bind(this);
        window.addEventListener("message", this.readyMessageHandlerForEventListener);
    }
    handleReadyMessage(event) {
        if (event.data.data != 'AI-Form communication script injected and running.') return;
        this.iframeReady = true;
        window.removeEventListener("message", this.readyMessageHandlerForEventListener);
    }
    async searchKBs(query) {
        let res = await this.sendMessageToIframe('getAroundTheForm', '4e9be2b5-069e-4d1e-95e2-66775e1e2c77', { "KB" : query });  // seark KBs
        if (res.statusCode !== 200) console.error('Error retreiving response:', res);
        return res.data.data;
    }
    async generateAIDescription(agentNotes) {
        let out = {};
        out.title = this.sendMessageToIframe('getAroundTheForm', '803fbcee-7f8d-44e4-b6b2-84dce27f827c', { "Agent Notes" : agentNotes });  // generate title
        out.desc = this.sendMessageToIframe('getAroundTheForm', '66bf43d5-1d71-4bbd-8f68-af1daeb035b7', { "Agent Notes" : agentNotes });  // generate desc

        for (const key in out) {
            out[key] = await out[key]; // wait for all promises
            if (out[key].statusCode !== 200) console.error('Error retreiving response:', out[key]);
        }

        out.title = out.title.data.data;
        out.desc = out.desc.data.data;
        return out;
    }
    async searchPersonAsType(query, searchType) {
        let flowIds = {
            'I#' : '5fdd0866-6309-4e35-b405-32a03f36d1fb',
            'EMAIL' : '5fdd0866-6309-4e35-b405-32a03f36d1fb',
            'NAME' : '3f23149d-2199-4c3a-b940-7a2ea50952c8'
        }
        let res = await this.sendMessageToIframe('getAroundTheForm', flowIds[searchType.toUpperCase()], { "searchInput" : query });
        console.log(res);
        if (searchType.toUpperCase() == 'NAME') {
            res = JSON.parse(res.data.data);
        } else {
            res = {
                "name": res.data.data['requestorName'],
                "inumber": '',
                "uid": res.data.data['tdxUID'],
                "email": res.data.data['requestorEmail'],
                "type": res.data.data['requestorDepartment'],
                "company": (res.data.data['requestorEmail'].toLowerCase().includes('@byui.edu')) ? 'BYUI' : 'OTHER',
                "username": ''
            }
        }
        return res;
    }

    async sendMessageToIframe(action, inputPlaceholder, valueToSet=null) {
        while (!this.iframeReady) {
            await new Promise(r => setTimeout(r, 100));
        }
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substr(2, 9);
    
            let handleMessage = (event) => {
                if (!event.data || event.data.requestId !== requestId) return;
    
                window.removeEventListener("message", handleMessage);
                event.data.success ? resolve(event.data.data) : reject(event.data.error);
            }
    
            window.addEventListener("message", handleMessage);
            this.iframe.contentWindow.postMessage({ action, inputPlaceholder, requestId, valueToSet }, "*");
        });
    }
}