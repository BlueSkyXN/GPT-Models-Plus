// ==UserScript==
// @name        Claude helper
// @name:zh-CN  Claude 助手
// @version      1.1.2
// @description  ✴️1、可以导出 claude ai对话的内容。✴️2、统计当前字数 (包括粘贴、上传、article的内容，含换行符/markdown语法符号等)。✴️3、显示对话的时间、模型信息、Token用量。ℹ️显示的信息均来自网页内本身存在但未显示的属性值。✴️4、支持思考模式下的字数统计
// @author       BlueSkyXN
// @match        https://claude.ai/*
// @include      https://*claude*.com/*
// @icon         data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAgODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0iIzQ0NSIvPjxwYXRoIGQ9Im0zMyA0NC0yMy0xYy0xIDAtMi0yLTItM3MwLTEgMS0xbDI0IDItMjEtMTVjMC0xLTEtMS0xLTNzMy00IDYtMmwxNCAxMi05LTE3di0yYzAtMSAxLTUgMy01IDEgMCAzIDAgNCAxbDExIDIzIDItMjBjMC0yIDEtNCAzLTRzMyAxIDMgMmwtMyAyMCAxMi0xNGMxLTEgMy0yIDQtMSAyIDIgMiA0IDEgNkw1MSAzN2gxbDEyLTJjMy0xIDYtMiA3IDAgMSAxIDAgMyAwIDNsLTIxIDVjMTQgMSAxNSAwIDE4IDEgMiAwIDMgMiAzIDMgMCAzLTIgMy0zIDNsLTE5LTQgMTUgMTR2MWwtMiAxYy0xIDAtOS03LTE0LTExbDcgMTFjMSAxIDEgMyAwIDRzLTMgMS0zIDBMNDEgNTBjMCA3LTEgMTMtMiAxOSAwIDEtMSAxLTMgMi0xIDAtMy0xLTItM2wxLTQgMy0xNi0xMCAxMy00IDVoLTFjLTEgMC0yLTEtMi0zbDE0LTE4LTE3IDExaC00cy0xLTIgMC0zbDUtNHoiIGZpbGw9IiNENzUiLz48L3N2Zz4=
// @license      AGPL-v3.0
// @namespace    https://github.com/BlueSkyXN/GPT-Models-Plus
// @supportURL   https://github.com/BlueSkyXN/GPT-Models-Plus
// @homepageURL  https://github.com/BlueSkyXN/GPT-Models-Plus
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_download
// @noframes
// ==/UserScript==

(function() {
  // 保留原有的样式调整代码
  if(0) {
    GM_addStyle(`
      .xl\:max-w-\[48rem\] {
        width:95% !important;
        max-width:96% !important;
      }
      div.mx-auto.md:max-w-3xl {
        max-width: calc(100% - 10px);
      }
      div.mx-auto.flex {
        max-width: calc(100% - 10px);
      }
      body > div.flex.min-h-screen.w-full div.flex.flex-col div.flex.gap-2 div.mt-1.max-h-96.w-full.overflow-y-auto.break-words > div.ProseMirror.break-words{
        max-width:90%;
      }
      body > div.flex.min-h-screen.w-full > div > main > div.top-5.z-10.mx-auto.w-full.max-w-2xl.md{
        max-width:100%;
      }
      body > div.flex.min-h-screen.w-full > div > main > div.mx-auto.w-full.max-w-2xl.px-1.md {
        max-width:100%;
      }
      body > div.flex.min-h-screen.w-full > div > main.max-w-7xl {
        max-width: 90rem;
      }
      main > div.composer-parent  article > div.text-base > div.mx-auto {
        max-width: 95%;
      }
      main article > div.text-base > div.mx-auto {
        max-width: 95%;
      }
      `);
  }

  GM_addStyle(`
  div.relative.flex.w-full.overflow-x-hidden.overflow-y-scroll > div.relative.mx-auto.flex.h-full.w-full > div.flex.mx-auto.w-full > div[data-test-render-count] > div.mb-1.mt-1 > div.group.relative.inline-flex {
    border: 1px solid #dfded7;
  }
  `);

  // fix aicnn
  GM_addStyle(`
    .hidden.md\:flex { display: flex; }
    .hidden.flex-row-reverse { display: flex; }
  `);

  // 增加思考模式相关的样式调整
  GM_addStyle(`
    .thinking-highlight {
      background-color: rgba(41, 121, 255, 0.1);
      border-left: 3px solid #2979ff;
      padding-left: 8px;
      margin: 4px 0;
    }

    #claude-msg-counter {
      font-size: 12px;
      padding: 5px 7px 8px;
      margin: -3px 0px -7px;
      text-wrap: pretty;
      z-index: 6;
      line-height: 1.4;
    }

    .thinking-indicator {
      color: #2979ff;
      font-weight: bold;
    }
  `);

  // 计算对话成本的函数
  function calculateConversationCost(model, inTokens, outTokens) {
    if (!model) {
      console.warn('模型名称为空');
      return null;
    }

    const modelLower = model.toLowerCase();
    let inRate, outRate;

    if (modelLower.includes("sonnet")) {
      inRate = 3;
      outRate = 15;
    } else if (modelLower.includes("haiku")) {
      inRate = 0.8;
      outRate = 4;
    } else if (modelLower.includes("opus")) {
      inRate = 15;
      outRate = 75;
    } else {
      console.warn('未识别的模型:', model);
      return null;
    }

    const inCost = (inTokens / 1_000_000) * inRate;
    const outCost = (outTokens / 1_000_000) * outRate;
    return (inCost + outCost).toFixed(4);
  }

  // 计算完整上下文下的总输入 Token 数和总输出 Token 数
  function computeFullContextTokenUsage(inTokens, outTokens, roundCount) {
    if (roundCount <= 0) return { totalInput: 0, totalOutput: 0 };
    // 平均每轮用户输入 Token 数 (A) 与 AI 回复 Token 数 (B)
    const A = inTokens / roundCount;
    const B = outTokens / roundCount;

    // 如果使用API，每次请求都需发送所有历史消息
    // 利用等差数列求和公式计算API总输入Token：
    // 第1轮: A
    // 第2轮: 2A + B (A+A+B)
    // 第3轮: 3A + 2B (A+A+A+B+B)
    // 总输入 Token 数 = A*(1+2+...+roundCount) + B*(0+1+...+(roundCount-1))
    //                 = A * (roundCount*(roundCount+1)/2) + B * (roundCount*(roundCount-1)/2)
    const totalInput = (roundCount * (roundCount + 1) / 2) * A + (roundCount * (roundCount - 1) / 2) * B;

    // 总输出 Token 数 = roundCount * B，即所有AI回复的Token总和
    const totalOutput = roundCount * B;

    return { totalInput, totalOutput };
  }

  // model info - 获取当前模型信息
  function conversation_model() {
    let conversation = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen");
    if(!conversation) return null;

    let reactProps = Object.keys(conversation).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let conversProps = conversation[reactProps];
    if (!conversProps) return null;
    let model = conversProps.children[1]?.props?.children[0]?.props?.conversation?.model; //claude-3-7-sonnet-20250219

    return model;
  }

  // 获取对话完整信息
  function conversation_info() {
    let conversation = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen");
    if(!conversation) return null;

    let reactProps = Object.keys(conversation).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let conversProps = conversation[reactProps];
    if (!conversProps) return null;
    let info = conversProps.children[1]?.props?.children[0]?.props?.conversation;

    return info;
  }

  // 获取tokensSoFar信息
  function conversation_tokensSoFar() {
    let conversation = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen");
    if(!conversation) return null;

    let reactProps = Object.keys(conversation).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let conversProps = conversation[reactProps];
    if (!conversProps) return null;
    let tokensSoFar = conversProps.children[1]?.props?.children[0]?.props?.conversation?.tokensSoFar;

    return tokensSoFar;
  }

  // 检测思考模式是否启用
  function isThinkingModeEnabled() {
    // 检查DOM中是否存在思考模式的标识
    return !!document.querySelector('[data-thinking="true"]') ||
           !!document.querySelector('.thinking-container') ||
           !!document.querySelector('[data-is-thinking]');
  }

  // 获取思考模式类型
  function getThinkingModeType() {
    // 检查是普通思考还是扩展思考
    const extendedThinking = document.querySelector('[data-thinking-extended="true"]') ||
                           document.querySelector('.extended-thinking');
    if (extendedThinking) return "extended";
    if (isThinkingModeEnabled()) return "standard";
    return null;
  }

  // 从DOM获取思考内容
  function getThinkingContentFromDOM() {
    let thinkingContent = "";
    const thinkingElements = document.querySelectorAll('[data-thinking="true"]');

    thinkingElements.forEach(el => {
      thinkingContent += el.textContent || "";
    });

    return thinkingContent;
  }

  // 改进后的消息计数函数，支持思考模式
  function get_msg_count() {
    console.log("尝试获取消息计数...");

    let mainScreen = document.querySelector("body > div.flex.min-h-screen.w-full > div > div > div.relative.flex.w-full > div.relative.mx-auto.flex");
    if (!mainScreen) {
      console.log("找不到主屏幕元素，尝试备用选择器");
      mainScreen = document.querySelector("div.relative.flex.w-full > div.relative.mx-auto.flex");
      if (!mainScreen) return null;
    }

    let tx_cnts = 0, tx_sz = 0; // 发送计数、大小
    let rx_cnts = 0, rx_sz = 0; // 接收计数、大小
    let fp_cnts = 0, fp_sz = 0, img_cnts = 0;
    let thinking_sz = 0; // 思考内容大小

    let reactProps = Object.keys(mainScreen).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) {
      console.log("找不到React属性，尝试DOM解析方法");
      return get_msg_count_from_dom();
    }

    let msgProps = mainScreen[reactProps];

    // 尝试多种可能的路径获取消息列表
    let Msgs;
    try {
      Msgs = msgProps.children[1].props.children[0];
      if (!Msgs || !Array.isArray(Msgs)) {
        console.log("尝试其他消息路径");
        Msgs = msgProps.children[0]?.props?.children ||
              msgProps.children[1]?.props?.messages || [];
      }
    } catch (e) {
      console.error("获取消息列表出错:", e);
      return get_msg_count_from_dom();
    }

    console.log(`找到 ${Msgs.length} 条消息`);

    // 遍历处理每条消息
    Msgs.forEach(function(msg_item, index) {
      try {
        // 尝试多种可能的消息路径
        let msg;
        if (msg_item.props) {
          msg = msg_item.props.message ||
                (msg_item.props.children &&
                 msg_item.props.children[0] &&
                 msg_item.props.children[0].props &&
                 (msg_item.props.children[0].props.msg ||
                  msg_item.props.children[0].props.message));
        }

        if (!msg) {
          console.log(`跳过消息 ${index}，无法提取数据`);
          return;
        }

        // 调试输出第一条消息结构
        if (index === 0) {
          console.log("消息结构样例:", msg);
        }

        // 处理用户消息
        if (msg.sender === "human" || msg.role === "user") {
          tx_cnts += 1;

          // 处理文本内容 - 考虑多种可能的结构
          if (msg.content && Array.isArray(msg.content)) {
            msg.content.forEach(item => {
              if (typeof item === 'string') {
                tx_sz += item.length;
              } else if (item && item.text) {
                tx_sz += item.text.length;
              }
            });
          } else if (msg.text) {
            tx_sz += msg.text.length;
          } else if (msg.content && typeof msg.content === 'string') {
            tx_sz += msg.content.length;
          }

          // 处理附件
          if (msg.attachments && Array.isArray(msg.attachments)) {
            for (let i = 0; i < msg.attachments.length; i++) {
              if (msg.attachments[i].file_size) {
                tx_sz += msg.attachments[i].file_size;
                fp_cnts += 1;
                fp_sz += msg.attachments[i].file_size;
              }
            }
          }

          // 处理文件
          if (msg.files && Array.isArray(msg.files)) {
            img_cnts += msg.files.length;
          }
        }
        // 处理AI回复
        else if (msg.sender === "assistant" || msg.role === "assistant") {
          rx_cnts += 1;

          // 处理回复文本内容
          if (msg.content && Array.isArray(msg.content)) {
            msg.content.forEach(item => {
              if (typeof item === 'string') {
                rx_sz += item.length;
              } else if (item && item.text) {
                rx_sz += item.text.length;
              }
            });
          } else if (msg.text) {
            rx_sz += msg.text.length;
          } else if (msg.content && typeof msg.content === 'string') {
            rx_sz += msg.content.length;
          }

          // 处理思考内容
          if (msg.thinking_text) {
            thinking_sz += msg.thinking_text.length;
          }

          // 处理其他可能的思考内容格式
          if (msg.thinking) {
            if (typeof msg.thinking === 'string') {
              thinking_sz += msg.thinking.length;
            } else if (msg.thinking && msg.thinking.text) {
              thinking_sz += msg.thinking.text.length;
            }
          }
        }
      } catch (e) {
        console.error(`处理消息 ${index} 时出错:`, e);
      }
    });

    console.log(`统计结果: 发送=${tx_cnts}条/${tx_sz}字, 回复=${rx_cnts}条/${rx_sz}字, 思考=${thinking_sz}字`);

    // 如果发现回复数量大于0但回复大小为0，可能是思考模式导致的解析问题
    // 尝试从DOM中直接获取思考内容
    if (rx_cnts > 0 && rx_sz === 0 && isThinkingModeEnabled()) {
      console.log("检测到思考模式但无法解析回复内容，尝试从DOM获取");
      thinking_sz = getThinkingContentFromDOM().length;

      // 如果能从DOM中获取到思考内容，将其计入回复大小
      if (thinking_sz > 0) {
        rx_sz = thinking_sz;
        console.log(`从DOM获取到思考内容: ${thinking_sz}字`);
      } else {
        // 如果仍然无法获取，则尝试DOM方法
        return get_msg_count_from_dom();
      }
    }

    const thinkingType = getThinkingModeType();

    return {
      tx_cnts, tx_sz,
      rx_cnts, rx_sz,
      fp_cnts, fp_sz,
      img_cnts,
      thinking_sz,
      thinkingEnabled: isThinkingModeEnabled(),
      thinkingType: thinkingType
    };
  }

  // 备用方法：从DOM直接解析消息内容
  function get_msg_count_from_dom() {
    console.log("使用DOM解析方法获取消息...");

    // 查找消息容器
    const msgContainer = document.querySelector("div.relative.flex.w-full > div.relative.mx-auto.flex");
    if (!msgContainer) {
      console.log("找不到消息容器");
      return null;
    }

    let tx_cnts = 0, tx_sz = 0;
    let rx_cnts = 0, rx_sz = 0;
    let fp_cnts = 0, fp_sz = 0, img_cnts = 0;
    let thinking_sz = 0;

    // 查找所有消息元素
    const msgElements = msgContainer.querySelectorAll('div[data-test-render-count]');
    console.log(`从DOM找到 ${msgElements.length} 条消息元素`);

    msgElements.forEach((msgEl, index) => {
      // 判断消息类型
      const isHuman = msgEl.querySelector('[data-message-author="human"]') ||
                      msgEl.querySelector('.relative.group.inline-flex');
      const isAssistant = msgEl.querySelector('[data-message-author="assistant"]') ||
                         msgEl.querySelector('[data-is-streaming]');
      const isThinking = msgEl.querySelector('[data-thinking="true"]');

      if (isHuman) {
        tx_cnts++;
        // 获取文本内容
        const textEls = msgEl.querySelectorAll('.prose, .text-base');
        textEls.forEach(el => {
          tx_sz += el.textContent.length;
        });

        // 计算附件
        const attachments = msgEl.querySelectorAll('.attachment, [data-attachment]');
        fp_cnts += attachments.length;
        attachments.forEach(att => {
          // 尝试从属性或内容估算附件大小
          const sizeText = att.getAttribute('data-size') || att.querySelector('.file-size')?.textContent;
          if (sizeText) {
            const sizeMatch = sizeText.match(/(\d+)/);
            if (sizeMatch) {
              fp_sz += parseInt(sizeMatch[1], 10);
            }
          }
        });

        // 计算图片
        img_cnts += msgEl.querySelectorAll('img').length;
      }
      else if (isAssistant || isThinking) {
        if (isAssistant) rx_cnts++;

        // 获取回复文本内容
        const textEls = msgEl.querySelectorAll('.prose, .text-base');
        textEls.forEach(el => {
          if (!isThinking || !el.closest('[data-thinking="true"]')) {
            rx_sz += el.textContent.length;
          }
        });

        // 获取思考内容
        if (isThinking) {
          const thinkingEls = msgEl.querySelectorAll('[data-thinking="true"]');
          thinkingEls.forEach(el => {
            const thinkingText = el.textContent || "";
            thinking_sz += thinkingText.length;
          });
        }
      }
    });

    console.log(`DOM解析结果: 发送=${tx_cnts}条/${tx_sz}字, 回复=${rx_cnts}条/${rx_sz}字, 思考=${thinking_sz}字`);

    const thinkingType = getThinkingModeType();

    return {
      tx_cnts, tx_sz,
      rx_cnts, rx_sz,
      fp_cnts, fp_sz,
      img_cnts,
      thinking_sz,
      thinkingEnabled: isThinkingModeEnabled(),
      thinkingType: thinkingType
    };
  }

  // 更新消息计数显示的主函数
  function msg_counter_main() {
    let fieldset = document.querySelector("body > div.flex.min-h-screen.w-full fieldset") ||
                  document.querySelector("body > div.flex.min-h-screen.w-full > div > div > div.relative.flex.w-full> div.relative.mx-auto.flex.h-full.w-full > div.sticky.bottom-0.mx-auto.w-full");

    if (fieldset) {
      // 尝试获取消息统计
      let ret = get_msg_count();
      if (!ret) return;

      let count_result = document.querySelector("#claude-msg-counter");
      if (!count_result) {
        count_result = document.createElement("pre");
        count_result.id = "claude-msg-counter";
        count_result.className = "border-0.5 relative z-[5] text-text-200 border-accent-pro-100/20 bg-accent-pro-900 rounded-t-xl border-b-0";
        count_result.style = "font-size:12px; padding: 5px 7px 8px; margin: -3px 0px -7px; text-wrap: pretty; z-index: 6;";

        let targetParent = fieldset.querySelector("div.flex.md\\:px-2.flex-col-reverse");
        if (targetParent) {
          targetParent.insertBefore(count_result, targetParent.firstChild);
        } else if (fieldset.querySelector("div.flex.w-full.flex-col.items-center")) {
          fieldset.querySelector("div.flex.w-full.flex-col.items-center").before(count_result);
        }
      }

      let all_length = ret.tx_sz + ret.rx_sz;
      let file_info = ret.fp_cnts ? `, ${ret.fp_cnts}个附件(${ret.fp_sz}字)` : '';
      let img_info = ret.img_cnts ? `, ${ret.img_cnts}个媒体文件` : '';

      const totalToken = conversation_tokensSoFar();
      const model = conversation_model();

      // 处理Token分配，考虑思考模式的特殊情况
      let inTokens = 0, outTokens = 0;
      if (totalToken && all_length > 0) {
        // 确保不会除以零
        const divisor = Math.max(all_length, 1);

        // 如果启用了思考模式且输出统计为0但有回复
        if (ret.thinkingEnabled && ret.rx_cnts > 0 && ret.rx_sz < 10) {
          // 使用默认分配比例：通常AI输出占主要部分
          outTokens = totalToken * 0.75;
          inTokens = totalToken * 0.25;
          console.log("思考模式下使用默认Token分配比例");
        } else {
          // 正常按比例分配
          inTokens = totalToken * (ret.tx_sz / divisor);
          outTokens = totalToken * (ret.rx_sz / divisor);
        }
      }

      const conversationCost = (model && totalToken) ?
        calculateConversationCost(model, inTokens, outTokens) : null;

      // 计算完整上下文Token使用量
      const roundCount = ret.tx_cnts;
      const fullUsage = computeFullContextTokenUsage(inTokens, outTokens, roundCount);
      const totalFullCost = (model && fullUsage) ?
        calculateConversationCost(model, fullUsage.totalInput, fullUsage.totalOutput) : null;

      // 思考模式信息显示
      let thinkingInfo = '';
      if (ret.thinkingEnabled) {
        const thinkingTypeText = ret.thinkingType === "extended" ? "扩展思考" : "标准思考";
        thinkingInfo = ` <span class="thinking-indicator">[${thinkingTypeText}模式]</span>`;

        if (ret.thinking_sz > 0) {
          thinkingInfo += ` (思考过程:${ret.thinking_sz}字)`;
        }
      }

      let cost_info = conversationCost ? `|【Cost】:USD ${conversationCost}` : '';
      let model_info = model ? ` (${model})` : '';

      // 修复：使用 fullUsage.totalInput 和 fullUsage.totalOutput 而不是 inTokens 和 outTokens
      count_result.innerHTML = `【统计】已发:${ret.tx_cnts}条, ${ret.tx_sz}字${file_info}${img_info}|已回:${ret.rx_cnts}条, ${ret.rx_sz}字|合计:${all_length}字${thinkingInfo}\n【Token】:${totalToken}${cost_info}${model_info}\n【Total-Token-Input】: ${Math.round(fullUsage.totalInput)}|【Total-Token-Output】: ${Math.round(fullUsage.totalOutput)}|【TotalCost】:USD ${totalFullCost}`;
    }
  }

  // 定期更新消息计数
  setInterval(() => {
    msg_counter_main();
  }, 1600);

  // 显示消息发送时间
  function show_msg_time() {
    let mainScreen = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen");
    if(!mainScreen) return;

    const msg_divs = mainScreen.querySelectorAll("div[data-test-render-count] > div.mb-1.mt-1, div[data-test-render-count] > div > div[data-is-streaming].group");

    msg_divs.forEach(function(msg_div){
      if (msg_div.nextSibling && msg_div.nextSibling.className === 'msg-uptime') return;

      let reactProps = Object.keys(msg_div).find(key => key.startsWith('__reactProps$'));
      if (!reactProps) return;

      let divProps = msg_div[reactProps];
      let updated_at = divProps.children?.[1]?.props?.message?.updated_at ??
                      divProps.children?.[1]?.props?.children?.[2]?.props?.message?.updated_at;

      if (!updated_at) return;

      const date = new Date(updated_at);
      if (!date) return;

      const localDateStr = date.toLocaleString();
      let timeNode = document.createElement("div");
      timeNode.innerText = localDateStr;
      timeNode.className = 'msg-uptime';
      msg_div.after(timeNode);
    });
  }

  // 时间显示样式
  GM_addStyle(`
  div[data-test-render-count] > div > .msg-uptime {
     margin: 1px 5px 5px; font-size: 13px; font-weight: 300;
  }
  div[data-test-render-count] > .msg-uptime {
     margin: -2px 5px 5px; font-size: 13px; font-weight: 300;
  }
  `);

  // 定期更新消息时间显示
  setInterval(() => {
    show_msg_time();
  }, 2100);

  // 导出对话内容功能
  // 创建持久化元素的辅助函数
  function createPersistentElement(selector, createElementCallback) {
    function ensureElement() {
      const targetElement = document.querySelector(selector);
      if (targetElement) {
        if (!targetElement.querySelector('.-added-element')) {
          const newElement = createElementCallback();
          newElement.classList.add('-added-element');
          targetElement.appendChild(newElement);
        }
      }
    }

    ensureElement();
    const observer = new MutationObserver(() => {
      ensureElement();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 获取用户账户邮箱
  function get_account_email() {
    let user_menu = document.querySelector('button[data-testid="user-menu-button"][id^=radix-] > div.relative.flex.w-full.items-center');
    if(!user_menu) return '';

    let reactProps = Object.keys(user_menu).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return '';

    let __reactProps = user_menu[reactProps];
    if (!__reactProps) return '';

    let account = __reactProps.children[0]?.props?.account?.email_address || '';
    console.log(account);

    return account;
  }

  // 获取对话上下文（导出功能）
  function get_msg_context() {
    let context = "";

    let mainConversation = document.querySelector("body > div.flex.min-h-screen.w-full > div > div > div.relative.flex.w-full > div.relative.mx-auto.flex");
    if(!mainConversation) {
      console.warn("not found div")
      return null;
    }

    let tx_cnts = 0, tx_sz = 0;
    let rx_cnts = 0, rx_sz = 0;
    let fp_cnts = 0, fp_sz = 0;
    let i = 0;

    let reactProps = Object.keys(mainConversation).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) {
      console.warn("not found reactProps")
      return null;
    }

    let msgProps = mainConversation[reactProps];
    let convID = (msgProps.children[0]?.props?.conversationUuid);
    let name = (msgProps.children[1]?.props?.name) || document.title.replace('- claude', '');
    let Msgs = (msgProps.children[1].props?.children[0]);


    if (!convID || !name || !Msgs && !Msgs.length <= 0) {
      console.warn("not found Msg", convID, name, Msgs);
      return null;
    }

    const model = conversation_model();
    const token = conversation_tokensSoFar();
    const thinkingEnabled = isThinkingModeEnabled();
    const thinkingType = getThinkingModeType();

    let model_info = '';
    if (model) {
      model_info = `- model            : ${model}\n`;
    }

    let token_info = '';
    if (token) {
      token_info = `- tokensSoFar      : ${token}\n`;
    }

    let thinking_info = '';
    if (thinkingEnabled) {
      thinking_info = `- thinking mode     : ${thinkingType || "enabled"}\n`;
    }

    let time_info='';

    let time_start_str = '';
    let time_start = Msgs[0].props.message.updated_at || Msgs[0].props.message.created_at;
    if (time_start) {
      const date = new Date(time_start);
      if (date) { time_start_str = date.toLocaleString(); }
    }
    let time_last_str = '';
    let time_last = Msgs[Msgs.length-1].updated_at || Msgs[Msgs.length-1].created_at;
    if (time_last) {
      const date = new Date(time_last);
      if (date) { time_last_str = date.toLocaleString(); }
    }
    if(time_start_str && time_last_str) {
      time_info = `- time             : ${time_start_str} ~ ${time_last_str}\n`
    };

    let account_info = ''
    let account_email = get_account_email();
    if (account_email) {
      account_info = `- account          : ${account_email}\n`;
    }

    context += `# ${name}\n\n${account_info}${model_info}${token_info}${thinking_info}${time_info}- conversationUUID : ${convID}\n`;

    // 处理每条消息
    Msgs.forEach(function(msg_item){
      let msg = msg_item.props?.message || msg_item.props?.children[0]?.props.msg;

      context += `\n## ${msg.sender}:\n\n`;

      // 处理思考内容（如果有）
      if (msg.thinking_text) {
        context += `### Thinking Process:\n\n${msg.thinking_text}\n\n### Response:\n\n`;
      } else if (msg.thinking) {
        if (typeof msg.thinking === 'string') {
          context += `### Thinking Process:\n\n${msg.thinking}\n\n### Response:\n\n`;
        } else if (msg.thinking?.text) {
          context += `### Thinking Process:\n\n${msg.thinking.text}\n\n### Response:\n\n`;
        }
      }

      // 处理内容
      context += msg.text || '';

      for(i = 0; i < msg.content.length; i++) {
        context += msg.content[i].text || '';
        if (msg.content[i].input?.id) {
          context += '\n* artifacts: ' + msg.content[i].input?.id + ', title: ' + msg.content[i].input?.title + ' *\n'
          context += `\n\`\`\`${msg.content[i].input?.language}\n ${msg.content[i].input?.content}\n\`\`\`\n`;
        }
      }

      // 处理附件
      for(i = 0; i < msg.attachments.length; i++) {
        context += `\nfile: ${msg.attachments[i].file_name}\n`
        if(msg.attachments[i].extracted_content) {
          context += `\n\`\`\`file_context\n ${msg.attachments[i].extracted_content}\n\`\`\`\n`;
        }
      }

      // 处理文件
      for(i = 0; i < msg.files.length; i++) {
        context += `file: ${msg.files[i].file_name}\n`
        if(msg.files[i].preview_url) {
          context += `preview_url: ${window.location.origin + msg.files[i].preview_url}\n`;
        }
      }

      context += `\n------------------------------------------------------\n`
    });

    // 创建并触发下载
    let blob = new Blob([context], {type: 'text/plain;charset=utf-8'});
    let fileUrl = URL.createObjectURL(blob);
    let tempLink = document.createElement('a');
    tempLink.href = fileUrl;

    let fileTitle = name.replaceAll(' ','_') + ".ClaudeAI.export.md";
    tempLink.setAttribute('download', fileTitle);
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(fileUrl);

    return;
  }

  // 创建下载按钮
  function createDownloadButton() {
    const button = document.createElement("button");
    button.className = "inline-flex items-center justify-center relative shrink-0 ring-offset-2 ring-offset-bg-300 ring-accent-main-100 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none text-text-200 transition-all font-styrene active:bg-bg-400 hover:bg-bg-500/40 hover:text-text-100 h-9 w-9 rounded-md active:scale-95 shrink-0";
    button.innerHTML = `<svg width="20" height="20" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#535358" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M27 7H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/><path stroke="#535358" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 20v-8l-4 4-4-4v8m12-3.5 3.5 3.5 3.5-3.5M22.5 20v-9"/></svg>`;
    button.title="Download Conversation Markdown"
    button.addEventListener("click", () => {
      get_msg_context();
    });

    return button;
  }

  // 添加下载按钮
  createPersistentElement("body > div.flex.min-h-screen.w-full div.sticky.items-center div.right-3 div.hidden.flex-row-reverse", createDownloadButton);

})();


// 备份所有对话功能
(function() {
  function AddDownloadAllChats(){
    let user_menu = document.querySelector('button[data-testid="user-menu-button"][id^=radix-] > div.relative.flex.w-full.items-center');
    if(!user_menu) {
      setTimeout(() => AddDownloadAllChats(), 1000);
      return null;
    }

    let reactProps = Object.keys(user_menu).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let __reactProps = user_menu[reactProps];
    if (!__reactProps) return null;
    let master_id = __reactProps.children[0]?.props?.account?.memberships[0]?.organization?.uuid;
    let account = __reactProps.children[0]?.props?.account?.email_address || '';

    console.log(master_id);

    let progressWindow, progressBar, statusText, downloadButton, debugInfo;

    // 创建进度窗口
    function createProgressWindow() {
      progressWindow = document.createElement('div');
      progressWindow.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          padding: 10px;
          background: white;
          border: 1px solid #ccc;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          z-index: 99999;
        `;

      statusText = document.createElement('div');
      progressWindow.appendChild(statusText);

      progressBar = document.createElement('progress');
      progressBar.style.width = '100%';
      progressBar.max = 100;
      progressWindow.appendChild(progressBar);

      downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download TAR';
      downloadButton.style.cssText = `
            display: none;
            margin-top: 10px;
            padding: 5px 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        `;
      progressWindow.appendChild(downloadButton);

      debugInfo = document.createElement('div');
      debugInfo.style.marginTop = '10px';
      progressWindow.appendChild(debugInfo);

      document.body.appendChild(progressWindow);
    }

    // 更新进度
    function updateProgress(percent, status) {
      progressBar.value = percent;
      statusText.textContent = status;
    }

    // 更新调试信息
    function updateDebugInfo(info) {
      debugInfo.textContent = info;
      console.log('Debug:', info);
    }

    // 发起请求
    function makeRequest(url) {
      return fetch(url)
        .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
        .catch(error => {
        if (error instanceof SyntaxError) {
          throw new Error(`Failed to parse JSON: ${error}`);
        }
        throw error;
      });
    }

    // 创建TAR文件头
    function createTarHeader(filename, size) {
      const header = new Uint8Array(512);
      const encoder = new TextEncoder();

      encoder.encodeInto(filename, header.subarray(0, 100)); // File name
      encoder.encodeInto('000644 \0', header.subarray(100, 108)); // File mode (default to 644 octal)
      encoder.encodeInto('0000000 \0', header.subarray(108, 116)); // Owner's numeric user ID (default to 0)
      encoder.encodeInto('0000000 \0', header.subarray(116, 124)); // Group's numeric user ID (default to 0)
      encoder.encodeInto(size.toString(8).padStart(11, '0') + ' ', header.subarray(124, 136)); // File size in bytes (octal)
      const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + ' '; // Last modification time in numeric Unix time format (octal)
      encoder.encodeInto(mtime, header.subarray(136, 148));
      encoder.encodeInto('        ', header.subarray(148, 156)); // Checksum for header block (calculate later)
      header[156] = '0'.charCodeAt(0); // Type flag (default to '0' for normal file)
      let checksum = 0;
      for (let i = 0; i < 512; i++) {
        checksum += header[i];
      }
      encoder.encodeInto(checksum.toString(8).padStart(6, '0') + '\0 ', header.subarray(148, 156)); // Calculate and set the checksum

      return header;
    }

    // 创建TAR文件
    function createTarFile(files) {
      const chunks = [];

      for (const [filename, content] of Object.entries(files)) {
        const encoder = new TextEncoder();
        const fileContent = encoder.encode(content);
        const header = createTarHeader(filename, fileContent.length);
        chunks.push(header);
        chunks.push(fileContent);
        // Pad the file content to a multiple of 512 bytes
        const padding = 512 - (fileContent.length % 512);
        if (padding < 512) {
          chunks.push(new Uint8Array(padding));
        }
      }
      // Add two 512-byte blocks filled with zeros to mark the end of the archive
      chunks.push(new Uint8Array(1024));

      return new Blob(chunks, { type: 'application/x-tar' });
    }

    var jsonfiles = {};

    // 备份所有对话
    async function backupAllChats() {
      createProgressWindow();
      updateProgress(0, 'Fetching conversation list...');

      try {
        const conversations = await makeRequest(`/api/organizations/${master_id}/chat_conversations`);
        updateDebugInfo(`Total conversations: ${conversations.length}`);
        const totalConversations = conversations.length;

        for (let i = 0; i < conversations.length; i++) {
          const conversation = conversations[i];
          updateProgress((i / totalConversations) * 100, `Fetching conversation ${i + 1} of ${totalConversations}`);

          try {
            // 获取详细对话内容
            const detailedConversation = await makeRequest(`/api/organizations/${master_id}/chat_conversations/${conversation.uuid}?tree=True&rendering_mode=raw`);

            if (detailedConversation.chat_messages?.length == 0) {
              continue;
            }

            // 保存为JSON
            const fileContent = JSON.stringify(detailedConversation, null, 2);

            let fileName = `${conversation.name.replaceAll(' ','_').substr(0,50)}_${conversation.updated_at.substr(0,10)}`;
            fileName+='.json';

            jsonfiles[fileName] = fileContent;

            updateDebugInfo(`Added file: ${fileName}, Size: ${fileContent.length} bytes`);
          } catch (error) {
            console.error(`Error fetching conversation ${conversation.uuid}:`, error);
            updateDebugInfo(`Error fetching conversation ${conversation.uuid}: ${error}`);
          }
        }

        updateProgress(95, 'Generating Tar file...');
        updateDebugInfo('Starting Tar generation...');

        const tarBlob = createTarFile(jsonfiles);

        const sizeInKB = (tarBlob.size / (1024)).toFixed(2);
        updateDebugInfo(`Tar file size: ${sizeInKB} KB`);

        downloadButton.style.display = 'block';
        updateProgress(100, 'Click the button below to download');

        downloadButton.onclick = function() {
          const url = window.URL.createObjectURL(tarBlob);
          const a = document.createElement('a');
          a.href = url;

          const timeStr = (new Date()).toLocaleString().replace(/[\/:]/g,'-').replaceAll(' ','_');
          a.download = `ClaudeBackup_${account}_${timeStr}.tar`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          updateProgress(100, 'Download started!');
          setTimeout(() => progressWindow.remove(), 3000);
        };

      } catch (error) {
        console.error('Error:', error);
        updateProgress(100, 'Error occurred. Check console for details.');
        updateDebugInfo(`Error: ${error}`);
      }
    }

    // 注册菜单命令
    GM_registerMenuCommand("备份全部对话记录(Json格式)", backupAllChats);
  }

  setTimeout(() => AddDownloadAllChats(), 1000);

  // 将页面上的重置时间用更完整的本地时间表示
  let lastProcessedTime = '';
  const updateInterval = 2000; // 每2秒更新一次

  // 转换时间格式
  function convertTime(shortTime) {
    const now = new Date();
    const [time, period] = shortTime.split(' ');
    let [hours, minutes] = time.split(':');

    hours = parseInt(hours);

    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    if (now.getHours() > hours) {
      now.setDate(now.getDate() + 1);
    }

    now.setHours(hours);
    now.setMinutes(minutes || 0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    return now.toLocaleString();
  }

  // 更新时间显示
  function updateTime() {
    const element = document.querySelector("div.sticky div.w-full > div.items-center > div.text-danger-000 > div > div.text-sm > span");

    if (!element) return;

    const originalText = element.getAttribute('data-original-time') || element.textContent.trim();
    if (!element.hasAttribute('data-original-time')) {
      element.setAttribute('data-original-time', originalText);
    }
    if (originalText !== lastProcessedTime) {
      const fullTime = convertTime(originalText);
      element.textContent = `${originalText} (${fullTime})`;
      lastProcessedTime = originalText;
    }
  }

  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedUpdateTime = debounce(updateTime, 350);

  // 监测变化
  function checkForChanges() {
    debouncedUpdateTime();
    requestAnimationFrame(checkForChanges);
  }

  requestAnimationFrame(checkForChanges);
  setInterval(updateTime, updateInterval);
})();
