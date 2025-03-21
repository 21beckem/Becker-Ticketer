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
    async generateAIDescription(agentNotes) {
        await this.sendMessageToIframe('setTextarea', 'Enter detailed notes about the ticket. Include all relevant information, such as user-reported issues, troubleshooting steps taken, error messages, and any supplementary details that could assist in resolving the issue efficiently.  🚨 Important: DO NOT include personally identifiable information (PII) such as names, phone numbers, email addresses, dates of birth (DOB), Social Security numbers (SSNs), or any sensitive data (e.g., grades, honor code issues, etc.).', agentNotes);
        await this.sendMessageToIframe('click', 'Complete with AI →');
        await this.sendMessageToIframe('waitForLoad', '');
        let desc = await this.sendMessageToIframe('getTextarea', 'The full details of a ticket that have been formatted and cleaned up from agent notes by our AI model.');
        // let title = await this.sendMessageToIframe('getInput', 'Enter ticket title');
        // let classification = await this.sendMessageToIframe('getInput', 'There is no PLACEHOLDER TO SELECT CLASSIFICATION !!! ');
        // console.log(desc);
        return desc;
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
            if (valueToSet != null) valueToSet = String(valueToSet);
            this.iframe.contentWindow.postMessage({ action, inputPlaceholder, requestId, valueToSet }, "*");
        });
    }
}