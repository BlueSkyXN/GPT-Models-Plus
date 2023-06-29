// ==UserScript==
// @name        GPT-Models-MAX
// @namespace   BlueSkyXN
// @match       *://chat.openai.com/*
// @grant       none
// @version     1.1.1
// @author      BlueSkyXN
// @description https://github.com/BlueSkyXN/GPT-Models-Plus 用于在ChatGPT 网页版自选或强制锁定模型，支持GPT3.5/GPT4/GPT3.5M/GPT4M/GPT4B/GPT4P等模型，用油猴脚本TamperMonkey加载
// @license     GPLv3 and MIT
// @grant       unsafeWindow
// @run-at      document-start
// @warning1    不得用于违法违规用途、不得对任何网站、个人、团体、组织造成损失和其他负面影响，包括中国政府、美国政府、Github/OpenAI/MicroSoft等公司。
// @warning2    使用了本代码的任何行为后果均由使用者自行承担，包括经济、法律、民事刑事等各项责任或损失。
// ==/UserScript==

(function() {
  // Part 1: GPT-Models-Plus
  let selectedModel = localStorage.getItem('selectedModel') || 'default'

  const models = [
      { value: 'default', label: 'Default (No Lock)' },
      { value: 'text-davinci-002-render-sha', label: 'GPT-3.5' },
      { value: 'text-davinci-002-render-sha-mobile', label: 'GPT-3.5 Mobile' },
      { value: 'gpt-4-mobile', label: 'GPT-4 Mobile' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-4-browsing', label: 'GPT-4 Browsing' },
      { value: 'gpt-4-plugins', label: 'GPT-4 Plugins' },
      { value: 'gpt-4-code-interpreter', label: 'GPT-4 Coding' },
      { value: 'text-davinci-002-render-sha-code-interpreter', label: 'GPT-3.5 Coding' },
      { value: 'text-davinci-002-render-sha-browsing', label: 'GPT-3.5 Browsing' },
      { value: 'text-davinci-002-render-sha-plugins', label: 'GPT-3.5 Plugins' }
  ]

  const origFetch = window.fetch
  window.fetch = async function (resource, options) {
      if (resource === "https://chat.openai.com/backend-api/conversation" && selectedModel !== 'default') {
          const body = JSON.parse(options.body)
          body.model = selectedModel
          options = { ...options, body: JSON.stringify(body) }
      }
      return fetch2.apply(this, arguments)
  }

  const select = document.createElement('select')
  select.id = 'modelSelect'
  models.forEach((model) => {
      const option = document.createElement('option')
      option.value = model.value
      option.text = model.label
      if (selectedModel === model.value) {
          option.selected = true
      }
      select.appendChild(option)
  })
  select.addEventListener('change', (event) => {
      selectedModel = event.target.value
      localStorage.setItem('selectedModel', selectedModel)
  })
  select.style.padding = '3px 26px 3px 13px'
  select.style.borderRadius = '6px'
  select.style.fontSize = '14px'
  select.style.fontWeight = 500
  select.style.color = 'black';
  select.style.backgroundColor = 'white';

  const label = document.createElement('label')
  label.htmlFor = 'modelSelect'
  label.appendChild(document.createTextNode('Model Lock:'))
  label.style.fontSize = '14px'

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.top = '6px'
  container.style.right = '20px'
  container.style.display = 'flex' 
  container.appendChild(label)
  container.appendChild(select)
  container.style.alignItems = 'center' 
  label.style.alignSelf = 'center' 
  label.style.marginRight = '10px' 

  const observer = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {
              const mainElement = document.querySelector('main')

              if (mainElement && !mainElement.contains(container)) {
                mainElement.style.position = 'relative'
                mainElement.appendChild(container)
                break
            }
        }
    }
})

observer.observe(document.body, { childList: true, subtree: true })

// Part 2: GPT4-Mobile Button
const fetch2 = (url, options) => {
    return origFetch(url, options).then(async (response) => {
        if (url.indexOf('/backend-api/models') === -1) {
            return response;
        }
        const responseClone = response.clone();
        let res = await responseClone.json();
        res.models = res.models.map(m => {
            m.tags = m.tags.filter(t => {
                return t !== 'mobile';
            });
            if (m.slug === 'gpt-4-mobile') {
                res.categories.push({
                    browsing_model: null,
                    category: "gpt_4",
                    code_interpreter_model: null,
                    default_model: "gpt-4-mobile",
                    human_category_name: "GPT-4-Mobile",
                    plugins_model: null,
                    subscription_level: "plus",
                });
            }
            return m;
        });
        return new Response(JSON.stringify(res), response);
    });
};
})();
