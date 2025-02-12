// ==UserScript==
// @name        Claude helper (对话导出\字数统计\时间显示)
// @name:zh-CN  Claude 助手 (对话导出\字数统计\时间显示)
// @version      0.6.8
// @description  ✴️1、可以导出 claude ai对话的内容。✴️2、统计当前字数 (包括粘贴、上传、article的内容，含换行符/markdown语法符号等)。✴️3、显示对话的时间、模型信息、Token用量。ℹ️显示的信息均来自网页内本身存在但未显示的属性值。
// @author       Yearly
// @match        https://claude.ai/*
// @include      https://*claude*.com/*
// @match        https://chat.kelaode.ai/*
// @match        https://lobe.aicnn.xyz/*
// @match        https://claude.asia/*
// @include      https://*claude*.cc/*
// @icon         data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAgODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0iIzQ0NSIvPjxwYXRoIGQ9Im0zMyA0NC0yMy0xYy0xIDAtMi0yLTItM3MwLTEgMS0xbDI0IDItMjEtMTVjMC0xLTEtMS0xLTNzMy00IDYtMmwxNCAxMi05LTE3di0yYzAtMSAxLTUgMy01IDEgMCAzIDAgNCAxbDExIDIzIDItMjBjMC0yIDEtNCAzLTRzMyAxIDMgMmwtMyAyMCAxMi0xNGMxLTEgMy0yIDQtMSAyIDIgMiA0IDEgNkw1MSAzN2gxbDEyLTJjMy0xIDYtMiA3IDAgMSAxIDAgMyAwIDNsLTIxIDVjMTQgMSAxNSAwIDE4IDEgMiAwIDMgMiAzIDMgMCAzLTIgMy0zIDNsLTE5LTQgMTUgMTR2MWwtMiAxYy0xIDAtOS03LTE0LTExbDcgMTFjMSAxIDEgMyAwIDRzLTMgMS0zIDBMNDEgNTBjMCA3LTEgMTMtMiAxOSAwIDEtMSAxLTMgMi0xIDAtMy0xLTItM2wxLTQgMy0xNi0xMCAxMy00IDVoLTFjLTEgMC0yLTEtMi0zbDE0LTE4LTE3IDExaC00cy0xLTIgMC0zbDUtNHoiIGZpbGw9IiNENzUiLz48L3N2Zz4=
// @license      AGPL-v3.0
// @namespace    https://greasyfork.org/zh-CN/scripts/502829-claude-helper
// @supportURL   https://greasyfork.org/zh-CN/scripts/502829-claude-helper
// @homepageURL  https://greasyfork.org/zh-CN/scripts/502829-claude-helper
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_download
// @noframes
// @downloadURL https://update.greasyfork.org/scripts/502829/Claude%20helper%20%28%E5%AF%B9%E8%AF%9D%E5%AF%BC%E5%87%BA%5C%E5%AD%97%E6%95%B0%E7%BB%9F%E8%AE%A1%5C%E6%97%B6%E9%97%B4%E6%98%BE%E7%A4%BA%29.user.js
// @updateURL https://update.greasyfork.org/scripts/502829/Claude%20helper%20%28%E5%AF%B9%E8%AF%9D%E5%AF%BC%E5%87%BA%5C%E5%AD%97%E6%95%B0%E7%BB%9F%E8%AE%A1%5C%E6%97%B6%E9%97%B4%E6%98%BE%E7%A4%BA%29.meta.js
// ==/UserScript==

(function() {

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

  // model info
  function conversation_model() {
    let conversation = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen") ;
    if(!conversation) return null;

    let reactProps = Object.keys(conversation).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let conversProps = conversation[reactProps];
    if (!conversProps) return null;
    let model = conversProps.children[1]?.props?.children[0]?.props?.conversation?.model; //claude-3-5-sonnet-20240620

    return model;
  }

  // model info
  function conversation_info() {
    let conversation = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen") ;
    if(!conversation) return null;

    let reactProps = Object.keys(conversation).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let conversProps = conversation[reactProps];
    if (!conversProps) return null;
    let info = conversProps.children[1]?.props?.children[0]?.props?.conversation; //claude-3-5-sonnet-20240620

    return info;
  }

  // tokensSoFar
  function conversation_tokensSoFar() {
    let conversation = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen") ;
    if(!conversation) return null;

    let reactProps = Object.keys(conversation).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let conversProps = conversation[reactProps];
    if (!conversProps) return null;
    let tokensSoFar = conversProps.children[1]?.props?.children[0]?.props?.conversation?.tokensSoFar;

    return tokensSoFar;
  }

  // msg count
  var last_uuid = '', last_length = 0;
  function get_msg_count() {
    let mainScreen = document.querySelector("body > div.flex.min-h-screen.w-full > div > div > div.relative.flex.w-full > div.relative.mx-auto.flex");
    if(!mainScreen) return;

    let tx_cnts = 0, tx_sz = 0;
    let rx_cnts = 0, rx_sz = 0;
    let fp_cnts = 0, fp_sz = 0, img_cnts = 0;
    let i = 0;

    let reactProps = Object.keys(mainScreen).find(key => key.startsWith('__reactProps$'));
    if (!reactProps) return null;

    let msgProps = mainScreen[reactProps];

    let Msgs = (msgProps.children[1].props.children[0]);

    Msgs.forEach(function(msg_item){
      let msg = msg_item.props.message || msg_item.props.children[0].props.msg;

      if(msg.sender == "human" && msg.content[0].text) {
        tx_cnts +=1;
        tx_sz += msg.content[0].text.length;
        for(i = 0; i < msg.attachments.length; i++) {
          tx_sz += msg.attachments[i].file_size;
          fp_cnts += 1;
          fp_sz += msg.attachments[i].file_size;;
        }
        img_cnts += msg.files.length;
      } else if(msg.sender == "assistant" && msg.content[0].text) {
        rx_cnts +=1;
        rx_sz += msg.content[0].text.length;
      }
    });

    return {
      tx_cnts: tx_cnts, tx_sz: tx_sz,
      rx_cnts: rx_cnts, rx_sz: rx_sz,
      fp_cnts: fp_cnts, fp_sz: fp_sz,
      img_cnts: img_cnts,
    };
  }

function msg_counter_main() {
    let fieldset = document.querySelector("body > div.flex.min-h-screen.w-full fieldset") ||
                  document.querySelector("body > div.flex.min-h-screen.w-full > div > div > div.relative.flex.w-full> div.relative.mx-auto.flex.h-full.w-full > div.sticky.bottom-0.mx-auto.w-full");

    if (fieldset) {
      let ret = get_msg_count();
      if(!ret) return;

      let count_result = document.querySelector("#claude-msg-counter")
      if(!count_result) {
        count_result = document.createElement("pre");
        count_result.id = "claude-msg-counter";
        count_result.className = "border-0.5 relative z-[5] text-text-200 border-accent-pro-100/20 bg-accent-pro-900 rounded-t-xl border-b-0";
        count_result.style = "font-size:12px; padding: 5px 7px 14px; margin: -3px 0px -12px; text-wrap: pretty; z-index: 6;";

        let targetParent = fieldset.querySelector("div.flex.md\\:px-2.flex-col-reverse");
        if(targetParent) {
          targetParent.insertBefore(count_result, targetParent.firstChild);
        } else if(fieldset.querySelector("div.flex.w-full.flex-col.items-center")) {
          fieldset.querySelector("div.flex.w-full.flex-col.items-center").before(count_result);
        }
      }

      let all_length = ret.tx_sz + ret.rx_sz;
      let file_info = ret.fp_cnts ? `,${ret.fp_cnts}个附件(${ret.fp_sz}字)` : '';
      let img_info = ret.img_cnts ? `,${ret.img_cnts}个媒体文件` : '';
      const token = conversation_tokensSoFar();
      let token_info = token ? `|【Token】:${token}` : '';

      count_result.innerText = `【统计】已发:${ret.tx_cnts}条,${ret.tx_sz}字${file_info}${img_info}|已回:${ret.rx_cnts}条,${ret.rx_sz}字|合计:${all_length}字${token_info}`;
    }
  }

  setInterval(() => {
    msg_counter_main();
  }, 1600);

  // show message date/time
  function show_msg_time() {
    let mainScreen = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen") ;
    if(!mainScreen) return;

    const msg_divs = mainScreen.querySelectorAll("div[data-test-render-count] > div.mb-1.mt-1, div[data-test-render-count] > div > div[data-is-streaming].group");

    msg_divs.forEach(function(msg_div){
      if (msg_div.nextSibling) return;
      let reactProps = Object.keys(msg_div).find(key => key.startsWith('__reactProps$'));
      if (!reactProps) return;
      let divProps = msg_div[reactProps];
      let updated_at = divProps.children?.[1]?.props?.message?.updated_at ?? divProps.children?.[1]?.props?.children?.[2]?.props?.message?.updated_at;
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
  GM_addStyle(`
  div[data-test-render-count] > div > .msg-uptime {
     margin: 1px 5px 5px; font-size: 13px; font-weight: 300;
  }
  div[data-test-render-count] > .msg-uptime {
     margin: -2px 5px 5px; font-size: 13px; font-weight: 300;
  }
  `);
  setInterval(() => {
    show_msg_time();
  }, 2100);

  // Add Download Button
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

  function get_msg_context() {
    let context = "";

    // let mainScreen = document.querySelector("body > div.flex.min-h-screen.w-full > div > div.flex.h-screen") ;
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


    if ( !convID || !name || !Msgs && !Msgs.length <= 0) {
      console.warn("not found Msg", convID , name, Msgs);
      return null;
    }

    const model = conversation_model();
    const token = conversation_tokensSoFar();

    let model_info = '';
    if (model) {
      model_info = `- model            : ${model}\n`;
    }

    let token_info = '';
    if (token) {
      token_info = `- tokensSoFar      : ${token}\n`;
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

    context += `# ${name}\n\n${account_info}${model_info}${token_info}${time_info}- conversationUUID : ${convID}\n`;

    // Msgs.forEach(function(msg){
    Msgs.forEach(function(msg_item){
      let msg = msg_item.props?.message || msg_item.props?.children[0]?.props.msg;

      context += `\n## ${msg.sender}:\n\n`
      context += msg.text;

      for(i = 0; i < msg.content.length; i++) {
        context += msg.content[i].text || '';
        if (msg.content[i].input?.id) {
          context += '\n* artifacts: ' + msg.content[i].input?.id + ', title: ' + msg.content[i].input?.title + ' *\n'
          context += `\n\`\`\`${msg.content[i].input?.language}\n ${msg.content[i].input?.content}\n\`\`\`\n`;
        }
      }

      for(i = 0; i < msg.attachments.length; i++) {
        context += `\nfile: ${msg.attachments[i].file_name}\n`
        if(msg.attachments[i].extracted_content) {
          context += `\n\`\`\`file_context\n ${msg.attachments[i].extracted_content}\n\`\`\`\n`;
        }
      }
      for(i = 0; i < msg.files.length; i++) {
        context += `file: ${msg.files[i].file_name}\n`
        if(msg.files[i].preview_url) {
          context += `preview_url: ${window.location.origin + msg.files[i].preview_url}\n`;
        }
      }

      context += `\n------------------------------------------------------\n`
    });

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

  // 添加按钮
  createPersistentElement("body > div.flex.min-h-screen.w-full div.sticky.items-center div.right-3 div.hidden.flex-row-reverse", createDownloadButton);

})();


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

    function updateProgress(percent, status) {
      progressBar.value = percent;
      statusText.textContent = status;
    }

    function updateDebugInfo(info) {
      debugInfo.textContent = info;
      console.log('Debug:', info);
    }

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
            // `/api/organizations/${master_id}/chat_conversations/${conversation.uuid}?tree=True&rendering_mode=messages&render_all_tools=true`
            const detailedConversation = await makeRequest(`/api/organizations/${master_id}/chat_conversations/${conversation.uuid}?tree=True&rendering_mode=raw`);

            if (detailedConversation.chat_messages?.length == 0) {
              continue;
            }
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

    GM_registerMenuCommand("备份全部对话记录(Json格式)", backupAllChats);




  };

  setTimeout(() => AddDownloadAllChats(), 1000);


  // 将页面上的重置时间用更完整的本地时间表示
  let lastProcessedTime = '';
  const updateInterval = 2000; // 每2秒更新一次

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

  function checkForChanges() {
    debouncedUpdateTime();
    requestAnimationFrame(checkForChanges);
  }

  requestAnimationFrame(checkForChanges);
  setInterval(updateTime, updateInterval);
})();
