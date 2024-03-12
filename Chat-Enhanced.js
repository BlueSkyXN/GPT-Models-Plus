// ==UserScript==
// @name              KeepChatGPT
// @description       基于xcanwin/KeepChatGPT项目的优化版本，对部分功能和代码进行了增删改，遵循GPL开源协议。本脚本可以大幅度提升ChatGPT使用体验。
// @version           24.3
// @author            BlueSkyXN、xcanwin
// @namespace         https://github.com/BlueSkyXN/GPT-Models-Plus/
// @supportURL        https://github.com/BlueSkyXN/GPT-Models-Plus/
// @icon              data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogPCEtLSBDcmVhdGVkIHdpdGggTWV0aG9kIERyYXcgLSBodHRwOi8vZ2l0aHViLmNvbS9kdW9waXhlbC9NZXRob2QtRHJhdy8gLS0+CiA8Zz4KICA8dGl0bGU+YmFja2dyb3VuZDwvdGl0bGU+CiAgPHJlY3QgZmlsbD0ibm9uZSIgaWQ9ImNhbnZhc19iYWNrZ3JvdW5kIiBoZWlnaHQ9IjQ3IiB3aWR0aD0iNDciIHk9Ii0xIiB4PSItMSIvPgogIDxnIGRpc3BsYXk9Im5vbmUiIG92ZXJmbG93PSJ2aXNpYmxlIiB5PSIwIiB4PSIwIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIiBpZD0iY2FudmFzR3JpZCI+CiAgIDxyZWN0IGZpbGw9InVybCgjZ3JpZHBhdHRlcm4pIiBzdHJva2Utd2lkdGg9IjAiIHk9IjAiIHg9IjAiIGhlaWdodD0iMTAwJSIgd2lkdGg9IjEwMCUiLz4KICA8L2c+CiA8L2c+CiA8Zz4KICA8dGl0bGU+TGF5ZXIgMTwvdGl0bGU+CiAgPGltYWdlIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQzBBQUFBdENBTUFBQUFOeEJLb0FBQUFObEJNVkVVQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0FnSUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCTHIweWtBQUFBRVhSU1RsTUFJdmZqMXFNNGxHZUN6YnhJZHhXd1ZFcUlTSmdBQUFFdlNVUkJWRWpIemRUYmJvVWdFSVhobVFGQkRoN1crNzlzRWNNR2JOR20yVTM3M2ZySHhHVXlWRVNQRVIvcFlzR2RoVG9NUVBUWEJBQlR5d0dLNld1c3JpKzN3RVFqRTJEL29MWlRaUjlyUVNWdnJ1ZFdyZi9wZ2pNZ094ZDA0R0lYWUtiV0trZ2tnemdpY29KS3JkU0pnb1lsaXpZMmRNSFc2NU1Db0k5R243eGx1ckhoc05FM1RXZ21lbWJieVo1RmVpTysxN2RCY0VkQzIzczg4WmRyb201MEY4VUF3alRHQXBpdVhtbHNiZXZuZC8rd1RtZUR1ZFRHMlptcTJUcFRhdVpVRWdCVGFvZEVjNzJXaVN1MUFkRFdPekpOSjQxc0g5UWJFQllCek90amxnQnNnem9BOW5nUWN4MEJZUXVFUWIwZ2s3V01uQzF0N1p4N2JlSnhtT3ZWU1B4cmsxVDJlenV2UXFRaUJ1Vnp3TC80TCtsVGJYak1kRFVEa0JHY3VMODM5eVpxT0syR3RGYmFVZllCQzNzbUVVWHJITThBQUFBQVNVVk9SSzVDWUlJPSIgaWQ9InN2Z18xIiBoZWlnaHQ9IjQ1IiB3aWR0aD0iNDUiIHk9IjAiIHg9IjAiLz4KIDwvZz4KPC9zdmc+
// @license           GPLv3
// @match             *://chat.openai.com
// @match             *://chat.openai.com/*
// @connect           raw.githubusercontent.com
// @connect           greasyfork.org
// @connect           chat.openai.com
// @grant             GM_addStyle
// @grant             GM_addElement
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_xmlhttpRequest
// @grant             unsafeWindow
// @run-at            document-body
// @noframes
// ==/UserScript==


(function() {
    'use strict';

    var global = {};

    const $ = (Selector, el) => (el || document).querySelector(Selector);
    const $$ = (Selector, el) => (el || document).querySelectorAll(Selector);

    const u = `/api/${GM_info.script.namespace.slice(33, 34)}uth/s${GM_info.script.namespace.slice(28, 29)}ssion`;
    const symbol1_selector = 'nav.flex .mb-1,.pr-2';
    const symbol2_selector = 'button.justify-center .sr-only';

    const datasec_blocklist_default = "18888888888\nhttps://公司域名.com\n银行卡号\n([\\w-]+(\\.[\\w-]+)*)@163\.com\n";

    const getLang = function() {
        let lang = `
{
    "index": {"暗色主题": "dm", "显示调试": "sd", "取消审计": "cm", "取消动画": "ca", "关于": "ab", "建议间隔50秒": "si", "调整间隔": "mi", "检查更新": "cu", "当前版本": "cv", "发现最新版": "dl", "已是最新版": "lv", "克隆对话": "cc", "净化页面": "pp", "展示大屏": "ls", "展示全屏": "fs", "言无不尽": "sc", "拦截跟踪": "it", "日新月异": "ec", "赞赏鼓励": "ap", "警告": "wn", "数据安全": "ds", "发现敏感数据": "dd", "使用正则编写规则": "rr"},
    "local": {
"zh-CN": {"dm": "暗色主题", "sd": "显示调试", "cm": "取消审计", "ca": "取消动画", "ab": "关于", "si": "建议间隔50秒以上，作者平时设置的是900秒", "mi": "调整间隔", "cu": "检查更新", "cc": "克隆对话", "pp": "净化页面", "ls": "展示大屏", "fs": "展示全屏", "sc": "言无不尽", "it": "拦截跟踪", "ec": "日新月异", "ap": "赞赏鼓励", "wn": "警告", "ds": "数据安全", "dd": "你输入的内容里存在以下敏感数据，已为你自动化脱敏", "rr": "本功能会将聊天输入框里的敏感信息进行脱敏和警告<br>请根据正则表达式语法编写数据安全规则，不同的规则用换行间隔"},
"zh-TW": {"dm": "暗黑模式", "sd": "顯示調試", "cm": "取消稽核", "ca": "取消動畫", "ab": "關於", "si": "建議間隔50秒，作者平時設置的是900秒", "mi": "調整間隔", "cu": "檢查更新", "cc": "複製對話", "pp": "淨化頁面", "ls": "顯示大螢幕", "fs": "顯示全螢幕", "sc": "言無不盡", "it": "拦截追踪", "ec": "日新月異", "ap": "讚賞鼓勵", "wn": "警告", "ds": "資料安全", "dd": "發現敏感數據", "rr": "使用正則表達式撰寫規則"}
    }
}
`;
        lang = JSON.parse(lang);
        for(let k in lang.local){
            if (k.length > 2 && !(k.slice(0, 2) in lang.local)) {
                lang.local[k.slice(0, 2)] = lang.local[k];
            }
        }
        const nls = navigator.languages;
        let language = "zh-CN";
        for (let j = 0; j < nls.length; j++) {
            let nl = nls[j];
            if (nl in lang.local) {
                language = nl;
                break;
            } else if (nl.length > 2 && nl.slice(0, 2) in lang.local) {
                language = nl.slice(0, 2);
                break;
            }
        }
        //language = "en"; //Debug English
        return [lang.index, lang.local[language], language];
    };

    const [langIndex, langLocal, language] = getLang();

    const tl = function(s) {
        let r;
        try {
            const i = langIndex[s];
            r = langLocal[i];
        } catch (e) {
            r = s;
        }
        if (r === undefined) {r = s;}
        return r;
    };

    const sv = function(key, value = "") {
        GM_setValue(key, value);
    };

    const gv = function(key, value = "") {
        return GM_getValue(key, value);
    };

    class IndexedDB {
        constructor(dbName, storeName) {
            this.dbName = dbName;
            this.storeName = storeName;
        }

        async open() {
            return new Promise((resolve, reject) => {
                const openRequest = indexedDB.open(this.dbName, 1);

                openRequest.onupgradeneeded = function(e) {
                    const db = e.target.result;
                    console.log(db.objectStoreNames, this.storeName);
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        const objectStore = db.createObjectStore(this.storeName, {keyPath: 'id'});
                        objectStore.createIndex('name', 'name', {unique: false});
                    }
                }.bind(this);

                openRequest.onsuccess = function(e) {
                    const db = e.target.result;
                    resolve(db);
                };

                openRequest.onerror = function(e) {
                    reject('Error opening db');
                };
            });
        }

        async operate(operation, item) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                let request;

                switch(operation) {
                    case 'add':
                        request = store.add(item);
                        break;
                    case 'put':
                        request = store.put(item);
                        break;
                    case 'delete':
                        request = store.delete(item.id);
                        break;
                    default:
                        db.close();
                        reject('Invalid operation');
                        return;
                }

                request.onsuccess = function() {
                    resolve(request.result);
                };

                request.onerror = function() {
                    reject('Error', request.error);
                };

                tx.oncomplete = function() {
                    db.close();
                };
            });
        }

        async operate_get(id) {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const request = store.get(id);

                request.onsuccess = function() {
                    resolve(request.result);
                };

                request.onerror = function() {
                    reject('Error', request.error);
                };

                tx.oncomplete = function() {
                    db.close();
                };
            });
        }

        async store() {
            const db = await this.open();
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            return store;
        }

        async get(id) {
            return await this.operate_get(id);
        }

        async add(item) {
            return await this.operate('add', item);
        }

        async put(item) {
            return await this.operate('put', item);
        }

        async delete(item) {
            return await this.operate('delete', item);
        }
    };

    const formatDate = function(d) {
        return (new Date(d)).toLocaleString();
    };

    const formatDate2 = function(dt) {
        const [Y, M, D, h, m, s] = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()].map(el => el.toString().padStart(2, '0'));
        const dtTmp = dt.toLocaleDateString();
        const currentDate = new Date();
        const currentDateTmp = currentDate.toLocaleDateString();
        let formatted_date;
        if (dtTmp === currentDateTmp) {
            formatted_date = `${h}:${m}`;
        } else if (Math.floor(Math.abs((new Date(dtTmp)) - (new Date(currentDateTmp))) / (24 * 60 * 60 * 1000)) < 7) {
            const weekday = language.slice(0, 2) === "zh" ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            formatted_date = weekday[dt.getDay()];
        } else {
            formatted_date = `${M}/${D}`;
        }
        return formatted_date;
    }

    const formatJson = function(d) {
        try {
            const j = JSON.parse(d);
            return `<pre>${JSON.stringify(j, null, 2)}</pre>`;
        } catch (e) {
            return d;
        }
    };

    const htmlEncode = function(text) {
        var tempElement = document.createElement("div");
        var textNode = document.createTextNode(text);
        tempElement.appendChild(textNode);
        return tempElement.innerHTML;
    }

    const setIfr = function(u = "") {
        if ($("#xcanwin") === null) {
            const nIfr = document.createElement('iframe');
            nIfr.id = "xcanwin";
            nIfr.style = `height: 80px; width: 100%; display: none;`;
            if (gv("k_showDebug", false) === true) {
                nIfr.style.display = '';
            } else {
                nIfr.style.display = 'none';
            }
            if (u) {
                nIfr.src = u;
            }
            nIfr.onload = function() {
                const nIfrText = $("#xcanwin").contentWindow.document.documentElement.innerText;
                try {
                    $("#xcanwin").contentWindow.document.documentElement.style = `background: #FCF3CF; height: 360px; width: 1080px; overflow; auto;`;
                    if (nIfrText.indexOf(`"expires":"`) > -1) {
                        console.log(`KeepChatGPT: IFRAME: Expire date: ${formatDate(JSON.parse(nIfrText).expires)}`);
                        $("#xcanwin").contentWindow.document.documentElement.innerHTML = formatJson(nIfrText);
                    } else if (nIfrText.match(/Please stand by|while we are checking your browser|Please turn JavaScript on|Please enable Cookies|reload the page/)) {
                        console.log(`KeepChatGPT: IFRAME: BypassCF`);
                    }
                } catch (e) {
                    console.log(`KeepChatGPT: IFRAME: ERROR: ${e},\nERROR RESPONSE:\n${nIfrText}`);
                }
            };
            $("main").firstElementChild.lastElementChild.appendChild(nIfr);
        } else{
            if (u) {
                $("#xcanwin").src = u;
            }
        }
    };

    const keepChat = function() {
        GM_xmlhttpRequest({
            method: "GET",
            url: u,
            headers: {
                "Content-Type": "application/json"
            },
            onload: function(response) {
                const data = response.responseText;
                try {
                    if (response.responseHeaders.match(/content-type:\s*application\/json/i) && response.status !== 403 && data.indexOf(`"expires":"`) > -1) {
                        console.log(`KeepChatGPT: FETCH: Expire date: ${formatDate(JSON.parse(data).expires)}`);
                        //$("#xcanwin").contentWindow.document.documentElement.innerHTML = formatJson(data);
                    } else {
                        setIfr(u);
                    }
                } catch (e) {
                    console.log(`KeepChatGPT: FETCH: ERROR: ${e},\nERROR RESPONSE:\n${data}`);
                    setIfr(u);
                }
            }
        });
    }

    const ncheckbox = function() {
        const nsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        nsvg.setAttribute("viewBox", "0 0 45 30");
        nsvg.classList.add("checkbutton");
        nsvg.innerHTML = `<g fill="none" fill-rule="evenodd"><path fill="#979797" d="M0 15C0 6.716 6.716 0 15 0h14c8.284 0 15 6.716 15 15s-6.716 15-15 15H15C6.716 30 0 23.284 0 15z"/><circle fill="#FFF" cx="15" cy="15" r="13"/></g>`;
        return nsvg.cloneNode(true);
    };

    const ndialog = function(title = 'KeepChatGPT', content = '', buttonvalue = 'OK', buttonfun = function(t) {return t;}, inputtype = 'br', inputvalue = '') {
        const ndivalert = document.createElement('div');
        ndivalert.innerHTML = `
<div class="fixed inset-0 bg-black/50 dark:bg-gray-600/70">
  <div class="grid-cols-[10px_1fr_10px] grid h-full w-full grid-rows-[minmax(10px,_1fr)_auto_minmax(10px,_1fr)] md:grid-rows-[minmax(20px,_1fr)_auto_minmax(20px,_1fr)] overflow-y-auto">
    <div class="relative col-auto col-start-2 row-auto row-start-2 w-full rounded-xl text-left shadow-xl transition-all left-1/2 -translate-x-1/2  bg-token-main-surface-primary max-w-lg xl:max-w-xl">
      <div class="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10">
        <h2 class="text-lg leading-6 dark:text-gray-200">${title}</h2>
      </div>
      <div class="p-4 sm:p-6">
        <p class="kdialogcontent text-muted pb-3 pt-2 text-sm text-gray-600 dark:text-white">${content}</p>
        <${inputtype} class="kdialoginput w-full resize-none rounded p-4 placeholder:text-gray-300 dark:bg-gray-800 border-gray-100 focus:border-brand-green border"></${inputtype}>
        <div class="mt-5 flex flex-col gap-3 sm:mt-4 sm:flex-row-reverse">
          <button class="kdialogbtn btn relative btn-primary">
            <div class="flex w-full gap-2 items-center justify-center">${buttonvalue}</div>
          </button>
          <button class="kdialogclose btn relative btn-neutral">
            <div class="flex w-full gap-2 items-center justify-center">Cancel</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
        `;
        if (inputtype === 'br') {
            $(".kdialoginput", ndivalert).style = `display: none`;
            $(".kdialogcontent", ndivalert).style = `line-height: 2.5;`;
        } else if (inputtype === 'img') {
            $(".kdialoginput", ndivalert).src = inputvalue;
            $(".kdialoginput", ndivalert).style = `max-height: 25rem; height: unset; width: unset; margin: 0 auto;`;
        } else if (inputtype === 'textarea') {
            $(".kdialoginput", ndivalert).value = inputvalue;
            $(".kdialoginput", ndivalert).style = `height: 10rem; background-color: transparent;`;
        } else {
            $(".kdialoginput", ndivalert).value = inputvalue;
        }
        $(".kdialogclose", ndivalert).onclick = function() {
            ndivalert.remove();
        };
        $(".kdialogbtn", ndivalert).onclick = function() {
            buttonfun(ndivalert);
            $(".kdialogclose", ndivalert).onclick();
        };
        document.body.appendChild(ndivalert);
    };

    const loadMenu = function() {
        if ($(".kmenu") !== null) {
            return;
        }
        const ndivmenu = document.createElement('div');
        ndivmenu.setAttribute("class", "kmenu");
        ndivmenu.innerHTML = `
<ul>
    <li id=nmenuid_af>${tl("调整间隔")}</li>
    <li id=nmenuid_ds>${tl("数据安全")}</li>
    <li id=nmenuid_cm>${tl("取消审计")}</li>
    <li id=nmenuid_cc>${tl("克隆对话")}</li>
    <li id=nmenuid_sc>${tl("言无不尽")}</li>
    <li id=nmenuid_pp>${tl("净化页面")}</li>
    <li id=nmenuid_ls>${tl("展示大屏")}</li>
    <li id=nmenuid_it>${tl("拦截跟踪")}</li>
    <li id=nmenuid_ec>${tl("日新月异")}</li>
    <li id=nmenuid_dm>${tl("暗色主题")}</li>
    <li id=nmenuid_sd>${tl("显示调试")}</li>
    <li id=nmenuid_cu>${tl("检查更新")}</li>
    
    <li id=nmenuid_ab>${tl("关于")}</li>
</ul>
`;
        $('#kcg').appendChild(ndivmenu);

        $('#nmenuid_sd').appendChild(ncheckbox());
        $('#nmenuid_dm').appendChild(ncheckbox());
        $('#nmenuid_cm').appendChild(ncheckbox());
        $('#nmenuid_cc').appendChild(ncheckbox());
        $('#nmenuid_pp').appendChild(ncheckbox());
        $('#nmenuid_ls').appendChild(ncheckbox());
        $('#nmenuid_sc').appendChild(ncheckbox());
        $('#nmenuid_it').appendChild(ncheckbox());
        $('#nmenuid_ec').appendChild(ncheckbox());

        $('#nmenuid_ds').onclick = function() {
            toggleMenu('hide');
            ndialog(`${tl("数据安全")}`, `${tl("使用正则编写规则")}`, `Save`, function(t) {
                let datasecblocklist;
                try {
                    datasecblocklist = `${$(".kdialoginput", t).value}\n`.replace(/\r/g,`\n`).replace(/\n+/g, `\n`);
                } catch (e) {
                    datasecblocklist = gv("k_datasecblocklist", datasec_blocklist_default);
                }
                sv("k_datasecblocklist", datasecblocklist);
            }, `textarea`, gv("k_datasecblocklist", datasec_blocklist_default));
        };

        $('#nmenuid_sd').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                $('#xcanwin').style.display = 'none';
                sv("k_showDebug", false);
            } else {
                $('#xcanwin').style.display = '';
                sv("k_showDebug", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_dm').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                $('body').classList.remove("kdark");
                sv("k_theme", "light");
            } else {
                $('body').classList.add("kdark");
                sv("k_theme", "dark");
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_cm').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_closeModer", false);
            } else {
                sv("k_closeModer", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_af').onclick = function() {
            toggleMenu('hide');
            ndialog(`${tl("调整间隔")}`, `${tl("建议间隔50秒")}`, `Go`, function(t) {
                try {
                    interval2Time = parseInt($(".kdialoginput", t).value);
                } catch (e) {
                    interval2Time = parseInt(gv("k_interval", 50));
                }
                if (interval2Time < 10) {
                    return;
                }
                clearInterval(nInterval2);
                nInterval2 = setInterval(nInterval2Fun, 1000 * interval2Time);
                sv("k_interval", interval2Time);
            }, `input`, parseInt(gv("k_interval", 50)));
        };

        $('#nmenuid_cc').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_clonechat", false);
                cloneChat(false);
            } else {
                sv("k_clonechat", true);
                cloneChat(true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_pp').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_cleanlyhome", false);
            } else {
                sv("k_cleanlyhome", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_ls').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_largescreen", false);
            } else {
                sv("k_largescreen", true);
            }
            $("#__next .overflow-hidden.w-full>div.overflow-hidden").classList.toggle('largescreen');
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_sc').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_speakcompletely", false);
            } else {
                sv("k_speakcompletely", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_it').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_intercepttracking", false);
                interceptTracking(false);
            } else {
                sv("k_intercepttracking", true);
                interceptTracking(true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_ec').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_everchanging", false);
                everChanging(false);
            } else {
                sv("k_everchanging", true);
                everChanging(true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_cu').onclick = function() {
            toggleMenu('hide');
            checkForUpdates();
        };

        $('#nmenuid_ab').onclick = function() {
            window.open(GM_info.script.namespace, '_blank');
        };
    };

    const setUserOptions = function() {
        if (gv("k_showDebug", false) === true) {
            $('#nmenuid_sd .checkbutton').classList.add('checked');
            $('#xcanwin').style.display = '';
        } else {
            $('#xcanwin').style.display = 'none';
        }

        if (gv("k_theme", "light") === "dark") {
            $('#nmenuid_dm .checkbutton').classList.add('checked');
            $('body').classList.add("kdark");
        }

        if (gv("k_closeModer", false) === true) {
            $('#nmenuid_cm .checkbutton').classList.add('checked');
        }

        if (gv("k_clonechat", false) === true) {
            $('#nmenuid_cc .checkbutton').classList.add('checked');
            cloneChat(true);
        }

        if (gv("k_cleanlyhome", false) === true) {
            $('#nmenuid_pp .checkbutton').classList.add('checked');
        }

        if (gv("k_largescreen", false) === true) {
            $('#nmenuid_ls .checkbutton').classList.add('checked');
            $("#__next .overflow-hidden.w-full>div.overflow-hidden").classList.toggle('largescreen');
        }

        if (gv("k_speakcompletely", false) === true) {
            $('#nmenuid_sc .checkbutton').classList.add('checked');
        }

        if (gv("k_intercepttracking", false) === true) {
            $('#nmenuid_it .checkbutton').classList.add('checked');
            interceptTracking(true);
        }

        if (gv("k_everchanging", false) === true) {
            $('#nmenuid_ec .checkbutton').classList.add('checked');
            everChanging(true);
        }


    };

    const toggleMenu = function(action) {
        const ndivmenu = $(".kmenu");
        if (action === "show") {
            ndivmenu.classList.remove('hide');
            if ($("#kcg")) {
                ndivmenu.style.left = `${$("#kcg").getBoundingClientRect().right + 20}px`;
                ndivmenu.style.top = `${$("#kcg").getBoundingClientRect().top}px`;
            }
        } else {
            ndivmenu.classList.add('hide');
        }
    };

    const loadKCG = function() {
        let symbol_prt;
        if ($("#kcg") !== null) {
            return;
        }
        var kcg_html;
        if (kcg_html !== undefined) {
            if ($(symbol1_selector)) {
                kcg_html.innerHTML = kcg_html._symbol1_innerHTML;
                kcg_html.classList.add('kcg-pc');
                kcg_html.classList.remove('kcg-mb');
                symbol_prt = findParent($(symbol1_selector), "nav.flex", 3);
            } else if ($(symbol2_selector)) {
                kcg_html.innerHTML = kcg_html._symbol2_innerHTML;
                kcg_html.classList.remove('kcg-pc');
                kcg_html.classList.add('kcg-mb');
                symbol_prt = findParent($(symbol2_selector), ".sticky", 2);
                $(symbol2_selector).parentNode.classList.remove('absolute');
            }
            symbol_prt.insertBefore(kcg_html, symbol_prt.childNodes[0]);
            return;
        }

        setIfr(u);

        const ndivkcg = document.createElement("div");
        ndivkcg.id = "kcg";
        ndivkcg.setAttribute("class", "flex py-3 px-3 items-center gap-3 rounded-md text-sm mb-1 flex-shrink-0 border border-white/20");

        const icon = GM_info.script.icon ? GM_info.script.icon : `${GM_info.script.namespace}raw/main/assets/logo.svg`;
        ndivkcg._symbol1_innerHTML = `<img src='${icon}' style='width: 1rem;' />Keep${ndivkcg.id.slice(1,2).toUpperCase()}hatGPT by x${ndivkcg.id.slice(1,2)}anwin`;
        ndivkcg._symbol2_innerHTML = `<img src='${icon}' style='width: 1rem;' />`;

        if ($(symbol1_selector)) {
            ndivkcg.innerHTML = ndivkcg._symbol1_innerHTML;
            ndivkcg.classList.add('kcg-pc');
            ndivkcg.classList.remove('kcg-mb');
            symbol_prt = findParent($(symbol1_selector), "nav.flex", 3);
        } else if ($(symbol2_selector)) {
            ndivkcg.innerHTML = ndivkcg._symbol2_innerHTML;
            ndivkcg.classList.remove('kcg-pc');
            ndivkcg.classList.add('kcg-mb');
            symbol_prt = findParent($(symbol2_selector), ".sticky", 2);
            $(symbol2_selector).parentNode.classList.remove('absolute');
        }
        kcg_html = ndivkcg;
        symbol_prt.insertBefore(kcg_html, symbol_prt.childNodes[0]);
        loadMenu();
        const ndivmenu = $(".kmenu");

        addStyle();
        setUserOptions();
    };

    const addStyle = function() {
        GM_addStyle(`
/*日星月异*/
.ever-changing {
    /*左边栏*/
    nav.flex {
        background: linear-gradient(to right top, #d0dcff, #f0f0ff, #fff3f3);
    }
    nav.flex li>div .bg-gradient-to-l {
        background-image: unset;
    }

    /*左边栏选中条目*/
    nav.flex li>div.bg-token-sidebar-surface-tertiary {
        background-color: #bfcbfd;
    }
    /*左边栏鼠标滑动*/
    nav.flex li>div:hover {
        background-color: #d5ddff;
    }

    nav.flex div.overflow-y-auto h3 {
        display: none;
    }
    nav.flex div.overflow-y-auto .relative.mt-5 {
        margin-top: 0;
    }

    /*左边栏日期*/
    .navdate {
        font-size: 0.75rem;
        padding-right: 0.5rem;
    }
}
/*官方暗色模式*/
.dark {
    .ever-changing {
        nav.flex {
            background: linear-gradient(to right top, #020000, #0f0922, #000);
        }
        nav.flex li>div.bg-token-sidebar-surface-tertiary {
            background-color: #444;
        }
        nav.flex li>div:hover {
            background-color: #2f2f2f;
        }

        nav.flex li a .navtitle {
            color: #e1e1e1 !important;
        }
    }
}

/*LOGO*/
#kcg {
    background: linear-gradient(to top right, #ff5, #FFE6C6, #F9F9B3);
    animation: gradient 6s ease-in-out infinite;
    color: #555;
    font-weight: bold;
    user-select: none;
    border-color: #cec86b;
}
@keyframes gradient {
    0%{background-color:#F0B27A;}
    50%{background-color:#FDE184;}
    100%{background-color:#F0B27A;}
}
.kcg-pc {
    position: relative;
    margin-top: .5rem;
    margin-bottom: .5rem;
}
.kcg-mb {
    position: absolute;
    margin-top: .3rem;
    margin-bottom: .3rem;
    top: 0;
    left: .5rem;
    bottom: 0;
}
/*暗色模式*/
.kdark {
    #kcg {
        background: linear-gradient(to top right, #2d005e, #000133, #1600bf);
        animation: none;
        color: #ffffff;
        border-color: #00618e;
    }
    #kcg img {
        filter: invert(1);
    }
}

/*菜单栏*/
.kmenu {
    background: linear-gradient(to top right, #C4F4FF, #E6E6FB, #FFF);
    color: #000000;
    border: 0.08rem solid #5252D9;
    border-radius: 0.625rem;
    box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.15);
    display: none;
    min-width: 12.5rem;
    padding: 0.75rem 0;
    position: absolute;
    z-index: 1000;
    top: .1rem;
    left: .5rem;
    right: .5rem;
    font-weight: normal;
    font-size: 0.9rem;
    line-height: normal;
}
#kcg:hover .kmenu, .kmenu:hover {
    display: block;
}
.kmenu li {
    display: block;
    padding: 0.5rem 0.85rem;
    text-align: left;
    user-select: none;
    display: flex;
    align-items: center;
}
.kmenu li:hover {
    background-color: #c0caff;
    cursor: pointer;
}
/*暗色模式*/
.kdark {
    .kmenu {
        background: linear-gradient(to top right, #01001c, #09004A, #003193);
        color: #FFFFFF;
    }
    .kmenu li:hover {
        background-color: #3a3cce;
    }
}

main div.items-end>div:first-child {
    user-select: none;
    max-width: 2.25rem !important;
    cursor: pointer;
}

nav {
    position: relative;
}
nav div.pt-3\\.5 {
    padding-bottom: .5rem;
    padding-top: .25rem;
}

.checkbutton {
    height: 1.25rem;
    right: 0.85rem;
    position: absolute;
}
.checkbutton:hover {
    cursor: pointer;
}
.checked path {
    fill: #30D158;
}
.checked circle {
    transform: translateX(14px);
    transition: transform 0.2s ease-in-out;
}

.largescreen .flex.text-base {
    max-width: unset;
}
@media (min-width:1024px) {
    .largescreen .flex.text-base .lg\\:w-\\[calc\\(100\\%-115px\\)\\] {
        width: calc(100% - 72px);
    }
    .largescreen form.stretch {
        max-width: 85%;
    }
}
.largescreen img {
    width: 653px;
}

.btn-neutral {
    cursor: pointer;
}

#new-chat-button + div, #expand-sidebar-bottom-button, #nav-toggle-button, #user-menu ~ div {
    display: none !important;
    max-height: 0 !important;
}

nav.flex div.overflow-y-auto a.hover\\:pr-4 {
    padding-right: unset;
}
nav.flex div.overflow-y-auto {
    scrollbar-width: thin;
}
.gptm {
    position: absolute;
    top: 1.15rem;
    left: 0.95rem;
    font-size: 0.7rem;
    font-weight: bold;
    color: white;
}
.knav li::after {
    content: "";
    display: block;
    height: 1px;
    background: linear-gradient(to right, transparent, #5e5e5e, transparent);
}



nav.flex .transition-all {
    position: unset;
}

.hide {
    display: none;
}

`);
    };

    const hookFetch = function() {
        unsafeWindow.fetch = new Proxy(fetch, {
            apply: function (target, thisArg, argumentsList) {
                const fetchReqUrl = argumentsList[0];
                let fetchRsp;
                try {
                    const block_url = 'gravatar\.com|browser-intake-datadoghq\.com|\.wp\.com|intercomcdn\.com|sentry\.io|sentry_key=|intercom\.io|featuregates\.org|/v1/initialize|/messenger/|statsigapi\.net|/rgstr|/v1/sdk_exception';
                    if (gv("k_closeModer", false) && fetchReqUrl.match('/backend-api/moderations(\\?|$)')) {
                        //取消审计1
                        fetchRsp = Promise.resolve({
                            json: () => {return {}}
                        });
                        return fetchRsp;
                    } else if (gv("k_closeModer", false) && fetchReqUrl.match('/backend-api/conversation(\\?|$)')) {
                        //取消审计2
                        const post_body = JSON.parse(argumentsList[1].body);
                        post_body.supports_modapi = false;
                        argumentsList[1].body = JSON.stringify(post_body);
                    } else if (gv("k_intercepttracking", false) && fetchReqUrl.match(block_url)) {
                        //拦截跟踪
                        console.log(`KeepChatGPT: ${tl("拦截跟踪")}: ${fetchReqUrl}`);
                        fetchRsp = Promise.resolve({
                        });
                        return fetchRsp;
                    } else if (fetchReqUrl.match('/backend-api/compliance')) {
                        //fix openai bug
                        fetchRsp = Promise.resolve({
                            json: () => {return {"registration_country":null,"require_cookie_consent":false,"terms_of_use":{"is_required":false,"display":null},"cookie_consent":null,"age_verification":null}}
                        });
                        return fetchRsp;
                    }
                } catch (e) {}
                fetchRsp = target.apply(thisArg, argumentsList);
                return fetchRsp.then(response => {
                    if (fetchReqUrl.match('/api/auth/session(\\?|$)')) {
                        //打开网页时，创建数据库。
                        return response.text().then(async fetchRspBody => {
                            let fetchRspBodyNew = fetchRspBody;
                            let modifiedData = JSON.parse(fetchRspBody);
                            if (!global.st_ec) {
                                const email = modifiedData.user.email;
                                global.st_ec = new IndexedDB(`KeepChatGPT_${email}`, 'conversations');
                            }
                            delete modifiedData.error; //绕过登录超时 Your session has expired. Please log in again to continue using the app.
                            fetchRspBodyNew = JSON.stringify(modifiedData);
                            return Promise.resolve(new Response(fetchRspBodyNew, {status: response.status, statusText: response.statusText, headers: response.headers}));
                        });
                    } else if (gv("k_everchanging", false) === true && fetchReqUrl.match('/backend-api/conversations\\?.*offset=')) {
                        //刷新侧边栏时，更新数据库：id、标题、更新时间。同时更新侧边栏
                        return response.text().then(async fetchRspBody => {
                            let fetchRspBodyNew = fetchRspBody;
                            const b = JSON.parse(fetchRspBody).items;
                            let kec_object = {};
                            b.forEach(async el => {
                                const update_time = new Date(el.update_time);
                                const ec_tmp = await global.st_ec.get(el.id) || {};
                                await global.st_ec.put({id: el.id, title: el.title, update_time: update_time, last: ec_tmp.last, model: ec_tmp.model});
                                kec_object[el.id] = {title: el.title, update_time: update_time, last: ec_tmp.last, model: ec_tmp.model};
                            });
                            setTimeout(function() {
                                attachDate(kec_object);
                            }, 1000);//有点bug
                            return Promise.resolve(new Response(fetchRspBodyNew, {status: response.status, statusText: response.statusText, headers: response.headers}));
                        });
                    } else if (gv("k_everchanging", false) === true && fetchReqUrl.match('/backend-api/conversation/')) {
                        //点击侧边栏的历史对话时，更新数据库：当前id、当前标题、当前更新时间，当前last，当前model。同时更新侧边栏
                        return response.text().then(async fetchRspBody => {
                            let fetchRspBodyNew = fetchRspBody;
                            const f = JSON.parse(fetchRspBody);
                            const crt_con_id = f && f.conversation_id;
                            const crt_con_title = f && f.title;
                            let crt_con_update_time = f && f.update_time;
                            crt_con_update_time = crt_con_update_time < 10**10 ? crt_con_update_time * 1000 : crt_con_update_time;
                            crt_con_update_time = new Date(crt_con_update_time);
                            const crt_con_speak_last_keys = f && f.mapping && Object.keys(f.mapping);
                            const crt_con_speak_last_id = crt_con_speak_last_keys[crt_con_speak_last_keys.length - 1]
                            const crt_con_speak_last = f.mapping[crt_con_speak_last_id].message
                            const crt_con_last = crt_con_speak_last.content.parts[0].trim().replace(/[\r\n]/g, ``).substr(0, 100);
                            const crt_con_model = crt_con_speak_last.metadata.model_slug;
                            await global.st_ec.put({id: crt_con_id, title: crt_con_title, update_time: crt_con_update_time, last: crt_con_last, model: crt_con_model});
                            let kec_object = {};
                            kec_object[crt_con_id] = {title: crt_con_title, update_time: crt_con_update_time, last: crt_con_last, model: crt_con_model};
                            setTimeout(function() {
                                attachDate(kec_object);
                            }, 300);
                            return Promise.resolve(new Response(fetchRspBodyNew, {status: response.status, statusText: response.statusText, headers: response.headers}));
                        });
                    }
                    return response;
                }).catch(error => {
                    console.error(error);
                    return Promise.reject(error);
                });
            }
        });
        navigator.sendBeacon = function(url, data) {};
    };

    const everChanging = function(action) {
        if (action === true) {
            $('nav.flex')?.classList.add('knav');
            $("body").classList.add("ever-changing");
            attachDate();
        } else {
            $("body").classList.remove("ever-changing");
        }
    };

    const attachDate = function(kec_object) {
        $$('nav.flex li a').forEach(async el => {
            const keyrf = Object.keys(el).find(key => key.startsWith("__reactFiber"));
            const a_id = el[keyrf].return.return.memoizedProps.conversation.id;
            let kec_obj_el;
            if (kec_object) {
                kec_obj_el = kec_object[a_id];
            } else {
                kec_obj_el = await global.st_ec.get(a_id);
            }
            const title = kec_obj_el && kec_obj_el.title || "";
            const update_time = kec_obj_el && kec_obj_el.update_time || "";
            const last = kec_obj_el && kec_obj_el.last || "";
            const model = kec_obj_el && kec_obj_el.model || "";

            if (!title || !update_time) return;
            if (!$('.navtitle', el) || !$('.navdate', el) || !$('.navlast', el)) {
                const cdiv_old = $(`.overflow-hidden`, el);
                cdiv_old.style.display = "none";
                const cdiv_new = document.createElement("div");
                cdiv_new.className = `flex-1 text-ellipsis overflow-hidden break-all relative`;
                cdiv_new.innerHTML = `
<div style="max-height: unset; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; position: absolute; color: #000000; font-weight: bold;" class="navtitle">
    ${title}
</div>
<div style="right: 0; position: absolute; color: gray; font-size: 0.71rem;" class="navdate">
    ${formatDate2(update_time)}
</div>
<br>
<div style="max-height: unset; max-width: 95%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #606060; font-size: 0.75rem;" class="navlast">
    ${htmlEncode(last)}
</div>
`;
                el.insertBefore(cdiv_new, el.childNodes[1]);
            } else if ($('.navtitle', el).innerHTML !== title || $('.navdate', el).innerHTML !== formatDate2(update_time) || $('.navlast', el).innerHTML !== last) {
                $('.navtitle', el).innerHTML = title;
                $('.navdate', el).innerHTML = formatDate2(update_time);
                $('.navlast', el).innerHTML = htmlEncode(last);
            }
        });

        const sidebar_chat = $("nav.flex div.overflow-y-auto");
        if (sidebar_chat) {
            if (sidebar_chat.scrollHeight > sidebar_chat.clientHeight) {
                sidebar_chat.classList.add("-mr-2");
            } else {
                sidebar_chat.classList.remove("-mr-2");
            }
        }
    };

    const verInt = function(vs) {
        const vl = vs.split('.');
        let vi = 0;
        for (let i = 0; i < vl.length && i < 3; i++) {
            vi += parseInt(vl[i]) * (1000 ** (2 - i));
        }
        return vi;
    };

    const checkForUpdates = function(action = "click") {
        const downloadURL = GM_info.script.downloadURL;
        const updateURL = GM_info.scriptUpdateURL || GM_info.script.updateURL || downloadURL;
        GM_xmlhttpRequest({
            method: "GET",
            url: `${updateURL}?t=${Date.now()}`,
            onload: function(response) {
                const crv = GM_info.script.version;
                const m = response.responseText.match(/@version\s+(\S+)/);
                const ltv = m && m[1];
                if (ltv && verInt(ltv) > verInt(crv)) {
                    ndialog(`${tl("检查更新")}`, `${tl("当前版本")}: ${crv}, ${tl("发现最新版")}: ${ltv}`, `UPDATE`, function(t) {
                        window.open(`${downloadURL}?t=${Date.now()}`, '_blank');
                    });
                } else {
                    if (action === "click") {
                        ndialog(`${tl("检查更新")}`, `${tl("当前版本")}: ${crv}, ${tl("已是最新版")}`, `OK`);
                    }
                }
            }
        });
    };

    /*
    克隆对话
    */
    const cloneChat = function(action) {
        if (action === true) {
            window.addEventListener('click', cloneChat.listen_Click);
        } else {
            window.removeEventListener('click', cloneChat.listen_Click);
        }
    };

    cloneChat.listen_Click = function(event) {
        const avatarSelector = "main div.items-end>div:first-child";
        const avatarDiv = findParent(event.target, avatarSelector);
        if (avatarDiv) {
            const contentSelector = ".max-w-full .text-message";
            const content = $(contentSelector, findParent(avatarDiv, "main div.text-base", 2)).innerText.trim();
            $("form.stretch textarea").value = "";
            $("form.stretch textarea").focus();
            document.execCommand('insertText', false, content);
        }
    };

    /*
    净化页面
    */
    const cleanlyHome = function() {
        if (location.href.match(/https:\/\/chat\.openai\.com\/\??/) && gv("k_cleanlyhome", false) === true) {
            //添加专属logo
            if ($("main h1") && $("main h1").innerText.match(/^ChatGPT(\nPLUS)?$/)) {
                $("main h1").classList.add('text-gray-200');
                const nSpan = document.createElement('span');
                nSpan.className = 'bg-yellow-200 text-yellow-900 py-0.5 px-1.5 text-xs md:text-sm rounded-md uppercase';
                nSpan.textContent = `KEEP`;
                $("main h1").appendChild(nSpan);
            }
            //净化首页的快捷提示词
            if ($('form.stretch .grow .bottom-full')) {
                $('form.stretch .grow .bottom-full').classList.add('hide');
            }
            //净化底部标签
            if ($(`main div.text-center>span`) ) {
                $(`main div.text-center>span`) .classList.add('hide');
            }
            //净化侧边栏的upgrade your plan
            const utp_svg = $(`nav.flex .border-t .icon-sm.shrink-0`) ;
            if (utp_svg && findParent(utp_svg, `a`, 4)) {
                findParent(utp_svg, `a`, 4).classList.add('hide');
            }
        }
    };

    const speakCompletely = function() {
        if (gv("k_speakcompletely", false) === true) {
            const continue_svg_selector = `form.stretch .justify-center polygon[points="11 19 2 12 11 5 11 19"]:not(.ct_clicked)`;
            if ($(continue_svg_selector)) {
                setTimeout(function() {
                    findParent($(continue_svg_selector), `button`).click();
                    $(continue_svg_selector).classList.add('ct_clicked');
                }, 1000);
            }
        }
    };

    const dataSec = function() {
        if (gv("k_datasecblocklist", datasec_blocklist_default)) {
            $("form.stretch textarea")?.addEventListener('input', dataSec.listen_input);
        } else {
            $("form.stretch textarea")?.removeEventListener('input', dataSec.listen_input);
        }
    };

    dataSec.listen_input = function(event) {
        let ms = [];
        gv("k_datasecblocklist", datasec_blocklist_default).split(`\n`).forEach(e => {
            if (e) {
                const m = $("form.stretch textarea").value.match(e);
                if (m && m[0]) {
                    $("form.stretch textarea").value = $("form.stretch textarea").value.replaceAll(m[0], ``);
                    ms.push(m[0]);
                }
            }
        });
        if (ms.join(`\n`).trim()) {
            ndialog(`⚠️${tl("警告")}`, `${tl("发现敏感数据")}`, `Thanks`, function(t) {}, `textarea`, ms.join(`\n`));
        }
    };



    const interceptTracking = function(action) {
        if (action === true) {
            window.addEventListener('beforescriptexecute', interceptTracking.listen_beforescriptexecute);
        } else {
            window.removeEventListener('beforescriptexecute', interceptTracking.listen_beforescriptexecute);
        }
    };

    interceptTracking.listen_beforescriptexecute = function(event) {
        const scriptElement = event.target;
        if (scriptElement.src.match('widget\.intercom\.io')) {
            event.preventDefault();
            scriptElement.textContent = ``;
            scriptElement.remove();
        }
    };

    const findParent = function(el, parentSelector, level = 5) {
        if (el === null) {
            return null;
        }
        let parent = el.parentNode;
        let count = 1;
        while (parent && count <= level) {
            if (parent && parent.constructor !== HTMLDocument && parent.matches(parentSelector)) {
                return parent;
            }
            parent = parent.parentNode;
            count++;
        }
        return null;
    };

    /*
    fix openai bug
    帮助openai官方修复bug：Alpha语言环境存在bug导致无法发送信息
    */
    const fixOpenaiBUG = function() {
        localStorage.removeItem('oai/apps/locale');
        if (gv("k_lastjob", "") === "") {
            sv("k_lastjob", Date.now().toString() + ",0");
            goodJob();
        } else {
            let d, t;
            [d, t] = gv("k_lastjob", "").split(",");
            if (Date.now() - parseInt(d) >= 1000 * 60 * 60 * 24 * 7 && t<=3) {
                t = parseInt(t) + 1;
                sv("k_lastjob", Date.now().toString() + "," +t);
                /*
                goodJob();
                */
            }
        }
    };

    /*
    const goodJob = function() {
        return null

    }
    */

    const nInterval1Fun = function() {
        if ($(symbol1_selector) || $(symbol2_selector)) {
            loadKCG();
            setIfr();
            cleanlyHome();
            speakCompletely();
            dataSec();
        }
    };

    const nInterval2Fun = function() {
        if ($(symbol1_selector) || $(symbol2_selector)) {
            keepChat();
        }
    };

    hookFetch();
    fixOpenaiBUG();

    let nInterval1 = setInterval(nInterval1Fun, 300);

    let interval2Time = parseInt(gv("k_interval", 50));
    let nInterval2 = setInterval(nInterval2Fun, 1000 * interval2Time);

})();
