(async function() {
await new Promise(r => setTimeout(r, 5000)); // wait a sec to let it load

//      Create B Responses Button
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let templateBtnParent = document.querySelector('DIV[data-automation-id="reply-box"]').lastElementChild;
const button = document.createElement('BUTTON');
button.classList.add('button-override-gux-icon-only');
button.innerHTML = 'B Responses';
button.style.cssText = `
    background-color: transparent;
    border: 1px solid rgb(33, 67, 162);
    color: rgb(33, 67, 162);
    border-radius: 4px;
    padding: 5px;
    cursor: pointer;
`;
button.id = 'becker-ticketer-chat-templates-btn';
templateBtnParent.insertBefore(button, templateBtnParent.children[templateBtnParent.children.length - 1]);


// ─── CONFIGURE THESE ──────────────────────────────────────────────────────────
const storageKey = 'becker-ticketer-chat-responses';
function onResponse(text){
    document.querySelector('DIV[data-automation-id="editor-content"] div').innerHTML = text;
}
if (!button) return console.error(`Button #${buttonId} not found`);

// --- inject CSS ---
const css = `
/* Popup size */
.rsp-popup {
    position: absolute;
    width: 320px;
    height: 420px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    font-family: sans-serif;
    z-index: 10000;
    display: none;
    overflow: hidden;
}
/* Header */
.rsp-header {
    background: #303841;
    color: #fff;
    padding: 10px 12px;
    font-size: 16px;
    font-weight: 500;
}
/* Tabs */
.rsp-tabs { display:flex; background: #f1f3f6; }
.rsp-tab {
    flex:1; text-align:center; padding:8px 0; cursor:pointer;
    user-select:none; font-weight:500; color: #555;
    border-bottom: 2px solid transparent;
}
.rsp-tab.active {
    color: #ff5722;
    border-bottom-color: #ff5722;
}
/* Content area */
.rsp-content {
    height: calc(100% - 76px);
    overflow-y: auto;
    padding: 8px;
    background: #fff;
}
.rsp-content h3 {
    width:100%;
    text-align:center;
}
.rsp-content hr {
    margin: 15px 5px;
}
/* Collapsible categories */
.rsp-cat { margin-bottom: 4px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9; }
.rsp-cat-header {
    display:flex; justify-content: space-between; align-items:center;
    padding:6px 10px; cursor: pointer;
    font-weight:500; color: #333;
}
.rsp-cat-header:hover { background: #eee; }
.rsp-cat-header .arrow { transition: transform .2s ease; }
.rsp-cat-header.collapsed .arrow { transform: rotate(-90deg); }
.rsp-list { list-style:none; margin:0; padding:0; }
.rsp-item {
    display:flex; justify-content: space-between; align-items:center;
    padding:6px 12px; cursor: pointer;
    border-top:1px solid #eee; background: #fff;
}
.rsp-item:hover { background: #f5f5f5; }
.rsp-item .delete { color: #d00; font-weight: bold; cursor:pointer; }
/* Manage forms */
.rsp-form-row { display:flex; align-items:center; margin-bottom:8px; }
.rsp-form-row textarea {
    resize: none;
    width: 100%;
    height: 100px;
}
.rsp-form-row input, .rsp-form-row textarea, .rsp-form-row select { flex:1; padding:6px 8px; margin-right:6px; border:1px solid #ccc; border-radius:4px; }
.rsp-form-row button { padding:6px 12px; border:none; border-radius:4px; background:#ff5722; color:#fff; cursor:pointer; }
.rsp-cat-manage { display:flex; justify-content: space-between; align-items:center; padding:6px 10px; border-bottom:1px solid #eee; }
.rsp-cat-manage button { background:transparent; border:none; cursor:pointer; font-size:14px; color:#d00; padding: 0 10px }
`;
const style = document.createElement('style'); style.textContent = css;
document.head.appendChild(style);
const jsAlertScriptEl = document.createElement('script');
jsAlertScriptEl.src = 'https://21beckem.github.io/Becker-Ticketer/jsalert.js';
document.head.appendChild(jsAlertScriptEl);

// --- data handling ---
let data = JSON.parse(localStorage.getItem(storageKey) || 'null');
if (!data) { data = { Greeting: [] }; save(); }
function save() { localStorage.setItem(storageKey, JSON.stringify(data)); }

// --- build popup ---
const popup = document.createElement('div'); popup.className = 'rsp-popup';
const header = document.createElement('div'); header.className = 'rsp-header'; header.textContent = 'Canned Responses';
const tabs = document.createElement('div'); tabs.className = 'rsp-tabs';
const contents = [document.createElement('div'), document.createElement('div')];
['Responses', 'Manage'].forEach((label, i) => {
    const t = document.createElement('div'); t.className = 'rsp-tab' + (i === 0 ? ' active' : ''); t.textContent = label;
    t.addEventListener('click', () => {
        tabs.querySelectorAll('.rsp-tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        contents.forEach((c, ci) => c.style.display = ci === i ? 'block' : 'none');
        i === 0 ? renderResponses() : renderManage();
    });
    tabs.appendChild(t);
});
contents.forEach(c => { c.className = 'rsp-content'; popup.appendChild(c); });
contents[1].style.display = 'none';
popup.prepend(header);
popup.insertBefore(tabs, contents[0]);
document.body.appendChild(popup);

// --- render Responses tab ---
function renderResponses() {
    const container = contents[0]; container.innerHTML = '';
    Object.keys(data).forEach(cat => {
        const box = document.createElement('div'); box.className = 'rsp-cat';
        const h = document.createElement('div'); h.className = 'rsp-cat-header'; h.innerHTML = `<span>${cat}</span><span class=\"arrow\">▶</span>`;
        let open = true;
        h.addEventListener('click', () => {
            open = !open;
            list.style.display = open ? 'block' : 'none';
            h.classList.toggle('collapsed', !open);
        });
        box.appendChild(h);

        const list = document.createElement('ul'); list.className = 'rsp-list';
        data[cat].forEach((txt, idx) => {
            const li = document.createElement('li'); li.className = 'rsp-item';
            li.innerHTML = `<span>${txt}</span><span class=\"delete\">×</span>`;
            // select
            li.querySelector('span:first-child').addEventListener('click', () => { onResponse(txt); hidePopup(); });
            // delete
            li.querySelector('.delete').addEventListener('click', e => {
                e.stopPropagation(); data[cat].splice(idx, 1);
                if (data[cat].length === 0) delete data[cat];
                save(); renderResponses();
            });
            list.appendChild(li);
        });
        box.appendChild(list);
        container.appendChild(box);
    });
}

// --- render Manage tab ---
function renderManage() {
    const c = contents[1]; c.innerHTML = '';

    // Add response
    const h3_createRes = document.createElement('h3'); h3_createRes.textContent = 'Create Response'; c.appendChild(h3_createRes);
    const rowTextarea = document.createElement('div'); rowTextarea.className = 'rsp-form-row';
    rowTextarea.innerHTML = `<textarea placeholder=\"New response...\" id=\"_rspText\"></textarea>`;
    c.appendChild(rowTextarea);
    const rowRsp = document.createElement('div'); rowRsp.className = 'rsp-form-row';
    rowRsp.innerHTML = `
    <select id=\"_rspCat\"></select>
    <button>Add Response</button>`;
    c.appendChild(rowRsp);
    const sel = rowRsp.querySelector('#_rspCat');
    Object.keys(data).forEach(cat => sel.appendChild(Object.assign(document.createElement('option'), { value: cat, textContent: cat })));
    rowRsp.querySelector('button').addEventListener('click', () => {
        const t = rowTextarea.querySelector('#_rspText').value.trim();
        const cat = sel.value;
        if (t && cat) { data[cat].push(t); save(); rowTextarea.querySelector('#_rspText').value = ''; renderManage(); }
    });

    // HR
    c.appendChild( document.createElement('hr') );

    // Add category
    const h3_createCat = document.createElement('h3'); h3_createCat.textContent = 'Create Category'; c.appendChild(h3_createCat);
    const rowCat = document.createElement('div'); rowCat.className = 'rsp-form-row';
    rowCat.innerHTML = `
    <input type=\"text\" placeholder=\"New category...\" id=\"_catName\" />
    <button>Add Category</button>`;
    c.appendChild(rowCat);
    rowCat.querySelector('button').addEventListener('click', () => {
        const name = rowCat.querySelector('#_catName').value.trim();
        if (name && !data[name]) { data[name] = []; save(); rowCat.querySelector('#_catName').value = ''; renderManage(); }
    });

    // HR
    c.appendChild( document.createElement('hr') );

    // Category list (rename/delete)
    const h3_catList = document.createElement('h3'); h3_catList.textContent = 'Category List'; c.appendChild(h3_catList);
    Object.keys(data).forEach(cat => {
        const div = document.createElement('div'); div.className = 'rsp-cat-manage';
        const nameSpan = document.createElement('span'); nameSpan.textContent = cat;
        const btns = document.createElement('div');
        const ren = document.createElement('button'); ren.textContent = '✎'; ren.title = 'Rename';
        ren.addEventListener('click', async () => {
            const nv = await JSAlert.prompt('Rename category: ' + cat);
            if (nv && nv !== cat) { data[nv] = data[cat]; delete data[cat]; save(); renderManage(); }
        });
        const del = document.createElement('button'); del.textContent = '×'; del.title = 'Delete';
        del.addEventListener('click', async () => {
            if (await JSAlert.confirm(`Delete category "${cat}"?`)) { delete data[cat]; save(); renderManage(); }
        });
        btns.append(ren, del);
        div.append(nameSpan, btns);
        c.appendChild(div);
    });
}

// --- show/hide ---
function showPopup() {
    const r = button.getBoundingClientRect();
    popup.style.display = 'block';
    const w = popup.offsetWidth, h = popup.offsetHeight;
    popup.style.top = `${window.scrollY + r.top - h - 6}px`;
    popup.style.left = `${window.scrollX + r.left + (r.width - w) / 2}px`;
    renderResponses();
}
function hidePopup() { popup.style.display = 'none'; }
button.addEventListener('click', e => {
    e.stopPropagation();
    popup.style.display === 'block' ? hidePopup() : showPopup();
});
document.addEventListener('click', e => {
    if (popup.style.display === 'block' && !popup.contains(e.target) && e.target !== button)
        hidePopup();
});

})();