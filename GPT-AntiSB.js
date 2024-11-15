// ==UserScript==
// @name         GPT-AntiSB
// @namespace    https://github.com/BlueSkyXN/GPT-Models-Plus
// @version      2024.11.15
// @description  将ChatGPT相关网页的用户代理（UA）修改为iOS移动端，以解决模型降级、降智问题（如不思考、乱回答、不进行联网搜索等问题）。
// @author       BlueSkyXN
// @match        *://*.openai.com/*
// @match        *://*.chat.openai.com/*
// @match        *://*.chatgpt.com/*
// @grant        none
// @run-at       document-start
// @license      MIT
// @supportURL   https://github.com/BlueSkyXN/GPT-Models-Plus/issues
// @updateURL    https://github.com/BlueSkyXN/GPT-Models-Plus/raw/main/GPT-AntiSB.js
// @downloadURL  https://github.com/BlueSkyXN/GPT-Models-Plus/raw/main/GPT-AntiSB.js
// @icon         https://www.openai.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';
    Object.defineProperty(navigator,'platform',{get:function(){return 'iOS';}});
    Object.defineProperty(navigator,'userAgent',{get:function(){return 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1';}});
})(); 
