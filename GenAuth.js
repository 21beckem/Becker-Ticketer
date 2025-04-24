class GenAuth {
    constructor(connectingUpdatesCallback=(val) =>{console.log(val)}) {
        this.genesysConnected = null;
        this.connectingUpdatesCallback = connectingUpdatesCallback;
        this.redirectUri = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        console.log("***** RedirectURI *****: " + this.redirectUri);
        
        this.integrationQueryString = "";
        if ( window.location.search.includes('gcConversationId=') ) {
            this.connectingUpdatesCallback("Authenticating...");
            this.integrationQueryString = window.location.search.substring(1);
        } else if ( window.location.hash.includes('access_token=') ) {
            this.connectingUpdatesCallback("Authenticated!");
            this.integrationQueryString = window.location.hash.substring(1);
        } else {
            console.log("Integration Query String is empty.");
            this.genesysConnected = false;
            this.connectedCallback(this.genesysConnected);
            return;
        }
        try {
            this.appParams = this.parseAppParameters(this.integrationQueryString)
        } catch (e) {
            console.log("Unable to decode the integration query string.");
            this.genesysConnected = false;
            this.connectedCallback(this.genesysConnected);
            return;
        }
        
        // Create and initialize an instance of Client App SDK
        this.myClientApp = new window.purecloud.apps.ClientApp({
            gcHostOrigin: this.appParams.gcHostOrigin,
            gcTargetEnv: this.appParams.gcTargetEnv
        });
        
        // Log the Genesys Cloud environment (i.e. AWS Region) and Client Apps SDK version
        console.log("Genesys Cloud Client App SDK Environment: " + this.myClientApp.gcEnvironment);
        console.log("Genesys Cloud Client App SDK Version: " + this.myClientApp.version);
        
        // Create Genesys Cloud Platform SDK instance
        let platformClient = require('platformClient');
        this.client = platformClient.ApiClient.instance;
        
        // Point the Platform SDK to make SDK requests to the proper region for the org
        console.log("Initializing platform client for region returned by Client App SDK: " + this.myClientApp.gcEnvironment);
        this.client.setEnvironment(this.myClientApp.gcEnvironment);
        
        // Set to store OAuth access token in local storage to prevent user from being
        // prompted for user credentials multiple times during use of the widget.
        this.client.setPersistSettings(true, 'BeckerTicketerInteractionWidget');
        
        // Specific Platform SDK items utilized by this application
        this.usersApi = new platformClient.UsersApi();
        this.notificationsApi = new platformClient.NotificationsApi();
        this.conversationsApi = new platformClient.ConversationsApi();
        this.extContactsApi = new platformClient.ExternalContactsApi();
        
        this.userMe = null;
        this.conversation = null;
        
        try {
            this.initializeApplication();
        } catch (e) {
            console.log(e);
            this.genesysConnected = false;
            this.connectedCallback(this.genesysConnected);
            return;
        }
        setTimeout(() => {
            try {
                BackMeUp.includeVar('gcConversationId', this.appParams.gcConversationId);
            } catch (e) {}
        },2000)

        this.determineInteractionType();
        
        //
        // Lifecycle Events
        //
        this.boundFocusEvent = this.onAppFocus.bind(this);
        this.boundBlurEvent = this.onAppBlur.bind(this);
        this.myClientApp.lifecycle.addBootstrapListener(() => {
            this.logLifecycleEvent('App Lifecycle Event: bootstrap', true);
            this.initializeApplication();
        });
        this.myClientApp.lifecycle.addStopListener(() => {
            this.genesysConnected = false;
            try {
                let completed = BackMeUp.stopSaving || !BackMeUp.haveSavedYet;
                top.postMessage({type: 'interaction_lifecycle_stop', ticketCompleted: completed}, '*');
            } catch (e) {}
            try { BackMeUp.saveTicketLocally(); } catch (e) {}
            this.logLifecycleEvent('App Lifecycle Event: stop', true);
        
            // Clean up other, persistent listeners
            this.myClientApp.lifecycle.removeFocusListener(this.boundFocusEvent);
            this.myClientApp.lifecycle.removeBlurListener(this.boundBlurEvent);
        
            this.myClientApp.lifecycle.stopped();
        
            this.myClientApp.alerting.showToastPopup(
                'Becker Ticketer',
                'App Stopped', {
                    id: 'Becker-Ticketer-statusMsg',
                    type: 'error',
                    showCloseButton: true
                }
            );
        
            this.logLifecycleEvent('Notified Genesys Cloud of Successful App Stop', false);
        });
        this.myClientApp.lifecycle.addFocusListener(this.boundFocusEvent);
        this.myClientApp.lifecycle.addBlurListener(this.boundBlurEvent);
        
        this.genesysConnected = true;
        this.connectedCallback(this.genesysConnected);
    }
    connectedCallback(val) { console.log('Genesys Connected: ' + val); }
    logLifecycleEvent(logText, incommingEvent) { console.log(logText) }
    showToast(message) { this.myClientApp.alerting.showToastPopup( 'Becker Ticketer', message, { id: 'Becker-Ticketer-statusMsg' } ); }
    onAppFocus() {
        this.logLifecycleEvent('App Lifecycle Event: focus', true);
        // this.showToast('App Focused');
    }
    onAppBlur () {
        this.logLifecycleEvent('App Lifecycle Event: blur', true);
        // this.showToast('App Blurred');
    }
    parseAppParameters(queryString) {
        console.log("Interaction Widget Proxy Query String: " + queryString);
    
        let appParams = {
            gcHostOrigin: null,
            gcTargetEnv: null,
            gcLangTag: null,
            gcConversationId: null,
            clientId: null
        };
    
        if ( queryString.length != 0 ) {
            const pairs = queryString.split('&');
    
            for (var i = 0; i < pairs.length; i++)
            {
                var currParam = pairs[i].split('=');
    
                if (currParam[0] === 'gcLangTag') {
                    appParams.gcLangTag = decodeURIComponent(currParam[1]);
                    console.log("Query Parameter gcLangTag = " + appParams.gcLangTag);
                } else if (currParam[0] === 'gcHostOrigin') {
                    appParams.gcHostOrigin = decodeURIComponent(currParam[1]);
                    console.log("Query Parameter gcHostOrigin = " + appParams.gcHostOrigin);
                } else if (currParam[0] === 'gcTargetEnv') {
                    appParams.gcTargetEnv = decodeURIComponent(currParam[1]);
                    console.log("Query Parameter gcTargetEnv = " + appParams.gcTargetEnv);
                } else if (currParam[0] === 'gcConversationId') {
                    appParams.gcConversationId = decodeURIComponent(currParam[1]);
                    console.log("Query Parameter gcConversationId = " + appParams.gcConversationId);
                } else if (currParam[0] === 'ClientId') {
                    appParams.clientId = decodeURIComponent(currParam[1]);
                    console.log("Query Parameter ClientId = " + appParams.clientId);
                } else if (currParam[0] === 'ticketId') {
                    appParams.ticketId = decodeURIComponent(currParam[1]);
                    console.log("Query Parameter ticketId = " + appParams.ticketId);
                } else if (currParam[0] === 'state') {
                    console.log("Found 'state' query parameter from implicit grant redirect");
                    var stateValue = currParam[1];
                    console.log("state = " + stateValue);
                    var stateValueDecoded = decodeURIComponent(stateValue);
                    console.log("decoded state = " + stateValueDecoded);
                    appParams = this.parseAppParameters(decodeURIComponent(stateValueDecoded));
                }
            }
        }
        return appParams;
    };
    async initializeApplication() {
        console.log("Performing application bootstrapping");

        // Perform Implicit Grant Authentication
        const data = await this.client.loginImplicitGrant(this.appParams.clientId, this.redirectUri, { state: this.integrationQueryString });

        // User Authenticated
        console.log("User Authenticated:", data);

        this.connectingUpdatesCallback("Querying User...");

        // Make request to GET /api/v2/users/me?expand=presence
        this.userMe = await this.usersApi.getUsersMe({ 'expand': ["presence", "authorization"] });

        // Me Response
        this.connectingUpdatesCallback("Connected Username: " + this.userMe.username);

        this.connectingUpdatesCallback("Querying Conversation...");

        console.log("Getting initial conversation details for conversation ID: " + this.appParams.gcConversationId);
        this.conversation = await this.conversationsApi.getConversation(this.appParams.gcConversationId);

        console.log("Conversation details for " + this.appParams.gcConversationId + ": " + JSON.stringify(this.conversation));
        this.connectingUpdatesCallback(JSON.stringify(this.conversation, null, 3));

        this.myClientApp.lifecycle.bootstrapped();

        this.interactionType = await this.determineInteractionType();

        this.logLifecycleEvent('Notified Genesys Cloud of Successful App Bootstrap', false);
    }


    // functions that other things can call, not just for internal use inside this library

    async determineInteractionType() {
        let details = await this.conversationsApi.getAnalyticsConversationDetails(this.conversation.id);
        if (details && details.participants && details.participants.length > 0 && details.participants[0].sessions && details.participants[0].sessions.length > 0 && details.participants[0].sessions[0].mediaType) {
            return details.participants[0].sessions[0].mediaType.toLowerCase();
        }
        return 'unknown';
    }

    async createNewContactFromNumber(firstName, lastName, number) {
        return await this.extContactsApi.postExternalcontactsContacts({
            'firstName': firstName,
            'lastName': lastName,
            'cellPhone': {
                'display': toString(number)
              },
              "homePhone": {
                'display': toString(number)
              }
        });
    }

    async getConversationTranscript(toString=true) {
        let conversationId = this.conversation.id;
        let participants = ( await this.conversationsApi.getConversationsMessage(conversationId) ).participants;
        let waits = [];
        // loop through participants and request messages
        participants.forEach(part => {
            part.messages.forEach(msg => {
                if (!msg.messageId) return;
                waits.push([
                        part.purpose,
                        this.conversationsApi.getConversationsMessageMessage(conversationId, msg.messageId, { 
                            "useNormalizedMessage": true // Boolean | If true, response removes deprecated fields (textBody, media, stickers)
                        })
                    ]);
            });
        });
        // wait for all messages to return
        for (let i = 0; i < waits.length; i++) {
            waits[i][1] = (await waits[i][1]);
            if (!waits[i][1].normalizedMessage.text) continue;
            waits[i][1] = {
                timestamp: waits[i][1].normalizedMessage.channel.time,
                userId: waits[i][1].normalizedMessage.channel.from,
                text: waits[i][1].normalizedMessage.text
            };
        }
        // sort by timestamp
        waits = waits.sort((a, b) => {
            return new Date(a[1].timestamp).getTime() - new Date(b[1].timestamp).getTime();
        });
        if (toString) {
            // convert to string
            waits = waits.map((msg) => {
                return `[${msg[0]}]: ${msg[1].text}`;
            }).join("\n");
        }
        // return
        return waits;
    }
}