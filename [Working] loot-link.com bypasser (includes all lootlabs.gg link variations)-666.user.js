// ==UserScript==
// @name         [Working] loot-link.com bypasser (includes all lootlabs.gg link variations)
// @homepageURL  https://discord.gg/92p6X2drxn
// @description  bypasses loot-link.com quickly and efficiently, saving you time and energy.
// @author       Vixer
// @match        https://loot-link.com/s?*
// @match        https://loot-links.com/s?*
// @match        https://lootlink.org/s?*
// @match        https://lootlinks.co/s?*
// @match        https://lootdest.info/s?*
// @match        https://lootdest.org/s?*
// @match        https://lootdest.com/s?*
// @match        https://links-loot.com/s?*
// @match        https://linksloot.net/s?*
// @grant        unsafeWindow
// @run-at       document-start
// @version      666
// @license      MIT
// @supportURL   https://discord.gg/92p6X2drxn
// @icon         https://i.ibb.co/nMBgVNz/skull.png
// @namespace https://greasyfork.org/users/1237543
// @downloadURL https://update.greasyfork.org/scripts/483207/%5BWorking%5D%20loot-linkcom%20bypasser%20%28includes%20all%20lootlabsgg%20link%20variations%29.user.js
// @updateURL https://update.greasyfork.org/scripts/483207/%5BWorking%5D%20loot-linkcom%20bypasser%20%28includes%20all%20lootlabsgg%20link%20variations%29.meta.js
// ==/UserScript==

let initData;

let syncer;

let sessionData;

let origFetch = fetch;
unsafeWindow.fetch = function (url, ...options) {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await origFetch(url, ...options);
            try {
                if (url.includes(p.CDN_DOMAIN)) {
                    initData = res.clone();
                    initData = await initData.text();
                    initData = '[' + initData.slice(1, -2) + ']';
                    initData = JSON.parse(initData);
                    syncer = initData[10];
                }
                else if (url.includes(syncer) && !sessionData) {
                    sessionData = res.clone();
                    sessionData = await sessionData.json();
                    bypass();
                }
            } catch (e) {
                console.error(e);
                let reportError = confirm(`${e.message}\n\nwould you like to report this error?`);
                if (reportError) {
                    navigator.clipboard.writeText(e.message);
                    window.location.replace('https://discord.gg/keybypass');
                }
                else {
                    window.location.reload();
                }
            }
            resolve(res);
        } catch (e) {
            reject(e);
        }
    });
}

async function bypass() {
    let urid = sessionData[0].urid;

    let server = initData[9];
    server = (Number(urid.toString().substr(-5)) % 3) + '.' + server;

    let websocket = new WebSocket(`wss://${server}/c?uid=${urid}&cat=54&key=${p.KEY}`);
    fetch(sessionData[0].action_pixel_url)
    websocket.onopen = async function (event) {
        await fetch(`https://${server}/st?uid=${urid}&cat=54`, { method: 'POST', })
        await fetch(`https://${syncer}/td?ac=1&urid=${urid}&&cat=54&tid=${p.TID}`)
    };
    websocket.onmessage = function (event) {
        if (event.data.startsWith('r:')) {
            let data = event.data.split(':')[1];
            data = decryptData(data);
            window.location.assign(data);
        }
    };
}

function decryptData(encodedData, keyLength = 5) {
    let decryptedData = '',
        base64Decoded = atob(encodedData),
        key = base64Decoded.substring(0, keyLength),
        encryptedContent = base64Decoded.substring(keyLength);

    for (let i = 0; i < encryptedContent.length; i++) {
        let charCodeEncrypted = encryptedContent.charCodeAt(i),
            charCodeKey = key.charCodeAt(i % key.length),
            decryptedCharCode = charCodeEncrypted ^ charCodeKey;

        decryptedData += String.fromCharCode(decryptedCharCode);
    }

    return decryptedData;
}