class BackMeUp {
    static init(genConnected) {
        BackMeUp.actuallyInit(genConnected);
        window.addEventListener("DOMContentLoaded", () => {
            setTimeout(BackMeUp.setupInputListeners, 1000);
        });
    }
    static actuallyInit(genConnected) {
        BackMeUp.ticketId = 'NON_INTERACTION_' + Math.random().toString(36).substring(2, 15) + (new Date()).getTime().toString(36);

        if (String( localStorage.getItem('open_this_becker_ticket_now') ) != 'null') { // this is a popup window and I need to open a specific ticket
            console.log('opening ticket from local storage');
            BackMeUp.ticketId = localStorage.getItem('open_this_becker_ticket_now');
            localStorage.removeItem('open_this_becker_ticket_now');
        } else {
            if (genConnected) {
                if (GenesysAuth.appParams.gcConversationId != '') {
                    console.log('opening ticket from Genesys');
                    BackMeUp.ticketId = GenesysAuth.appParams.gcConversationId;
                }
            }
        }
        if (!genConnected) {
            JSAlert.alert('Oh no! looks like Becker-Ticketer failed to connect to Genesys! Certain features may not work.', 'Genesys Not Connected', JSAlert.Icons.Warning);
        }
        console.log("BackMeUp Ticket ID: " + BackMeUp.ticketId);

        BackMeUp.setupInputListeners();
    }
    static restoreLocalTicket() {
        let localTicket = localStorage.getItem('Becker_Ticker_'+BackMeUp.ticketId);
        if (localTicket) {
            BackMeUp.includedVars = JSON.parse(localTicket).includedVars;
            Array.from(document.querySelectorAll('input[type=text]')).forEach((el, idx) => {
                el.value = JSON.parse(localTicket).textInputs[idx];
                el.dispatchEvent(new Event('input'));
            });
            Array.from(document.querySelectorAll('input[type=radio]')).forEach((el, idx) => {
                el.checked = JSON.parse(localTicket).radioInputs[idx];
                el.dispatchEvent(new Event('input'));
            });
            Array.from(document.querySelectorAll('textarea')).forEach((el, idx) => {
                el.value = JSON.parse(localTicket).texareaInputs[idx];
                el.dispatchEvent(new Event('input'));
            });
            return true;
        }
        return false;
    }
    static saveTicketLocally() {
        let newJson = {
            includedVars : BackMeUp.includedVars,
            timestamp: new Date().getTime(),
            textInputs: [],
            radioInputs: [],
            texareaInputs: []
        };
        Array.from(document.querySelectorAll('input[type=text]')).forEach(el => {
            newJson.textInputs.push(el.value);
        });
        Array.from(document.querySelectorAll('input[type=radio]')).forEach(el => {
            newJson.radioInputs.push(el.checked);
        });
        Array.from(document.querySelectorAll('textarea')).forEach(el => {
            newJson.texareaInputs.push(el.value);
        });
        localStorage.setItem('Becker_Ticker_'+BackMeUp.ticketId, JSON.stringify(newJson));
    }
    static setupInputListeners() {
        Array.from(document.querySelectorAll('input[type=radio], input[type=text], textarea')).forEach(el => {
            el.addEventListener('input', () => {
                if (el.value.length > 0) {
                    BackMeUp.saveTicketLocally();
                }
            });
        });
    }
    static includedVars = {};
    static includeVar(varName, varValue) {
        BackMeUp.includedVars[varName] = varValue;
        BackMeUp.saveTicketLocally();
    }
    static ticketId = null;
}


if (GenesysAuth.genesysConnected == null) { // still connecting...
    GenesysAuth.connectedCallback = BackMeUp.init;
} else if (GenesysAuth.genesysConnected == true) {
    BackMeUp.init(true);
} else {
    BackMeUp.init(false);
}