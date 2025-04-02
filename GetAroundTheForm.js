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
const token = AppFormRenderPage._data.et;
let fromJson = {
    customerId: 10,
    flowPId: '5fdd0866-6309-4e35-b405-32a03f36d1fb',
    flowVersion: 0,
    t: token,
    vt: '',
    data: { "searchInput" : "455750011" },
    waitForTimeout: '',
    preview: false
}

let form = jsonToFormData(fromJson);

const res = await fetch('/tdapp/app/form/api/v1/event', {
    method: 'POST',
    body: form
});
await res.json();