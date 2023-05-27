// ==UserScript==
// @name        GPT-Models-Plus
// @namespace   BlueSkyXN
// @match       *://chat.openai.com/*
// @grant       none
// @version     0.1
// @author      BlueSkyXN
// @description https://github.com/BlueSkyXN
// ==/UserScript==

(() => {
    let selectedModel = localStorage.getItem('selectedModel') || 'text-davinci-002-render-sha'
  
    const models = [
      { value: 'gpt-4', label: 'Use GPT-4' },
      { value: 'gpt-4-browsing', label: 'Use GPT-4 Browsing' },
      { value: 'gpt-4-plugins', label: 'Use GPT-4 Plugins' },
      { value: 'text-davinci-002-render-sha-mobile', label: 'Use Davinci Mobile' },
      { value: 'gpt-4-mobile', label: 'Use GPT-4 Mobile' }
    ]
  
    const origFetch = window.fetch
    window.fetch = async function (resource, options) {
      if (resource === "https://chat.openai.com/backend-api/conversation") {
        const body = JSON.parse(options.body)
        body.model = selectedModel
        options = { ...options, body: JSON.stringify(body) }
      }
      return origFetch.apply(this, arguments)
    }
  
    // Create a select element to control which model to use
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
  
    const label = document.createElement('label')
    label.htmlFor = 'modelSelect'
    label.appendChild(document.createTextNode('Model Lock:'))
  
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '10px'
    container.style.right = '20px'
    container.style.display = 'flex' // 添加这一行
    container.appendChild(label)
    container.appendChild(select)
    container.style.alignItems = 'center' // 添加这一行
    label.style.alignSelf = 'center' // 修改这一行
    label.style.marginRight = '10px' // 添加这一行
  
  
  
    // Observe DOM changes and add the select when the main element appears
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
  })()
  