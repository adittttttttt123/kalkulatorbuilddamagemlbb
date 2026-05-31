const https = require('https');

function followUrl(url) {
    return new Promise((resolve) => {
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        };
        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                console.log(`REDIRECT: ${url} -> ${res.headers.location}`);
                resolve(followUrl(res.headers.location));
            } else {
                console.log(`FINAL: ${url} => Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);
                resolve(res.statusCode);
            }
        }).on('error', (e) => {
            console.log(`ERROR: ${url} => ${e.message}`);
            resolve(null);
        });
    });
}

async function test() {
    const testItems = [
        "Blade_of_Despair.png",
        "Berserker%27s_Fury.png",
        "Miya.png"
    ];
    
    for (const file of testItems) {
        console.log(`=== Testing File: ${file} ===`);
        await followUrl(`https://liquipedia.net/mobilelegends/Special:FilePath/${file}`);
    }
}


test();



