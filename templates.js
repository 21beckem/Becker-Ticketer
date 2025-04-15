class Templates {
    static exUrl = 'https://script.google.com/macros/s/AKfycbwe3HPdEoatsbZ90qqdwYeHcLiuKGsKImvhtKT41QbZarVeEqJVeHFmg8kQ5ChYAM2o/exec';
    static async new(user, kbNum, agentNotes) {
        Templates.update('new', user, kbNum, agentNotes);
    }
    static async get(user, kbNum) {
        function csvToArray (csv) {
            let rows = csv.split("\n");
        
            return rows.map(function (row) {
                return row.split(",").map((cell) => {
                    return cell.replace(/\"/g, "");;
                });
            });
        };
        const query = `select * where B='${user}' and C='K${kbNum}'`;
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
        const row = [user, 'K'+kbNum, agentNotes];
        const url = `${Templates.exUrl}?page=Templates&id=${id}&row=${encodeURIComponent(JSON.stringify(row))}`;
        let res = await fetch(url);
        res = await res.text();
        
        if (res.toLowerCase().includes('error')) {
            console.error(res);
            return false;
        }
        return true;
    }
}