// ==UserScript==
// @name         Grok Helper
// @namespace    https://github.com/BlueSkyXN/GPT-Models-Plus
// @version      0.1.1
// @author       BlueSkyXN
// @description  Monitor Grok API rate limits (DEFAULT, REASONING, DEEPSEARCH, DEEPERSEARCH), show summary + detail on hover
// @match        https://grok.com/*
// @grant        GM_addStyle
// @supportURL   https://github.com/BlueSkyXN/GPT-Models-Plus
// @homepageURL  https://github.com/BlueSkyXN/GPT-Models-Plus
// @downloadURL https://github.com/BlueSkyXN/GPT-Models-Plus/blob/main/GrokHelper.js
// @updateURL https://github.com/BlueSkyXN/GPT-Models-Plus/blob/main/GrokHelper.js
// ==/UserScript==

(function() {
    'use strict';

    // 四种模式 -> 中文名称对应表
    const MODE_LABELS = {
        DEFAULT: '标准',
        REASONING: '思考',
        DEEPSEARCH: '深度',
        DEEPERSEARCH: '更深'
    };

    // 我们需要查询的四种模式
    const REQUEST_KINDS = Object.keys(MODE_LABELS);

    // 添加自定义样式
    GM_addStyle(`
        .grok-monitor {
            position: fixed;
            left: 16px;
            top: 72px; /* 位于 logo 下方 */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 8px 12px;
            gap: 8px;
            border: 1px solid #ccc;          /* 灰色圆角线始终显示 */
            border-radius: 8px;
            background-color: #fff;          /* 背景白色，可按需改 */
            color: #1a1a1a;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08); /* 轻微投影，可选 */
            transition: all 0.2s ease;
            opacity: 0.9;
        }

        /* 悬浮时增加不透明度 */
        .grok-monitor:hover {
            opacity: 1;
        }

        /* 小版本：只显示总结行 */
        .grok-monitor-summary {
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            font-weight: 500;
            font-size: 14px;
        }

        /* 指示灯 */
        .grok-monitor-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
            transition: background-color 0.2s ease;
        }

        /* 大版本：详细行，默认隐藏，悬浮时显示 */
        .grok-monitor-details {
            display: none;        /* 默认隐藏 */
            flex-direction: column;
            gap: 4px;
            font-size: 13px;
        }

        /* 悬浮时让 details 显示 */
        .grok-monitor:hover .grok-monitor-details {
            display: flex;
        }

        .grok-monitor-kind-row {
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .grok-monitor-kind-name {
            font-weight: 600;
        }

        /* 更新动画（请求中时可以使用） */
        .grok-monitor.updating .grok-monitor-indicator {
            animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.7;
            }
        }

        /* 深色模式下可自行调整 */
        @media (prefers-color-scheme: dark) {
            .grok-monitor {
                background-color: #2b2b2b;
                color: #fff;
                border-color: #666;
            }
        }
    `);

    // 工具函数：格式化等待时间
    function formatWaitTime(seconds) {
        if (seconds <= 0) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0 && minutes > 0) {
            return `${hours}h${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${minutes}m`;
        }
    }

    // 创建监控器UI
    function createMonitor() {
        const monitor = document.createElement('div');
        monitor.className = 'grok-monitor';

        // ---- 小版本（默认显示） ----
        const summaryRow = document.createElement('div');
        summaryRow.className = 'grok-monitor-summary';

        // 剩余次数总和文本
        const sumSpan = document.createElement('span');
        sumSpan.textContent = '剩余总数: ...';

        // 指示灯
        const indicator = document.createElement('div');
        indicator.className = 'grok-monitor-indicator';

        summaryRow.appendChild(sumSpan);
        summaryRow.appendChild(indicator);

        // ---- 大版本（悬浮后展开） ----
        const details = document.createElement('div');
        details.className = 'grok-monitor-details';

        // 为每种模式添加一行
        REQUEST_KINDS.forEach(kind => {
            const row = document.createElement('div');
            row.className = 'grok-monitor-kind-row';

            // 中文名称
            const nameSpan = document.createElement('span');
            nameSpan.className = 'grok-monitor-kind-name';
            nameSpan.textContent = MODE_LABELS[kind];

            // 剩余/等待 文本
            const infoSpan = document.createElement('span');
            infoSpan.textContent = '...';

            row.appendChild(nameSpan);
            row.appendChild(infoSpan);
            details.appendChild(row);
        });

        // 组装
        monitor.appendChild(summaryRow);
        monitor.appendChild(details);

        document.body.appendChild(monitor);
        return monitor;
    }

    // 获取当前域名的基础URL
    function getBaseUrl() {
        return window.location.origin;
    }

    // 获取每种模式的限额
    async function fetchRateLimit(kind) {
        try {
            // 使用动态的基础URL
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/rest/rate-limits`, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    requestKind: kind,
                    modelName: "grok-3"
                }),
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Failed to fetch ${kind} rate limit`);
            }
        } catch (error) {
            console.error('Rate limit check failed:', error);
            return null;
        }
    }

    // 一次获取所有模式数据
    async function getAllRateLimits() {
        const results = {};
        for (const kind of REQUEST_KINDS) {
            // 可改成 Promise.all 并行请求，这里顺序也行
            results[kind] = await fetchRateLimit(kind);
        }
        return results;
    }

    // 更新UI
    function updateUI(results) {
        const monitor = document.querySelector('.grok-monitor');
        const sumSpan = monitor.querySelector('.grok-monitor-summary span');
        const indicator = monitor.querySelector('.grok-monitor-indicator');

        // 给指示灯加 "updating" 动画效果
        monitor.classList.add('updating');

        // 计算合计剩余次数
        let sum = 0;
        REQUEST_KINDS.forEach(kind => {
            const data = results[kind];
            if (data && data.remainingQueries > 0) {
                sum += data.remainingQueries;
            }
        });

        // 小版本文本：合计剩余
        sumSpan.textContent = `剩余总数: ${sum}`;

        // 指示灯颜色
        if (sum === 0) {
            indicator.style.backgroundColor = '#EF4444'; // 红色
        } else if (sum > 0 && sum < 5) {
            indicator.style.backgroundColor = '#F59E0B'; // 黄色
        } else {
            indicator.style.backgroundColor = '#10B981'; // 绿色
        }

        // 更新大版本详细数据
        const detailRows = monitor.querySelectorAll('.grok-monitor-kind-row');
        detailRows.forEach(row => {
            const label = row.querySelector('.grok-monitor-kind-name').textContent;
            const kind = Object.keys(MODE_LABELS).find(k => MODE_LABELS[k] === label);
            const data = results[kind];
            const infoSpan = row.querySelector('span:nth-child(2)');

            if (!data) {
                infoSpan.textContent = '获取失败';
                return;
            }

            const { remainingQueries, waitTimeSeconds } = data;
            if (remainingQueries > 0) {
                infoSpan.textContent = `剩余: ${remainingQueries}`;
            } else {
                infoSpan.textContent = `等待: ${formatWaitTime(waitTimeSeconds)}`;
            }
        });

        // 1s 后移除更新动画
        setTimeout(() => monitor.classList.remove('updating'), 1000);
    }

    // 定时检查
    async function checkRateLimits() {
        const results = await getAllRateLimits();
        updateUI(results);
    }

    // 初始化
    function init() {
        createMonitor();
        checkRateLimits(); // 立即检查一次
        setInterval(checkRateLimits, 30000); // 每 30s 检查
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();