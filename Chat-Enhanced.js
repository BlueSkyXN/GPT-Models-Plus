// ==UserScript==
// @name              Chat-Enhanced
// @description       基于xcanwin/KeepChatGPT项目的优化版本，对部分功能和代码进行了增删改，遵循GPL开源协议。本脚本可以大幅度提升ChatGPT使用体验。
// @version           0.4
// @author            BlueSkyXN、xcanwin
// @namespace         https://github.com/BlueSkyXN/GPT-Models-Plus/
// @icon              data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" stroke-width="2" fill="none" stroke="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
// @license           GPLv3
// @match             *://chat.openai.com/*
// @grant             GM_addStyle
// @grant             GM_addElement
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             unsafeWindow
// @run-at            document-idle
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    var global = {};

    const $ = (Selector, el) => (el || document).querySelector(Selector);
    const $$ = (Selector, el) => (el || document).querySelectorAll(Selector);

    const u = `/api/${GM_info.script.namespace.slice(33, 34)}uth/s${GM_info.script.namespace.slice(28, 29)}ssion`;
    const symbol1_selector = 'nav.flex .transition-colors';
    const symbol2_selector = 'button.justify-center .sr-only';

    const getLang = function() {
        let lang = `
{
    "index": {"暗色主题": "dm", "显示调试": "sd", "取消审计": "cm", "取消动画": "ca", "关于": "ab", "建议间隔30秒": "si", "调整间隔": "mi", "检查更新": "cu", "当前版本": "cv", "发现最新版": "dl", "已是最新版": "lv", "克隆对话": "cc", "净化页面": "pp", "展示大屏": "ls", "展示全屏": "fs", "言无不尽": "sc", "拦截跟踪": "it", "日新月异": "ec", "项目源码": "ap"},
    "local": {
"en": {"dm": "Dark mode", "sd": "Show debugging", "cm": "Cancel audit", "ca": "Cancel animation", "ab": "About", "si": "Suggest interval of 30 seconds; The author usually sets 150", "mi": "Modify interval", "cu": "Check for updates", "cv": "Current version", "dl": "Discover the latest version", "lv": "is the latest version", "cc": "Conversation cloning", "pp": "Purified page", "ls": "Wide display mode", "fs": "Fullscreen mode", "sc": "Complete response", "it": "Intercept tracking", "ec": "More chat info", "ap": "Source CODE"},
"zh-CN": {"dm": "暗色主题", "sd": "显示调试", "cm": "取消审计", "ca": "取消动画", "ab": "关于", "si": "建议间隔30秒以上，作者平时设置的是150", "mi": "调整间隔", "cu": "检查更新", "cc": "克隆对话", "pp": "净化页面", "ls": "展示大屏", "fs": "展示全屏", "sc": "言无不尽", "it": "拦截跟踪", "ec": "日新月异", "ap": "项目源码"}
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

    const formatDate = function(d) {
        return (new Date(d)).toLocaleString();
    };

    const formatDate2 = function(datetime) {
        const Y = datetime.getFullYear();
        const M = (datetime.getMonth() + 1).toString().padStart(2, '0');
        const D = datetime.getDate().toString().padStart(2, '0');
        const h = datetime.getHours().toString().padStart(2, '0');
        const m = datetime.getMinutes().toString().padStart(2, '0');
        const currentDate = new Date();
        let formatted_date;
        if (currentDate.toISOString().split('T')[0] === (datetime).toISOString().split('T')[0]) {
            formatted_date = `${h}:${m}`;
        } else if (Math.floor(Math.abs(datetime - currentDate) / (24 * 60 * 60 * 1000)) < 6) {
            const weekday = language.slice(0, 2) === "zh" ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            formatted_date = weekday[datetime.getDay()];
        } else {
            formatted_date = `${M}-${D}`;
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
            $("main").lastElementChild.appendChild(nIfr);
        } else{
            if (u) {
                $("#xcanwin").src = u;
            }
        }
    };

    const keepChat = function() {
        fetch(u).then((response) => {
            response.text().then((data) => {
                try {
                    const contentType = response.headers.get('Content-Type');
                    if (contentType.indexOf("application/json") > -1 && response.status !== 403 && data.indexOf(`"expires":"`) > -1) {
                        console.log(`KeepChatGPT: FETCH: Expire date: ${formatDate(JSON.parse(data).expires)}`);
                        $("#xcanwin").contentWindow.document.documentElement.innerHTML = formatJson(data);
                    } else {
                        setIfr(u);
                    }
                } catch (e) {
                    console.log(`KeepChatGPT: FETCH: ERROR: ${e},\nERROR RESPONSE:\n${data}`);
                    setIfr(u);
                }
            })
        });
    }

    const ncheckbox = function() {
        const nsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        nsvg.setAttribute("viewBox", "0 0 100 30");
        nsvg.classList.add("checkbutton");
        nsvg.innerHTML = `<g fill="none" fill-rule="evenodd"><path fill="#E3E3E3" d="M0 15C0 6.716 6.716 0 15 0h14c8.284 0 15 6.716 15 15s-6.716 15-15 15H15C6.716 30 0 23.284 0 15z"/><circle fill="#FFF" cx="15" cy="15" r="13"/></g>`;
        return nsvg.cloneNode(true);
    };

    const ndialog = function(title = 'KeepChatGPT', content = '', buttonvalue = 'OK', buttonfun = function(t) {return t;}, inputtype = 'br', inputvalue = '') {
        const ndivalert = document.createElement('div');
        ndivalert.setAttribute("class", "kdialog relative z-50");
        ndivalert.innerHTML = `
<div class="fixed inset-0 bg-gray-500/90"></div>
<div class="fixed inset-0 overflow-y-auto z-50" style="display: flex; justify-content: center; align-items: center;">
  <div class="flex items-end justify-center min-h-full p-4 sm:items-center sm:p-0 text-center">
    <div class="kdialogwin bg-white dark:bg-gray-900 rounded-lg sm:max-w-lg sm:p-6 text-left">
      <div class="flex items-center justify-between">
        <div style="min-width: 15rem">
          <div class="flex items-center justify-between">
            <h3 class="dark:text-gray-200 text-gray-900 text-lg">${title}</h3>
            <p class="kdialogclose" style="cursor: pointer; font-weight: bold; color: #aaa;">X</p>
          </div>
          <p class="dark:text-gray-100 mt-2 text-gray-500 text-sm" style="margin-bottom: 0.6rem;">${content}</p>
          <div class="md:py-3 md:pl-4 border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
            <${inputtype} class="kdialoginput resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent" style="max-height: 12.5rem; height: 1.5rem; outline: none;" placeholder=""></${inputtype}>
          </div>
        </div>
      </div>
      <div class="flex sm:flex-row-reverse sm:mt-4"><button class="btn btn-neutral kdialogbtn">${buttonvalue}</button>
      </div>
    </div>
  </div>
</div>
        `;
        if (inputtype === 'br') {
            $(".kdialoginput", ndivalert).parentElement.style.display = 'none';
        } else if (inputtype === 'img') {
            $(".kdialoginput", ndivalert).src = inputvalue;
            $(".kdialoginput", ndivalert).style = `max-height: 19rem; height: unset; display: block; margin: 0 auto;`;
            $(".kdialogwin", ndivalert).style = `max-width: 37.5rem;`;
        }else {
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
    <li id=nmenuid_cm>${tl("取消审计")}</li>
    <li id=nmenuid_cc>${tl("克隆对话")}</li>
    <li id=nmenuid_sc>${tl("言无不尽")}</li>
    <li id=nmenuid_pp>${tl("净化页面")}</li>
    <li id=nmenuid_ls>${tl("展示大屏")}</li>
    <li id=nmenuid_fs>${tl("展示全屏")}</li>
    <li id=nmenuid_it>${tl("拦截跟踪")}</li>
    <li id=nmenuid_ec>${tl("日新月异")}</li>
    <li id=nmenuid_dm>${tl("暗色主题")}</li>
    <li id=nmenuid_ca>${tl("取消动画")}</li>
    <li id=nmenuid_sd>${tl("显示调试")}</li>
    <!-- <li id=nmenuid_cu>${tl("检查更新")}</li>
    <li id=nmenuid_ap>${tl("项目源码")}</li> -->
    <li id=nmenuid_ab>${tl("关于")}</li>
</ul>
`;
        document.body.appendChild(ndivmenu);

        $('#nmenuid_sd').appendChild(ncheckbox());
        $('#nmenuid_dm').appendChild(ncheckbox());
        $('#nmenuid_ca').appendChild(ncheckbox());
        $('#nmenuid_cm').appendChild(ncheckbox());
        $('#nmenuid_cc').appendChild(ncheckbox());
        $('#nmenuid_pp').appendChild(ncheckbox());
        $('#nmenuid_ls').appendChild(ncheckbox());
        $('#nmenuid_fs').appendChild(ncheckbox());
        $('#nmenuid_sc').appendChild(ncheckbox());
        $('#nmenuid_it').appendChild(ncheckbox());
        $('#nmenuid_ec').appendChild(ncheckbox());

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
                $('#kcg').style = $('#kcg').styleOrigin;
                sv("k_theme", "light");
            } else {
                $('#kcg').styleOrigin = $('#kcg').style;
                $('#kcg').style.background = "#2C3E50";
                $('#kcg').style.animation = "none";
                $('#kcg').style.color = "#ffffff";
                $('#kcg').style.marginRight = "inherit";
                sv("k_theme", "dark");
            }
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_ca').onclick = function() {
            sv("k_cancelAnimation", !$('.checkbutton', this).classList.contains('checked'));
            $('#kcg').classList.toggle('shine');
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
            ndialog(`${tl("调整间隔")}`, `${tl("建议间隔30秒")}`, `Go`, function(t) {
                try {
                    interval2Time = parseInt($(".kdialoginput", t).value);
                } catch (e) {
                    interval2Time = parseInt(gv("k_interval", 30));
                }
                if (interval2Time < 10) {
                    return;
                }
                clearInterval(nInterval2);
                nInterval2 = setInterval(nInterval2Fun, 1000 * interval2Time);
                sv("k_interval", interval2Time);
            }, `input`, parseInt(gv("k_interval", 30)));
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
            $("#__next>.overflow-hidden.w-full>div.overflow-hidden").classList.toggle('largescreen');
            $('.checkbutton', this).classList.toggle('checked');
        };

        $('#nmenuid_fs').onclick = function() {
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_fullscreen", false);
                fullScreen(false);
            } else {
                sv("k_fullscreen", true);
                fullScreen(true);
            }
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
            } else {
                sv("k_everchanging", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
            location.reload();
        };

        $('#nmenuid_cu').onclick = function() {
            toggleMenu('hide');
            checkForUpdates();
        };

        $('#nmenuid_ap').onclick = function() {
            window.open("https://github.com/BlueSkyXN/GPT-Models-Plus", '_blank');
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

        if (gv("k_theme", "light") === "light") {
            $('#kcg').styleOrigin = $('#kcg').style;
        } else {
            $('#nmenuid_dm .checkbutton').classList.add('checked');
            $('#kcg').style.background = "#2C3E50";
            $('#kcg').style.animation = "none";
            $('#kcg').style.color = "#ffffff";
            $('#kcg').style.marginRight = "inherit";
        }

        if (gv("k_cancelAnimation", false) === true) {
            $('#nmenuid_ca .checkbutton').classList.add('checked');
            $('#kcg').classList.remove('shine');
        } else {
            $('#kcg').classList.add('shine');
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
            $("#__next>.overflow-hidden.w-full>div.overflow-hidden").classList.toggle('largescreen');
        }

        if (gv("k_fullscreen", false) === true) {
            $('#nmenuid_fs .checkbutton').classList.add('checked');
            fullScreen(true);
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
        }
    };

    const toggleMenu = function(action) {
        const ndivmenu = $(".kmenu");
        if (action === "show") {
            ndivmenu.style.display = 'block';
            if ($("#kcg")) {
                ndivmenu.style.left = `${$("#kcg").getBoundingClientRect().right + 20}px`;
                ndivmenu.style.top = `${$("#kcg").getBoundingClientRect().top}px`;
            }
        } else {
            ndivmenu.style.display = 'none';
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
                symbol_prt = findParent($(symbol1_selector), "nav.flex", 3);
            } else if ($(symbol2_selector)) {
                kcg_html.innerHTML = kcg_html._symbol2_innerHTML;
                symbol_prt = findParent($(symbol2_selector), ".sticky", 2);
            }
            symbol_prt.insertBefore(kcg_html, symbol_prt.childNodes[0]);
            return;
        }

        loadMenu();
        setIfr(u);

        const ndivkcg = document.createElement("div");
        ndivkcg.id = "kcg";
        ndivkcg.setAttribute("class", "kgold shine flex py-3 px-3 items-center gap-3 rounded-md text-sm mb-1 flex-shrink-0 border border-white/20");

        const ndivmenu = $(".kmenu");
        ndivkcg.onmouseover = ndivmenu.onmouseover = function() {
            toggleMenu('show');
        };
        ndivkcg.onmouseleave = ndivmenu.onmouseleave = function() {
            toggleMenu('hide');
        };
        ndivkcg.onclick = function() {
            if (ndivmenu.style.display === 'none') {
                toggleMenu('show');
            } else {
                toggleMenu('hide');
            }
        };
        const icon = GM_info.script.icon ? GM_info.script.icon : `${GM_info.script.namespace}raw/main/assets/logo.svg`;
        //ndivkcg._symbol1_innerHTML = `<img src='${icon}' />Keep${ndivkcg.id.slice(1,2).toUpperCase()}hatGPT by x${ndivkcg.id.slice(1,2)}anwin`;
        //ndivkcg._symbol2_innerHTML = `Keep${ndivkcg.id.slice(1,2).toUpperCase()}hatGPT`;
        ndivkcg._symbol1_innerHTML = `<img src='${icon}' />${ndivkcg.id.slice(1,2).toUpperCase()}hatGPT Plus `;
        ndivkcg._symbol2_innerHTML = `${ndivkcg.id.slice(1,2).toUpperCase()}hatGPT`;
        if ($(symbol1_selector)) {
            ndivkcg.innerHTML = ndivkcg._symbol1_innerHTML;
            symbol_prt = findParent($(symbol1_selector), "nav.flex", 3);
        } else if ($(symbol2_selector)) {
            ndivkcg.innerHTML = ndivkcg._symbol2_innerHTML;
            symbol_prt = findParent($(symbol2_selector), ".sticky", 2);
        }
        kcg_html = ndivkcg;
        symbol_prt.insertBefore(kcg_html, symbol_prt.childNodes[0]);

        addStyle();
        setUserOptions();
    };

    const addStyle = function() {
        GM_addStyle(`
.kgold {
    color: #555;
    background: linear-gradient(to top right, #F0B27A, #FDE184, #F0B27A);
    animation: gradient 6s ease-in-out infinite;
    position: relative;
    overflow: hidden;
    font-weight: bold;
    user-select: none;
}
@keyframes gradient {
    0%{background-color:#F0B27A;}
    50%{background-color:#FDE184;}
    100%{background-color:#F0B27A;}
}

.shine::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        to bottom right,
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0)
    );
    transform: rotate(-45deg);
    animation: shine 2.8s linear infinite;
}
@keyframes shine {
    from {
        transform: translateX(-50%) translateY(-50%) rotate(-45deg);
    }
    to {
        transform: translateX(150%) translateY(150%) rotate(-45deg);
    }
}

.kmenu {
    background-color: #202123;
    color: #FFFFFF;
    border: 0.06rem solid #4D4D4F;
    border-radius: 0.625rem;
    box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.15);
    display: none;
    min-width: 12.5rem;
    padding: 0.75rem 0;
    position: absolute;
    z-index: 1000;
}
.kmenu::before {
    content: "";
    position: absolute;
    top: 0rem;
    bottom: 0rem;
    left: -6rem;
    right: 0rem;
    pointer-events: auto;
    z-index: -1;
}
.kmenu::after {
    content: "";
    position: absolute;
    top: 1rem;
    left: -1.25rem;
    border-style: solid;
    border-width: 0.625rem 0.625rem 0.625rem 0.625rem;
    border-color: transparent #202123 transparent transparent;
}
.kmenu li {
    display: block;
    padding: 0.5rem 1.5rem;
    text-align: left;
    user-select: none;
    display: flex;
    align-items: center;
}
.kmenu li:hover {
    background-color: #273746;
    cursor: pointer;
}

main div.items-end>div:first-child {
    user-select: none;
    max-width: 30px;
    cursor: pointer;
}

nav {
    position: relative;
}

.checkbutton {
    height: 20px;
    margin-left: auto;
    margin-right: -35px;
    padding-left: 10px;
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

.largescreen .md\\:max-w-2xl, .largescreen .lg\\:max-w-xl, .largescreen .xl\\:max-w-3xl {
    max-width: unset;
}
.largescreen .lg\\:px-0 {
    padding-left: 25px;
    padding-right: 50px;
}
@media (min-width:1024px) {
    .largescreen form.stretch {
        max-width: 85%;
    }
}
.largescreen div.items-end>div.text-xs {
    top: -20px;
    left: -5px;
    margin-left: unset;
    -webkit-transform: unset;
    transform: unset;
    position: absolute;
}

.fullscreen {
    max-width: 0px;
}
.btn-neutral {
    cursor: pointer;
}

#new-chat-button + div, #expand-sidebar-bottom-button, #nav-toggle-button, #user-menu ~ div {
    display: none !important;
    max-height: 0 !important;
}

.navdate {
    font-size: 0.75rem;
    padding-right: 0.5rem;
}
nav.flex div.overflow-y-auto a.hover\\:pr-4 {
    padding-right: unset;
}
nav.flex div.overflow-y-auto{
    scrollbar-width: thin;
}

#nmenuid_ap {
    color: #00bf78;
}
`);
    };

    const hookFetch = function() {
        unsafeWindow.fetch = new Proxy(fetch, {
            apply: function (target, thisArg, argumentsList) {
                const fetchReqUrl = argumentsList[0];
                let fetchRsp;
                try {
                    if (gv("k_closeModer", false) && fetchReqUrl.match('/backend-api/moderations(\\?|$)')) {
                        fetchRsp = Promise.resolve({
                            json: () => {return {}}
                        });
                        return fetchRsp;
                    } else if (gv("k_closeModer", false) && fetchReqUrl.match('/backend-api/conversation(\\?|$)')) {
                        const post_body = JSON.parse(argumentsList[1].body);
                        post_body.supports_modapi = false;
                        argumentsList[1].body = JSON.stringify(post_body);
                    } else if (gv("k_intercepttracking", false) && fetchReqUrl.match('sentry\.io|sentry_key=|widget\.intercom\.io|featuregates\.org|/v1/initialize|api-iam\.intercom\.io|/messenger/|nexus-websocket-a\.intercom\.io|statsigapi\.net|/rgstr|/v1/sdk_exception')) {
                        fetchRsp = Promise.resolve({
                        });
                        return fetchRsp;
                    }
                } catch (e) {}
                fetchRsp = target.apply(thisArg, argumentsList);
                fetchRsp.then(response => {
                    let clonedResponse = response.clone();
                    clonedResponse.text().then(fetchRspBody => {
                        const fetchRspHeaders = clonedResponse.headers;
                        if (gv("k_everchanging", false) && fetchReqUrl.match('/backend-api/conversations\\?.*offset=')) {
                            const b = JSON.parse(fetchRspBody).items;
                            if (!global.kec_object) global.kec_object = {};
                            b.forEach(el => {
                                const update_time = new Date(el.update_time);
                                if (global.kec_object[el.id] && global.kec_object[el.id].date && global.kec_object[el.id].update_time >= update_time) return;
                                global.kec_object[el.id] = {};
                                global.kec_object[el.id].title = el.title;
                                global.kec_object[el.id].update_time = update_time;
                            });
                            setTimeout(function() {
                                attachDate();
                            }, 300);
                        }
                    });
                    return clonedResponse;
                }).catch(error => {});
                return fetchRsp;
            }
        });
        navigator.sendBeacon = function(url, data) {};
    };

    const everChanging = function() {
        if (!$('.navdate')) {
            attachDate();
        }
    };

    const attachDate = function() {
        if (!global.kec_object) return;
        $$('nav.flex li a.group').forEach(el => {
            const keyrf = Object.keys(el).find(key => key.startsWith("__reactFiber"));
            const a_id = el[keyrf].return.return.memoizedProps.id;
            const title = global.kec_object[a_id].title || "";
            const update_time = global.kec_object[a_id].update_time || "";
            if (!title || !update_time) return;
            if ($('.navtitle', el) && $('.navdate', el)) {
                $('.navtitle', el).innerHTML = title;
                $('.navdate', el).innerHTML = formatDate2(update_time);
            } else {
                const cdiv_old = $(`.overflow-hidden`, el);
                cdiv_old.style.display = "none";
                const cdiv_new = document.createElement("div");
                cdiv_new.className = `flex-1 text-ellipsis overflow-hidden break-all relative`;
                cdiv_new.innerHTML = `
<div style="max-height: unset; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; position: absolute;" class="navtitle">
    ${title}
</div>
<div style="right: 0;position: absolute;color: grey;font-size: 0.75rem;" class="navdate">
    ${formatDate2(update_time)}
</div>
<br>
<div style="max-height: unset; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: gray; font-size: 0.75rem;">
</div>
`;
                el.insertBefore(cdiv_new, el.childNodes[1]);
            }
        });
        $$(`nav.flex div.overflow-y-auto h3`).forEach(el => {
            el.remove();
        });
        const sidebar_chat = $("nav.flex div.overflow-y-auto");
        if (sidebar_chat.scrollHeight > sidebar_chat.clientHeight) {
            sidebar_chat.classList.add("-mr-2");
        } else {
            sidebar_chat.classList.remove("-mr-2");
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

    const checkForUpdates = function() {
        const updateURL = "https://github.com/BlueSkyXN/GPT-Models-Plus";
        ndialog(`${tl("检查更新")}`, "", `UPDATE`, function(t) {
            window.open(updateURL, '_blank');
        });
    };


    const cloneChat = function(action) {
        if (action === true) {
            window.addEventListener('click', cloneChat.listen_Click);
        } else {
            window.removeEventListener('click', cloneChat.listen_Click);
        }
    };

    cloneChat.listen_Click = function(event) {
        const avatarSelector = "main div.items-end>div:first-child";
        let avatarDiv;
        if (event.target.matches(avatarSelector)) {
            avatarDiv = event.target;
        } else {
            avatarDiv = findParent(event.target, avatarSelector);
        }
        if (avatarDiv) {
            if ($('text', avatarDiv) && $('text', avatarDiv).innerHTML === "ChatGPT") {
                $('text', avatarDiv).remove();
            }
            const content = findParent(avatarDiv, "div.text-base", 2).innerText.trim();
            $("form.stretch textarea").value = "";
            $("form.stretch textarea").focus();
            document.execCommand('insertText', false, content);
        }
    };

    const cleanlyHome = function() {
        if (location.href.match(/https:\/\/chat\.openai\.com\/\??/) && gv("k_cleanlyhome", false) === true) {
            if ($("main h1") && $("main h1").innerText.match(/^ChatGPT(\nPLUS)?$/)) {
                $("main h1").classList.add('text-gray-200');
                const nSpan = document.createElement('span');
                nSpan.className = 'bg-yellow-200 text-yellow-900 py-0.5 px-1.5 text-xs md:text-sm rounded-md uppercase';
                nSpan.textContent = `KEEP`;
                $("main h1").appendChild(nSpan);
            }
            if ($("main h2") && $("main h2").innerText === "Examples") {
                $("main h2").parentElement.parentElement.remove();
            }
            const mainBottom = $("div>span", $("form.stretch").parentElement);
            if (mainBottom && mainBottom.innerText.indexOf("produce inaccurate") > -1) {
                mainBottom.remove();
            }
            const utp_svg = $(`nav.flex path[d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"]`);
            if (utp_svg && findParent(utp_svg, `a`, 4)) {
                findParent(utp_svg, `a`, 4).remove();
            }
        }
    };

    const fullScreen = function(action) {
        if (action === true) {
            if ($("#kfull") === null || $('#kfull').style.display === "none") {
                const ndivkfull = document.createElement("div");
                ndivkfull.id = "kfull";
                ndivkfull.setAttribute("class", "btn relative btn-neutral border-0 md:border");
                ndivkfull.innerHTML = `KEEP`;
                ndivkfull.onclick = function() {
                    sv("k_fullscreen", false);
                    fullScreen(false);
                    $('#nmenuid_fs .checkbutton').classList.toggle('checked');
                };
                const symbol3_selector = `form.stretch .justify-center`;
                let nInterval3 = setInterval(() => {
                    if ($(symbol3_selector) && $(symbol2_selector) === null) {
                        if ($("#kfull") === null) {
                            $(symbol3_selector).insertBefore(ndivkfull, $(symbol3_selector).childNodes[0]);
                        } else if ($('#kfull') && $('#kfull').style.display === "none") {
                            $('#kfull').style.display = '';
                        }
                        $("#__next>.overflow-hidden.w-full>div.overflow-x-hidden").classList.add('fullscreen');
                        clearInterval(nInterval3);
                    }
                }, 300);
            }
        } else {
            if ($('#kfull') && $('#kfull').style.display === "") {
                $('#kfull').style.display = 'none';
            }
            if ($("#__next>.overflow-hidden.w-full>div.overflow-x-hidden")) {
                $("#__next>.overflow-hidden.w-full>div.overflow-x-hidden").classList.remove('fullscreen');
            }
        }
    };

    const speakCompletely = function() {
        if (gv("k_speakcompletely", false) === true) {
            const continue_svg_selector = `form.stretch .justify-center polygon[points="11 19 2 12 11 5 11 19"]`;
            if ($(continue_svg_selector)) {
                findParent($(continue_svg_selector), `button`).click();
            }
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

    $("body").onresize = function() {
        if ($('#nmenuid_fs .checkbutton')) {
            if (gv("k_fullscreen", false) === true) {
                $('#nmenuid_fs .checkbutton').classList.add('checked');
                fullScreen(true);
            } else if (gv("k_fullscreen", false) === false) {
                $('#nmenuid_fs .checkbutton').classList.remove('checked');
                fullScreen(false);
            }
        }
    };

    const nInterval1Fun = function() {
        if ($(symbol1_selector) || $(symbol2_selector)) {
            loadKCG();
            setIfr();
            cleanlyHome();
            speakCompletely();
            everChanging();
        }
    };

    const nInterval2Fun = function() {
        if ($(symbol1_selector) || $(symbol2_selector)) {
            keepChat();
        }
    };

    hookFetch();

    let nInterval1 = setInterval(nInterval1Fun, 300);

    let interval2Time = parseInt(gv("k_interval", 30));
    let nInterval2 = setInterval(nInterval2Fun, 1000 * interval2Time);

})();