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
        out.responsible = this.sendMessageToIframe('getAroundTheForm', '8bdaa5bc-3005-4b26-95d0-8b363eb38026', { "Agent Notes" : agentNotes });  // generate responsible group
        out.isIncident = this.sendMessageToIframe('getAroundTheForm', '9647b88b-211a-499d-b907-2d5ae650cc7f', { "Agent Notes" : agentNotes });  // generate isIncident

        for (const key in out) {
            out[key] = await out[key]; // wait for all promises
            if (out[key].statusCode !== 200) console.error('Error retreiving response:', out[key]);
        }

        out.title = out.title.data.data;
        out.desc = out.desc.data.data;
        out.responsible = ResponsibleGroups.filter(item => item.value == parseInt(out.responsible.data.data))[0];
        out.isIncident = parseInt(out.isIncident.data.data) == 32 ? true : false;
        return out;
    }
    async submitTicket() {
        if (!confirm('Are you sure you want to submit?')) return;

        let res = await this.sendMessageToIframe('getAroundTheForm', 'a5ad1f60-b8e9-4d02-92bb-644f9149965b', {
            "Title": "Test Call for System Evaluation",
            "Classification": "46",
            "Classification_Text": "Service Request",
            "Responsibility": "386",
            "Responsibility_Text": "IT Service Desk (Tier 1)",
            "Status": "52",
            "Status_Text": "Resolved",
            "UID": "9e94d934-cbe6-ea11-9111-005056ac5ec6",
            "KB": "DUO",
            "KBS": "14008",
            "KBS_Text": "Adding a Passkey to Duo",
            "Agent Notes": "Vinni called and this is a test so we can test out what is going on ",
            "Ticketsure?": true,
            "Manual Description": "A user named Vinni initiated a call for testing purposes. No specific technical issue or request was reported during the interaction. This appears to be a routine test call to evaluate system functionality or communication processes. No further action is required unless additional context or issues are provided in future interactions.",
            "Identity-UserId": "u650323084@byui.edu",
            "_Result": "AI Auto-Complete"
        });
        return res;
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

const ResponsibleGroups = [{"value":416,"text":"(Admissions) Processors"},{"value":78,"text":"(Advertising and Marketing)"},{"value":165,"text":"(BSC) Accounting Services - Admin"},{"value":401,"text":"(BSC) College of Physical Science and Engineering"},{"value":100,"text":"(BSC) Executive Group"},{"value":153,"text":"(BSC) Health Center"},{"value":152,"text":"(BSC) Online Instruction"},{"value":150,"text":"(BSC) University Relations"},{"value":527,"text":"(BSC) University Relations - Public Tours"},{"value":149,"text":"(BSC) University Store"},{"value":362,"text":"(SRR) Communications"},{"value":356,"text":"(SRR) Curriculum"},{"value":555,"text":"(SRR) Data Visualization"},{"value":357,"text":"(SRR) Degree Audit"},{"value":528,"text":"(SRR) Degree Verification"},{"value":361,"text":"(SRR) Exception Counseling"},{"value":360,"text":"(SRR) Front Desk Services"},{"value":366,"text":"(SRR) Full-Time"},{"value":399,"text":"(SRR) KB Access"},{"value":534,"text":"(SRR) Limited Access"},{"value":545,"text":"(SRR) Operations"},{"value":546,"text":"(SRR) Petitions"},{"value":358,"text":"(SRR) Registration"},{"value":101,"text":"(SRR) Student Records & Registration"},{"value":364,"text":"(SRR) Transcripts"},{"value":359,"text":"(SRR) Transfer Evaluation"},{"value":151,"text":"Academic Advising"},{"value":40,"text":"Academic Coordinator All"},{"value":39,"text":"Academic Coordinator Supervisor"},{"value":69,"text":"Academic Portfolio - ATI Architecture Team"},{"value":70,"text":"Academic Portfolio - ATI Development Team"},{"value":68,"text":"Academic Portfolio - ATI Project Manager"},{"value":71,"text":"Academic Portfolio - ATI Test Team"},{"value":242,"text":"Accounting Services (Level 2)"},{"value":538,"text":"Adjunct Faculty Employee"},{"value":536,"text":"Administrative Employee"},{"value":595,"text":"Advising - 1st Year Advising"},{"value":542,"text":"Advising Coordinators"},{"value":605,"text":"Advising Management"},{"value":607,"text":"Advising Support Online"},{"value":446,"text":"Application Support (Tier 3)"},{"value":354,"text":"Authorizations Advising Group"},{"value":479,"text":"Azure (Tier 3)"},{"value":594,"text":"BOT TDX Dashboard Admin"},{"value":593,"text":"Bot Worker"},{"value":225,"text":"BSC Avengers (Full-timers)"},{"value":133,"text":"BSC Business Solutions (SD & DS)"},{"value":135,"text":"BSC Customer Experience"},{"value":324,"text":"BSC Solutions Leadership"},{"value":106,"text":"BSC Student Leadership"},{"value":134,"text":"BSC Training"},{"value":222,"text":"BSC Triumverate"},{"value":80,"text":"BYUI Support Center"},{"value":566,"text":"CALS Advising"},{"value":599,"text":"Career Center"},{"value":606,"text":"Career Exploration Advising"},{"value":54,"text":"CAS Performance"},{"value":564,"text":"CBC Advising"},{"value":567,"text":"CEHD Advising"},{"value":273,"text":"Cellular Team"},{"value":18,"text":"Classroom Technology (Tier 3)"},{"value":565,"text":"CLL Advising"},{"value":270,"text":"Course Council Members"},{"value":485,"text":"COVID-19 Support"},{"value":570,"text":"CPSE Advising"},{"value":569,"text":"CPVA Advising"},{"value":103,"text":"Curriculum & Online Directors"},{"value":204,"text":"Curriculum Designers"},{"value":586,"text":"Cybersecurity SOC"},{"value":140,"text":"Database (Tier 3)"},{"value":521,"text":"Dean of Students"},{"value":275,"text":"Emergency Course Support Escalation"},{"value":480,"text":"End-User Support (Tier 3)"},{"value":313,"text":"EnglishConnect"},{"value":535,"text":"Faculty Employee"},{"value":561,"text":"FERPA (Tier 1)"},{"value":549,"text":"Fitness Event Managers"},{"value":23,"text":"FTC - Faculty Technology Center"},{"value":598,"text":"Genesys Support Case"},{"value":210,"text":"GIS (Tier 3)"},{"value":584,"text":"I-Belong Feed Submissions"},{"value":341,"text":"IBM i (iSeries) Employee Managers"},{"value":540,"text":"IBM i (iSeries) Support (Tier 3)"},{"value":141,"text":"Identity Management (Tier 3)"},{"value":568,"text":"IDS Advising"},{"value":2,"text":"I-Learn Admin (Tier 3)"},{"value":508,"text":"I-learn Admin Request"},{"value":286,"text":"IM"},{"value":440,"text":"Infrastructure (Tier 3)"},{"value":420,"text":"International Services - Financial Petition Requests"},{"value":60,"text":"Ipaas KB Article Access"},{"value":526,"text":"Ipaas Users"},{"value":466,"text":"I-Plan Advising Steward"},{"value":408,"text":"I-Plan Advising Support (Tier 1)"},{"value":609,"text":"I-Plan Advising Support Manager"},{"value":483,"text":"I-Plan ATI Developers"},{"value":506,"text":"I-Plan Data Meeting"},{"value":484,"text":"I-Plan Excelsoft"},{"value":481,"text":"I-Plan Governance"},{"value":497,"text":"I-Plan IT Product Management"},{"value":451,"text":"I-Plan IT Support (Tier 3)"},{"value":482,"text":"I-Plan Module Admin"},{"value":465,"text":"IT CAB Chair"},{"value":75,"text":"IT Cyber Security (Tier 3)"},{"value":262,"text":"IT Documentation & Process"},{"value":421,"text":"IT Employee"},{"value":258,"text":"IT Governance"},{"value":34,"text":"IT Group"},{"value":455,"text":"IT Knowledge Management"},{"value":541,"text":"IT Manager Feedback"},{"value":518,"text":"IT Merge"},{"value":454,"text":"IT Operations Council"},{"value":323,"text":"IT Portfolio Managers"},{"value":419,"text":"IT Product Management"},{"value":460,"text":"IT Quality Assurance"},{"value":386,"text":"IT Service Desk (Tier 1)"},{"value":405,"text":"IT Service Desk Leadership"},{"value":379,"text":"IT Tier 2 Support"},{"value":453,"text":"IT Unified Support"},{"value":554,"text":"ITSD Ticketing Team (Tier 1)"},{"value":307,"text":"Lab / Imaging Support (Tier 3)"},{"value":424,"text":"LDSBC Support (Tier 2)"},{"value":600,"text":"Leadership IT Tier 2"},{"value":353,"text":"License Servers (Tier 3)"},{"value":603,"text":"LISA Users"},{"value":330,"text":"LTI Users"},{"value":423,"text":"Major Incident Managers"},{"value":148,"text":"Marketing Analytics and Research"},{"value":17,"text":"Messaging & Collaboration / IT Productivity Suites (Microsoft / Zoom / Google Workspace) (Tier 3)"},{"value":15,"text":"Network (Tier 3)"},{"value":108,"text":"Online Experience (Web)"},{"value":287,"text":"Online Instruction - AIM"},{"value":402,"text":"Online QA Team"},{"value":12,"text":"Online Support"},{"value":314,"text":"Online TechOps Dev"},{"value":507,"text":"Pathway Project Manager"},{"value":442,"text":"Phone (Tier 3)"},{"value":450,"text":"Platform Services (Tier 3)"},{"value":217,"text":"POA-International"},{"value":219,"text":"POA-Online"},{"value":558,"text":"Power Platform - Tier 3"},{"value":543,"text":"Presidents Council"},{"value":32,"text":"Print / Fax (Tier 3)"},{"value":563,"text":"Scorecard Simplification Team"},{"value":452,"text":"SharePoint / OneDrive (Tier 3)"},{"value":529,"text":"Software Engineering - Angular Apps"},{"value":591,"text":"Software Engineering - Architecture Review Board"},{"value":478,"text":"Software Engineering - Pathway"},{"value":438,"text":"Software Engineering (Tier 3)"},{"value":608,"text":"SRR/I-Plan Form"},{"value":520,"text":"Student"},{"value":123,"text":"Student Information System (Tier 3)"},{"value":51,"text":"Student Services"},{"value":515,"text":"Team Green"},{"value":63,"text":"University Aux Services Operations"},{"value":553,"text":"University Relation Content Submission Group"},{"value":67,"text":"University Resources Directors"},{"value":59,"text":"University Store Employee"},{"value":247,"text":"UR Content Curation"},{"value":294,"text":"UR Web"},{"value":604,"text":"USMC Council"},{"value":147,"text":"VDI / Antivirus (Tier 3)"},{"value":522,"text":"Video Request Approval"},{"value":590,"text":"Web Change Developers"},{"value":448,"text":"Webservices (Tier 3)"},{"value":449,"text":"Workday (Tier 3)"}];