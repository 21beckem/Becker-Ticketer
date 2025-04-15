if (!GenesysAuth.genesysConnected) {
    console.error('GenesysAuth.genesysConnected is false! Any attempt to use templates.js will fail.');
}
class Templates {
    static exUrl = 'https://script.google.com/macros/s/AKfycbwe3HPdEoatsbZ90qqdwYeHcLiuKGsKImvhtKT41QbZarVeEqJVeHFmg8kQ5ChYAM2o/exec';
    static async new(user, kbNum, agentNotes) {
        await Templates.update('new', user, kbNum, agentNotes);
    }
    static async get(user, kbNum='') {
        function csvToArray (csv) {
            let rows = csv.split("\n");
        
            return rows.map(function (row) {
                row = row.split(",").map((cell) => {
                    return cell.replace(/\"/g, "");;
                });
                
                row[3] = row[3].replaceAll('*@*', '\n').replaceAll('~@~', ',');
                return row;
            });
        };
        const kbPart = kbNum == '' ? '' : ` and C='K${kbNum}'`;
        const query = `select * where B='${user}'${kbPart}`;
        const url = `https://docs.google.com/spreadsheets/d/193YHiuDQzUwLDVzNZSuN0im9T7N7e-_WvOHR4RT8hGM/gviz/tq?tqx=out:csv&tq=${encodeURIComponent(query)}`;
        let res = await fetch(url);
        res = await res.text();

        if (res.toLowerCase().includes('error')) {
            console.error(res);
            return [[]];
        } else if (res == '') {
            return [[]];
        }
        res = csvToArray(res);
        return res;
    }
    static async update(id, user, kbNum, agentNotes) {
        const row = [user, 'K'+kbNum, agentNotes.replaceAll('\n', '*@*').replaceAll(',', '~@~')];
        const url = `${Templates.exUrl}?page=Templates&id=${id}&row=${encodeURIComponent(JSON.stringify(row))}`;
        let res = await fetch(url);
        res = await res.text();
        
        if (res.toLowerCase().includes('error')) {
            console.error(res);
            return false;
        }
        Templates.myTemplates = await Templates.get(user);
        return true;
    }
    static myTemplates = [];
}
let currentTemplate = null;
async function useTemplateBtnClick() {
    if (_('agentNotesTextarea').value.replaceAll('\n', '').trim() != '') {
        if (!( await JSAlert.confirm('You currently have agent notes written. Are you sure you would like to overwrite this with the template?', 'Overwrite?', 'img/Becker-Ticketer%20Logo.svg', 'Yes', 'No') )) {
            return;
        }
    }
    _('agentNotesTextarea').value = currentTemplate[3];
}
async function saveTemplateMenu() {
    if (_('KBSearchQuery').getAttribute('data-value') == null) {
        JSAlert.alert('Please select a KB Article first.', '', 'img/Becker-Ticketer%20Logo.svg');
        return;
    }
    if ( await JSAlert.confirm('Would you like to save what you currently have in the Agent Notes as a template for this KB?', 'Save Template?', 'img/Becker-Ticketer%20Logo.svg', 'Yes, Save', 'No') ) {
        let res = true;
        if (currentTemplate == null) {
            res = await Templates.new(GenesysAuth.userMe.email, _('KBSearchQuery').getAttribute('data-value'), _('agentNotesTextarea').value);
        } else {
            res = await Templates.update(currentTemplate[0], GenesysAuth.userMe.email, _('KBSearchQuery').getAttribute('data-value'), _('agentNotesTextarea').value);
        }
        if (res) {
            onKBselectionChange(true);
        } else {
            // JSAlert.alert('An error occured while saving your template. Please try again later.', 'Oh no!', JSAlert.Icons.Failed);
        }
    }
}
function onKBselectionChange(selected) {
    if (!selected) {
        _('useTemplateBtn').setAttribute('disabled', '');
        _('templateOptionsBtn').setAttribute('disabled', '');
        currentTemplate = null;
    } else {
        let selectedKB = _('KBSearchQuery').getAttribute('data-value');
        let foundTemplates = Templates.myTemplates.filter((template) => template[2] == 'K'+selectedKB);
        if (foundTemplates.length == 0) {
            _('useTemplateBtn').setAttribute('disabled', '');
            _('templateOptionsBtn').setAttribute('disabled', '');
            currentTemplate = null;
            return;
        }
        _('useTemplateBtn').removeAttribute('disabled');
        _('templateOptionsBtn').removeAttribute('disabled');
        currentTemplate = foundTemplates[0];
    }
}

window.addEventListener('load', () => {
    Templates.get(GenesysAuth.userMe.email).then((res) => {
        Templates.myTemplates = res;
    });
})