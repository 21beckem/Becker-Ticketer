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
    initializeApplication() {
        console.log("Performing application bootstrapping");
    
        // Perform Implicit Grant Authentication
        //
        // Note: Pass the query string parameters in the 'state' parameter so that they are returned
        //       to us after the implicit grant redirect.
        this.client.loginImplicitGrant(this.appParams.clientId, this.redirectUri, { state: this.integrationQueryString })
            .then((data) => {
                // User Authenticated
                console.log("User Authenticated:", data);
    
                this.connectingUpdatesCallback("Querying User...");
    
                // Make request to GET /api/v2/users/me?expand=presence
                return this.usersApi.getUsersMe({ 'expand': ["presence","authorization"] });
            })
            .then((userMe) => {
                // Me Response
                this.userMe = userMe;
    
                this.connectingUpdatesCallback("Connected Username: " + this.userMe.username);
    
                this.connectingUpdatesCallback("Querying Conversation...");
    
                console.log("Getting initial conversation details for conversation ID: " + this.appParams.gcConversationId);
                return this.conversationsApi.getConversation(this.appParams.gcConversationId);
            }).then((data) => {
                console.log("Conversation details for " + this.appParams.gcConversationId + ": " + JSON.stringify(data));
                this.connectingUpdatesCallback( JSON.stringify(data, null, 3) );
                this.conversation = data;
    
                this.myClientApp.lifecycle.bootstrapped();
    
                // this.myClientApp.alerting.showToastPopup(
                //     'Becker Ticketer',
                //     'Bootstrap Complete', {
                //         id: 'Becker-Ticketer-statusMsg',
                //         type: 'success'
                //     }
                // );
    
                this.logLifecycleEvent('Notified Genesys Cloud of Successful App Bootstrap', false);
            }).catch((err) => {
                this.connectingUpdatesCallback("Error: See Console");
                // Handle failure response
                console.log(err);
                showToast(err.message);
            });
    }
}