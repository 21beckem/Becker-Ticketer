HTMLCollection.prototype.forEach = Array.from(this).forEach;
let AccordianSections = document.getElementsByClassName("accordion");
const _ = (el) => document.getElementById(el);
const TDcontrol = new TDcontroler(_("TDFormFrame"));
// turn off autocomplete for ALL inputs
document.querySelectorAll('input').forEach(el => el.autocomplete = 'off');
AccordianSections.forEach((el) => {
    if (el.classList.contains("active")) {
        el.nextElementSibling.style.height = (window.innerHeight - 165) + "px";
    }
    el.open = (yesOrNo) => {
        if (yesOrNo) {
            el.classList.add("active");
            el.nextElementSibling.style.height = (window.innerHeight - 165) + "px";
        } else {
            el.classList.remove("active");
            el.nextElementSibling.style.height = null;
        }
    };
    el.setActive = () => {
        // first check if they can open this section yet
        if (canIopenThisAccordionSection(el.id)) {
            AccordianSections.forEach((e) => e.open(false));
            el.open(true);
            BackMeUp.includeVar('ActiveAccordion', el.id);
        }
    }
    el.addEventListener("click", el.setActive );
});
function canIopenThisAccordionSection(elId) {
    return true;
    if (elId == 'IdentifyAccordionBtn') return true; // always allow Identify tab to open
    if (elId == 'AssistAccordionBtn' || elId == 'ReviewAccordionBtn') {
        if (SelectedPersonId == '') return false; // can't open Assist tab if no person is selected
        return true;
    }
    return false;
}
// set transition AFTER opening the first section
document.documentElement.style.setProperty('--accordion-transition', 'height 0.5s ease');
// on doument resize, re-set height property
const resizeToWindowHeight = () => {
    document.querySelector('.accordion.active + .accordion-panel').style.height = (window.innerHeight - 165) + "px";
}
document.addEventListener("click", (e) => resizeToWindowHeight);
window.addEventListener('resize', resizeToWindowHeight);
// register input onenter
Array.from(document.querySelectorAll('*[onenter]')).forEach((el) => {
    el.addEventListener("keyup", (e) => {
        // console.log(e.keyCode);
        if (e.keyCode === 13) {
            _(el.getAttribute('onenter')).click();
        }
    });
});

function openLinkFromTop(el) {
    if (top === window) {
        window.open(el.getAttribute('href'), '_blank');
    } else {
        top.postMessage({type: 'open_a_new_tab', url: el.getAttribute('href')}, '*');
    }
}

function detectSearchQueryType(inVal, outputSpan) {
    inVal = inVal.trim().toLowerCase();
    if (inVal == '') {
        outputSpan.innerText = '...';
        _('IdenifySearchButton').disabled = true;
        _('IdenifySearchQuery').setAttribute('Q-type', 'X');
    }
    // if inVal is an I-number
    else if (inVal.length == 9 && !isNaN(inVal)) {
        outputSpan.innerText = 'I-Number';
        _('IdenifySearchButton').disabled = false;
        _('IdenifySearchQuery').setAttribute('Q-type', 'I#');
    }
    // if inVal is a phone number
    // else if (inVal.startsWith('+') && inVal.match(/^[+0-9()-\s]*$/)) {
    //     outputSpan.innerText = 'Phone Number';
    //     _('IdenifySearchButton').disabled = false;
    //     _('IdenifySearchQuery').setAttribute('Q-type', 'PHONE');
    // }
    // if inVal is an email
    // else if (inVal.includes('@')) {
    //     outputSpan.innerText = 'Email';
    //     _('IdenifySearchButton').disabled = false;
    //     _('IdenifySearchQuery').setAttribute('Q-type', 'EMAIL');
    // }
    // if inval is a name
    else {
        outputSpan.innerText = 'Name';
        _('IdenifySearchButton').disabled = false;
        _('IdenifySearchQuery').setAttribute('Q-type', 'NAME');
    }
}
function showLoader(yesOrNo) {
    _('loadingOverlay').style.display = yesOrNo ? null : 'none';
}

let PersonSearchResults = [];
let SelectedPersonId = '';
function setSelectedPersonId(id) {
    SelectedPersonId = id;
    BackMeUp.includeVar('SelectedPersonId', id);
}
async function conductIdenitySearch(el) {
    let q = el.value;
    let t = el.getAttribute('Q-type');
    if (q.trim() == '' || t == 'X') return;

    // reset the selection process
    setSelectedPersonId('');
    PersonSearchResults = [];

    showLoader(true);

    let res = await TDcontrol.searchPersonAsType(q.trim(), t);
    PersonSearchResults = ensurePersonResultsAreJson(res);
    
    showLoader(false);


    // display Results
    BackMeUp.includeVar('PersonSearchResults', PersonSearchResults);
    populateRequestorCards();
}
function ensurePersonResultsAreJson(res) {
    if (res.length == 0) return [0];
    return res;
}
function populateRequestorCards() {
    const peopleReultsList = _('peopleReultsList');
    peopleReultsList.innerHTML = '';
    PersonSearchResults.forEach((result) => {
        let personCard = document.createElement('div');
        personCard.className = 'personCard';
        if (result == 0) {
            personCard.innerHTML = `
                <h3 style="cursor:default; text-align:center">No Results or Too Many</h3>
            `;
            peopleReultsList.appendChild(personCard);
            personCard = document.createElement('div');
            personCard.className = 'personCard';
            personCard.innerHTML = `
                <h3 style="cursor:default;">Options:</h3>
                <ul>
                    <li>Try <div onclick="openLinkFromTop(this)" href="https://roles.byui.edu/Users.aspx" class="link">Role Manager</div></li>
                    <li>Create a <div onclick="openCreatePersonWindow()" class="link">New Person</div></li>
                    <li>Try a different search</li>
                </ul>
            `;
            peopleReultsList.appendChild(personCard);
            return;
        }
        if (result.UID == SelectedPersonId) {
            personCard.classList.add('selected');
            parent.postMessage({type: 'rename_interaction', name: result.FullName}, '*');
            document.querySelector('#IdentifyAccordionBtn span').innerHTML = ': ' + result.FullName;
        }
        personCard.setAttribute('id', result.UID);
        personCard.innerHTML = `
            <h3 onclick="openPersonDetails('`+result.UID+`')">`+result.FullName+`</h3>
            <p>`+result.PrimaryEmail+`</p>
            <p>`+(result.DefaultAccountName||result.Department)+`</p>
            <button onclick="selectPersonAndStartTicket('`+result.UID+`')"><div style="width: 30px; height: 100%; display: flex; align-items: center;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="var(--gen-orange)"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 64C28.7 64 0 92.7 0 128l0 64c0 8.8 7.4 15.7 15.7 18.6C34.5 217.1 48 235 48 256s-13.5 38.9-32.3 45.4C7.4 304.3 0 311.2 0 320l0 64c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-64c0-8.8-7.4-15.7-15.7-18.6C541.5 294.9 528 277 528 256s13.5-38.9 32.3-45.4c8.3-2.9 15.7-9.8 15.7-18.6l0-64c0-35.3-28.7-64-64-64L64 64zm64 112l0 160c0 8.8 7.2 16 16 16l288 0c8.8 0 16-7.2 16-16l0-160c0-8.8-7.2-16-16-16l-288 0c-8.8 0-16 7.2-16 16zM96 160c0-17.7 14.3-32 32-32l320 0c17.7 0 32 14.3 32 32l0 192c0 17.7-14.3 32-32 32l-320 0c-17.7 0-32-14.3-32-32l0-192z"/></svg></div></button>
        `;
        peopleReultsList.appendChild(personCard);
    });
}
let currentPopupWindow = null;
function openCreatePersonWindow() {
    const popupWidth = 800;
    const popupHeight = 760;
    const left = (screen.width - popupWidth) / 2;
    const top = (screen.height - popupHeight) / 2;
    currentPopupWindow = window.open('https://td.byui.edu/TDNext/Apps/People/PersonNew', 'CreatePerson', 'width='+popupWidth+',height='+popupHeight+',top='+top+',left='+left);
}
function openPersonDetails(U_identifier) {
    const popupWidth = 800;
    const popupHeight = 760;
    const left = (screen.width - popupWidth) / 2;
    const top = (screen.height - popupHeight) / 2;
    window.open('https://td.byui.edu/TDNext/Apps/People/PersonDet.aspx?U=' + U_identifier, 'PersonDetails', 'width='+popupWidth+',height='+popupHeight+',top='+top+',left='+left);
}
function openInNewTab(url) {
    window.open(url, '_blank');
}

function selectPersonAndStartTicket(U_identifier) {
    // highlight that person's card
    setSelectedPersonId(U_identifier);
    _('peopleReultsList').children.forEach(personCard => personCard.classList.remove('selected'));
    document.querySelector('#peopleReultsList div.personCard[id="'+SelectedPersonId+'"]').classList.add('selected');
    
    let person = PersonSearchResults.filter((per) => per.UID === SelectedPersonId)[0];
    _('RequesterName_toSubmit').value = person.FullName;
    _('RequesterName_toSubmit').classList.remove('error');
    document.querySelector('#IdentifyAccordionBtn span').innerHTML = ': ' + person.FullName;
    parent.postMessage({type: 'rename_interaction', name: person.FullName}, '*');
    _('AssistAccordionBtn').setActive();
}


async function generateTicketWithAI() {
    showLoader(true);
    let result = await TDcontrol.generateAIDescription(_('agentNotesTextarea').value);

    // get Interaction Link
    let convLink = '';
    if (GenesysAuth.conversation && GenesysAuth.conversation.id) {
        convLink = ' \n\nInteraction Link: https://apps.usw2.pure.cloud/directory/#/analytics/interactions/' + GenesysAuth.conversation.id + '/admin/';
    }

    _('DescriptionTextarea_ToSubmit').value = result.desc + convLink; // set the description
    _('Title_toSubmit').value = result.title.trim().replace(/^(title:)/,'').replace(/^(Title:)/,'').trim().replace(/^"(.*)"$/g, '$1') // set the title and remove extra quotes and 'title:' from the beginning
    if (result.isIncident) { // select the correct radio buttons for incident or service request
        _('Type_toSubmit_Incident').click();
        _('Status_toSubmit_New').click();
    } else {
        _('Type_toSubmit_Service_Request').click();
        _('Status_toSubmit_Resolved').click();
    }
    _('Responsible_toSubmit').setSelected(result.responsible);
    showLoader(false);

    // show insert transcript button if not in a voice interaction
    _('insertChatTranscriptBtn').style.display = GenesysAuth.interactionType.includes('message') ? 'block' : 'none';

    _('ReviewAccordionBtn').setActive();
}

async function insertChatTranscript() {
    _('DescriptionTextarea_ToSubmit').value += `

------------------------------------------------
       Interaction Transcript
------------------------------------------------
` + await GenesysAuth.getConversationTranscript();
}

async function submitTicketToTD() {
    // verify that fields are filled out
    let gg = true;
    let fieldsToCheck = ['RequesterName_toSubmit', 'Responsible_toSubmit', 'Title_toSubmit', 'KB_toSubmit', 'DescriptionTextarea_ToSubmit'];
    // if an incident, add the rest of the fields
    if (_('Type_toSubmit_Incident').checked) {
        fieldsToCheck.push('impact_toSubmit', 'urgency_toSubmit', 'priority_toSubmit', 'building_toSubmit', 'room_toSubmit');
    }
    fieldsToCheck.forEach((field) => {
        let thisEl = _(field);
        thisEl.addEventListener('input', () => {
            thisEl.classList.remove('error');
        });
        if (thisEl.classList.contains('autoComplete')) { // dropdown input
            if (thisEl.getAttribute('data-value')) {
                thisEl.classList.remove('error');
            } else {
                gg = false;
                thisEl.classList.add('error');
            }
        } else { // text input
            if (thisEl.value.trim() == '') {
                gg = false;
                thisEl.classList.add('error');
    
            } else {
                thisEl.classList.remove('error');
            }
        }
    });
    if (!gg) { 
        JSAlert.alert('Looks like you forgot something. Go back and make sure you filled in every field.', 'Incomplete', JSAlert.Icons.Failed);
        return;
    }


    if ( !await JSAlert.confirm('<br>Are you sure you want to submit this ticket?<br><br>', 'Submit Ticket?', 'img/Becker-Ticketer%20Logo.svg', 'Yes, Submit Ticket', 'No, Cancel') ) { return; }
    showLoader(true);

    const title = _('Title_toSubmit').value;
    const classification = _('Type_toSubmit_Incident').checked ? _('Type_toSubmit_Incident').getAttribute('data-value') : _('Type_toSubmit_Service_Request').getAttribute('data-value');
    const responsible = _('Responsible_toSubmit').getAttribute('data-value');
    const status = _('Status_toSubmit_New').checked ? _('Status_toSubmit_New').getAttribute('data-value') : _('Status_toSubmit_Resolved').getAttribute('data-value');
    const uid = SelectedPersonId;
    const kb = [ _('KB_toSubmit').value, _('KB_toSubmit').getAttribute('data-value') ];
    const description = _('DescriptionTextarea_ToSubmit').value.replace(/\n/g, '<br>');

    const impact = _('impact_toSubmit').value;
    const urgency = _('urgency_toSubmit').value;
    const priority = _('priority_toSubmit').value;
    let b = [_('building_toSubmit').getAttribute('data-value'), _('building_toSubmit').value];
    const building = (b[0]) ? b[0]+';'+b[1] : '';
    const room = _('room_toSubmit').value;

    let res = await TDcontrol.submitTicket( title, classification, responsible, status, uid, kb, description, building, room, impact, urgency, priority );

    showLoader(false);
}


let autocompleteTimeout;
document.getElementsByClassName("autoComplete").forEach(inputEl => {
    let autoComplete_wrapper = document.createElement("div");
    autoComplete_wrapper.classList.add("autoComplete_wrapper");
    inputEl.parentNode.insertBefore(autoComplete_wrapper, inputEl);
    autoComplete_wrapper.appendChild(inputEl);

    let resultsUl = document.createElement("ul");
    autoComplete_wrapper.appendChild(resultsUl);

    inputEl.setSelected = (item) => {
        if (item) {
            inputEl.setAttribute("data-value", item.value);
            inputEl.value = item.text;
            resultsUl.innerHTML = "";
        }
    }


    inputEl.addEventListener("input", function () {
        // trigger deselect callback
        if (inputEl.getAttribute("data-value")!=null && inputEl.getAttribute("deselect-callback")!=null) {
            eval(inputEl.getAttribute("deselect-callback"));
        }
        if (inputEl.classList.contains("oneOfTheKBinputs")) {
            document.getElementsByClassName('oneOfTheKBinputs').forEach(thisInputEl => {
                thisInputEl.removeAttribute("data-value");
                thisInputEl.value = inputEl.value;
                thisInputEl.nextElementSibling.innerHTML = '';
            });
        }
        resultsUl.innerHTML = '';
        inputEl.removeAttribute("data-value");
        clearTimeout(autocompleteTimeout);
        let query = this.value.trim();
        
        if (query.length < 2) return;

        autocompleteTimeout = setTimeout(async () => {
            // set Ul width
            resultsUl.style.width = (inputEl.offsetWidth - 2) + "px";
            resultsUl.innerHTML = '<li>Loading...</li>';

            let data = [];
            if (inputEl.classList.contains("oneOfTheKBinputs")) {
                data = await TDcontrol.searchKBs(query);  // seark KBs
            } else {
                data = eval(inputEl.getAttribute('data-obj') + `.filter(item => item.text.toLowerCase().includes(query.toLowerCase()))`);
            }

            resultsUl.innerHTML = '';
            data.forEach(item => {
                let div = document.createElement("li");
                div.textContent = item.text;
                div.classList.add("result-item");
                div.addEventListener("click", () => {
                    if (inputEl.classList.contains("oneOfTheKBinputs")) {
                        document.getElementsByClassName('oneOfTheKBinputs').forEach(thisInputEl => {
                            thisInputEl.setAttribute("data-value", item.value);
                            thisInputEl.value = item.text;
                            thisInputEl.nextElementSibling.innerHTML = '';
                        });
                    }
                    inputEl.setAttribute("data-value", item.value);
                    inputEl.value = item.text;
                    resultsUl.innerHTML = "";

                    // trigger callback
                    if (inputEl.getAttribute('select-callback')!=null) {
                        eval(inputEl.getAttribute('select-callback'));
                    }
                });
                resultsUl.appendChild(div);
            });
        }, 500); // Wait 300ms before making API call
    });
});
document.addEventListener("click", (e) => {
    let foundFocused = null;
    let wrappers = document.querySelectorAll("div.autoComplete_wrapper");
    for (let i = 0; i < wrappers.length; i++) {
        const wrapper = wrappers[i];
        if (wrapper.contains(e.target)) {
            // this is the selected input, none others should be focused
            foundFocused = wrapper;
            wrapper.classList.add("focused");
            break;
        }
    }
    wrappers.forEach(wrapper => {
        if (wrapper !== foundFocused) {
            wrapper.classList.remove("focused");
        }
    });
})




// Restore Local Ticket
if (BackMeUp.restoreLocalTicket()) {
    SelectedPersonId = BackMeUp.includedVars['SelectedPersonId'] || '';
    PersonSearchResults = BackMeUp.includedVars['PersonSearchResults'] || [];
    populateRequestorCards();
}