// ==UserScript==
// @name         Grok Helper
// @namespace    https://github.com/BlueSkyXN/GPT-Models-Plus
// @version      0.1.2
// @author       BlueSkyXN
// @description  Monitor Grok API rate limits (标3, 思考, 搜索, 深搜, 标4), show summary + detail on hover
// @match        https://grok.com/*
// @grant        GM_addStyle
// @supportURL   https://github.com/BlueSkyXN/GPT-Models-Plus
// @homepageURL  https://github.com/BlueSkyXN/GPT-Models-Plus
// @downloadURL https://github.com/BlueSkyXN/GPT-Models-Plus/blob/main/GrokHelper.js
// @updateURL https://github.com/BlueSkyXN/GPT-Models-Plus/blob/main/GrokHelper.js
// ==/UserScript==

(function() {
    'use strict';

    // 四种模式 -> 简短显示标签对应表（Grok-3）
    const MODE_LABELS = {
        DEFAULT: '标3',
        REASONING: '思考',
        DEEPSEARCH: '搜索',
        DEEPERSEARCH: '深搜'
    };

    // 我们需要查询的四种模式（Grok-3）
    const REQUEST_KINDS = Object.keys(MODE_LABELS);

    // 添加自定义样式
    GM_addStyle(`
        .grok-monitor {
            position: fixed;
            right: 16px;
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

    // 工具函数：格式化周期窗口
    function formatWindow(seconds) {
        if (typeof seconds !== 'number' || seconds <= 0) return '未知';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0 && minutes > 0) {
            return `${hours}H${minutes}M`;
        } else if (hours > 0) {
            return `${hours}H`;
        } else {
            return `${minutes}M`;
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

            // 简短名称
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

    // 添加 Grok-4 标准模式
    const grok4Row = document.createElement('div');
    grok4Row.className = 'grok-monitor-kind-row';

    const grok4NameSpan = document.createElement('span');
    grok4NameSpan.className = 'grok-monitor-kind-name';
    grok4NameSpan.textContent = '标4';

    const grok4InfoSpan = document.createElement('span');
    grok4InfoSpan.textContent = '...';

    grok4Row.appendChild(grok4NameSpan);
    grok4Row.appendChild(grok4InfoSpan);
    details.appendChild(grok4Row);

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

    // 获取每种模式的限额（支持传入模型名，默认 grok-3）
    async function fetchRateLimit(kind, modelName = "grok-3") {
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
                    modelName: modelName
                }),
                credentials: 'include'
            });

            if (response.ok) {
                return await response.json();
            } else {
                const text = await response.text().catch(() => '');
                const err = { __error: true, status: response.status, statusText: response.statusText, body: text };
                console.error('Rate limit non-OK:', kind, modelName, err);
                return err;
            }
        } catch (error) {
            console.error('Rate limit check failed:', kind, modelName, error);
            return { __error: true, status: 0, statusText: 'NETWORK', message: String(error && error.message || error) };
        }
    }

    // 一次获取所有模式数据（grok-3 全部 + grok-4 标准）
    async function getAllRateLimits() {
        const tasks = [];
        // Grok-3 四种
        for (const kind of REQUEST_KINDS) {
            tasks.push(
                fetchRateLimit(kind, 'grok-3').then(res => ({ key: `grok-3-${kind}`, res }))
            );
        }
        // Grok-4 标准
        tasks.push(
            fetchRateLimit('DEFAULT', 'grok-4').then(res => ({ key: 'grok-4-DEFAULT', res }))
        );

        const settled = await Promise.all(tasks);
        const results = {};
        settled.forEach(({ key, res }) => { results[key] = res; });
        return results;
    }

    // 更新UI
    function updateUI(results) {
        const monitor = document.querySelector('.grok-monitor');
        const sumSpan = monitor.querySelector('.grok-monitor-summary span');
        const indicator = monitor.querySelector('.grok-monitor-indicator');

        // 给指示灯加 "updating" 动画效果
        monitor.classList.add('updating');

        // 计算合计剩余次数：若有分级，仅统计 low（按固定比例 4），否则退回 remainingQueries
        let sum = 0;
        Object.values(results).forEach(data => {
            if (!data) return;
            if (data.__error) return; // 忽略错误项
            const low = data.lowEffortRateLimits?.remainingQueries ?? 0;
            if (low || data.lowEffortRateLimits || data.highEffortRateLimits) {
                sum += low > 0 ? low : 0;
            } else if (typeof data.remainingQueries === 'number') {
                sum += data.remainingQueries > 0 ? data.remainingQueries : 0;
            }
        });

        // 小版本文本：合计剩余
        sumSpan.textContent = `剩余总数: ${sum}`;

        // 指示灯颜色
        if (sum === 0) {
            indicator.style.backgroundColor = '#EF4444'; // 红色
        } else if (sum > 0 && sum < 10) {
            indicator.style.backgroundColor = '#F59E0B'; // 黄色
        } else {
            indicator.style.backgroundColor = '#10B981'; // 绿色
        }

        // 更新大版本详细数据
        const detailRows = monitor.querySelectorAll('.grok-monitor-kind-row');
        detailRows.forEach(row => {
            const label = row.querySelector('.grok-monitor-kind-name').textContent;
            const infoSpan = row.querySelector('span:nth-child(2)');

            let data = null;

            // 根据标签确定对应的数据
            if (label === '标4') {
                data = results['grok-4-DEFAULT'];
            } else {
                // 查找对应的模式
                const kind = Object.keys(MODE_LABELS).find(k => MODE_LABELS[k] === label);
                if (kind) {
                    data = results[`grok-3-${kind}`];
                }
            }

            if (!data) {
                infoSpan.textContent = '获取失败';
                return;
            }

            if (data.__error) {
                const code = typeof data.status === 'number' ? data.status : '-';
                const txt = data.statusText || 'ERROR';
                infoSpan.textContent = `失败: ${code} ${txt}`;
                return;
            }

            const low = data.lowEffortRateLimits?.remainingQueries ?? null;
            const hasTiered = (low !== null) || (data.highEffortRateLimits != null);
            const windowText = formatWindow(data.windowSizeSeconds);

            // 先尝试 tokens 的余/总（能提供总数）
            const tokenRem = typeof data.remainingTokens === 'number' ? data.remainingTokens : null;
            const tokenTot = typeof data.totalTokens === 'number' ? data.totalTokens : null;

            if (hasTiered) {
                const rem = tokenRem ?? (typeof low === 'number' ? low : null);
                const tot = tokenTot ?? (typeof data.totalQueries === 'number' ? data.totalQueries : null);
                const remText = rem !== null ? rem : '?';
                const totText = tot !== null ? tot : '?';
                infoSpan.textContent = `${remText}/${totText} (${windowText})`;
                return;
            }

            const qRem = typeof data.remainingQueries === 'number' ? data.remainingQueries : null;
            const qTot = typeof data.totalQueries === 'number' ? data.totalQueries : null;
            if (qRem !== null || qTot !== null) {
                const remText = qRem !== null ? qRem : '?';
                const totText = qTot !== null ? qTot : '?';
                infoSpan.textContent = `${remText}/${totText} (${windowText})`;
            } else {
                infoSpan.textContent = `?/?:? (${windowText})`;
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