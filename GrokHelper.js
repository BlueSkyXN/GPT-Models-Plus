// ==UserScript==
// @name         Grok Helper
// @namespace    https://github.com/BlueSkyXN/GPT-Models-Plus
// @version      1.0.0
// @author       BlueSkyXN
// @description  Monitor Grok rate limits for all models (Fast/Expert/Heavy/Auto/4Fast/4.1 + Grok-3 modes)
// @match        https://grok.com/*
// @grant        GM_addStyle
// @supportURL   https://github.com/BlueSkyXN/GPT-Models-Plus
// @homepageURL  https://github.com/BlueSkyXN/GPT-Models-Plus
// @downloadURL https://github.com/BlueSkyXN/GPT-Models-Plus/blob/main/GrokHelper.js
// @updateURL https://github.com/BlueSkyXN/GPT-Models-Plus/blob/main/GrokHelper.js
// ==/UserScript==

(function() {
    'use strict';

    // ========== 模型与查询配置 ==========

    // 所有需要查询的模型，key 用作内部标识
    // grok-3 有 4 种 requestKind，grok-4 系列只用 DEFAULT
    // 别名 modelName 与内部名等价：fast=grok-3, expert=grok-4, heavy=grok-4-heavy
    const QUERY_LIST = [
        { key: 'fast-default',    label: 'Fast',      modelName: 'fast',                             requestKind: 'DEFAULT' },
        { key: 'fast-reason',     label: 'Fast思考',   modelName: 'fast',                             requestKind: 'REASONING' },
        { key: 'fast-search',     label: 'Fast搜索',   modelName: 'fast',                             requestKind: 'DEEPSEARCH' },
        { key: 'fast-deepsearch', label: 'Fast深搜',   modelName: 'fast',                             requestKind: 'DEEPERSEARCH' },
        { key: 'expert',          label: 'Expert',     modelName: 'expert',                           requestKind: 'DEFAULT' },
        { key: 'heavy',           label: 'Heavy',      modelName: 'heavy',                            requestKind: 'DEFAULT' },
        { key: 'grok4-fast',      label: '4Fast',      modelName: 'grok-4-mini-thinking-tahoe',      requestKind: 'DEFAULT' },
        { key: 'auto',            label: 'Auto',       modelName: 'grok-4-auto',                     requestKind: 'DEFAULT' },
        { key: 'grok41',          label: 'Grok4.1',    modelName: 'grok-4-1-non-thinking-w-tool',    requestKind: 'DEFAULT' },
    ];

    // ========== 样式 ==========

    GM_addStyle(`
        .grok-monitor {
            position: fixed;
            right: 16px;
            top: 72px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 8px 12px;
            gap: 8px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #fff;
            color: #1a1a1a;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08);
            transition: all 0.2s ease;
            opacity: 0.9;
            max-height: 40px;
            overflow: hidden;
        }
        .grok-monitor:hover {
            opacity: 1;
            max-height: 600px;
        }
        .grok-monitor-summary {
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
        }
        .grok-monitor-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
            transition: background-color 0.2s ease;
        }
        .grok-monitor-details {
            display: none;
            flex-direction: column;
            gap: 4px;
            font-size: 13px;
        }
        .grok-monitor:hover .grok-monitor-details {
            display: flex;
        }
        .grok-monitor-row {
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }
        .grok-monitor-row-label {
            font-weight: 600;
            min-width: 60px;
        }
        .grok-monitor-separator {
            border: none;
            border-top: 1px dashed #ddd;
            margin: 2px 0;
            width: 100%;
        }
        .grok-monitor.updating .grok-monitor-indicator {
            animation: grok-pulse 1s ease-in-out infinite;
        }
        @keyframes grok-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
        }
        @media (prefers-color-scheme: dark) {
            .grok-monitor {
                background-color: #2b2b2b;
                color: #fff;
                border-color: #666;
            }
            .grok-monitor-separator { border-top-color: #555; }
        }
    `);

    // ========== 工具函数 ==========

    function formatWindow(seconds) {
        if (typeof seconds !== 'number' || seconds <= 0) return '?';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0 && m > 0) return `${h}H${m}M`;
        if (h > 0) return `${h}H`;
        return `${m}M`;
    }

    function formatWait(seconds) {
        if (typeof seconds !== 'number' || seconds <= 0) return '';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? ` 等${m}m${s > 0 ? s + 's' : ''}` : ` 等${s}s`;
    }

    // ========== API 请求 ==========

    async function fetchRateLimit(modelName, requestKind) {
        try {
            const resp = await fetch('/rest/rate-limits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestKind, modelName }),
                credentials: 'include'
            });
            if (resp.ok) return await resp.json();
            return { __error: true, status: resp.status };
        } catch (e) {
            return { __error: true, status: 0, message: String(e) };
        }
    }

    async function fetchAll() {
        const tasks = QUERY_LIST.map(q =>
            fetchRateLimit(q.modelName, q.requestKind).then(res => ({ key: q.key, res }))
        );
        const results = {};
        (await Promise.all(tasks)).forEach(({ key, res }) => { results[key] = res; });
        return results;
    }

    // ========== 格式化单条结果为文本 ==========

    function formatResult(data) {
        if (!data || data.__error) {
            const code = data?.status || '-';
            return `失败(${code})`;
        }

        const win = formatWindow(data.windowSizeSeconds);
        const hasHigh = data.highEffortRateLimits != null;
        const hasLow  = data.lowEffortRateLimits != null;

        // Auto 双路模式
        if (hasHigh && hasLow) {
            const hRem = data.highEffortRateLimits.remainingQueries ?? '?';
            const lRem = data.lowEffortRateLimits.remainingQueries ?? '?';
            const hWait = formatWait(data.highEffortRateLimits.waitTimeSeconds);
            const lWait = formatWait(data.lowEffortRateLimits.waitTimeSeconds);
            return `高${hRem}${hWait} 低${lRem}${lWait} (${win})`;
        }

        // 单路模式
        const rem = data.remainingQueries ?? '?';
        const tot = data.totalQueries ?? '?';
        const wait = formatWait(data.waitTimeSeconds);
        let text = `${rem}/${tot}${wait} (${win})`;
        // 部分模型额外返回 token 桶信息
        if (typeof data.remainingTokens === 'number') {
            text += ` T:${data.remainingTokens}/${data.totalTokens ?? '?'}`;
        }
        return text;
    }

    // 从结果中提取剩余可用次数（用于总数汇总）
    function extractRemaining(data) {
        if (!data || data.__error) return 0;
        if (data.highEffortRateLimits != null || data.lowEffortRateLimits != null) {
            const h = data.highEffortRateLimits?.remainingQueries ?? 0;
            const l = data.lowEffortRateLimits?.remainingQueries ?? 0;
            return Math.max(h, 0) + Math.max(l, 0);
        }
        return Math.max(data.remainingQueries ?? 0, 0);
    }

    // ========== UI ==========

    function createMonitor() {
        const monitor = document.createElement('div');
        monitor.className = 'grok-monitor';

        // 摘要行
        const summary = document.createElement('div');
        summary.className = 'grok-monitor-summary';
        const sumText = document.createElement('span');
        sumText.id = 'grok-mon-sum';
        sumText.textContent = '加载中...';
        const indicator = document.createElement('div');
        indicator.className = 'grok-monitor-indicator';
        indicator.id = 'grok-mon-ind';
        summary.appendChild(sumText);
        summary.appendChild(indicator);

        // 详情区
        const details = document.createElement('div');
        details.className = 'grok-monitor-details';

        let lastGroup = '';
        QUERY_LIST.forEach((q, i) => {
            const group = q.modelName.startsWith('grok-3') ? 'grok3' : 'grok4';
            if (lastGroup && group !== lastGroup) {
                const sep = document.createElement('hr');
                sep.className = 'grok-monitor-separator';
                details.appendChild(sep);
            }
            lastGroup = group;

            const row = document.createElement('div');
            row.className = 'grok-monitor-row';
            const labelSpan = document.createElement('span');
            labelSpan.className = 'grok-monitor-row-label';
            labelSpan.textContent = q.label;
            const infoSpan = document.createElement('span');
            infoSpan.id = `grok-mon-${q.key}`;
            infoSpan.textContent = '...';
            row.appendChild(labelSpan);
            row.appendChild(infoSpan);
            details.appendChild(row);
        });

        monitor.appendChild(summary);
        monitor.appendChild(details);
        document.body.appendChild(monitor);
    }

    function updateUI(results) {
        const sumText = document.getElementById('grok-mon-sum');
        const indicator = document.getElementById('grok-mon-ind');
        const monitor = document.querySelector('.grok-monitor');

        monitor.classList.add('updating');

        let totalRemaining = 0;

        QUERY_LIST.forEach(q => {
            const data = results[q.key];
            const el = document.getElementById(`grok-mon-${q.key}`);
            if (el) el.textContent = formatResult(data);
            totalRemaining += extractRemaining(data);
        });

        sumText.textContent = `剩余总数: ${totalRemaining}`;

        if (totalRemaining === 0) {
            indicator.style.backgroundColor = '#EF4444';
        } else if (totalRemaining < 15) {
            indicator.style.backgroundColor = '#F59E0B';
        } else {
            indicator.style.backgroundColor = '#10B981';
        }

        setTimeout(() => monitor.classList.remove('updating'), 1000);
    }

    // ========== 主循环 ==========

    async function tick() {
        const results = await fetchAll();
        updateUI(results);
    }

    function init() {
        createMonitor();
        tick();
        setInterval(tick, 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();