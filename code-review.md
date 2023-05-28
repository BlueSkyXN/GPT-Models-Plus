#  [origin.js](origin.js) 功能简述
这段JavaScript代码的功能是修改在一个网页上使用的fetch API的行为。这个修改的目标是为了将与 `https://chat.openai.com/backend-api/conversation` 这个URL交互的所有fetch请求的模型更改为"gpt-4-mobile"。

这段代码中包含了一个自执行的箭头函数，主要有两个部分：

1. **替换fetch API：** 使用原生的fetch方法创建一个新的fetch函数，新的fetch函数会检查请求的URL。如果URL是`https://chat.openai.com/backend-api/conversation`，并且用户没有通过设置localStorage的"replaceFetch"来禁用此功能，它就会修改该请求，将请求的模型更改为"gpt-4-mobile"。

2. **创建一个可勾选的复选框：** 这个复选框允许用户选择是否启用上述功能。复选框的状态会保存在localStorage的"replaceFetch"中，所以关闭并重新打开浏览器后，该设置依然有效。

此外，代码还设置了一个MutationObserver，用于监视DOM的变化。当main元素出现在页面上时，会将复选框添加到main元素中。

这个代码在某些情况下可能很有用，比如一个使用OpenAI的chat模型的网页，而你希望所有的请求都使用"gpt-4-mobile"模型，那么这个代码就可以帮你实现这个目标。

#  [origin.js](origin.js) 逐行解读

1. `// ==UserScript==` 和 `// ==/UserScript==`：这两行是 UserScript 的元数据块的开始和结束标记，包含了一些用于描述 UserScript 的元数据。

2. `// @name Use GPT-4 Mobile`：定义了 UserScript 的名称，也就是 "Use GPT-4 Mobile"。

3. `// @namespace NijikaMyWaifu`：定义了 UserScript 的命名空间，这是一个唯一标识 UserScript 的字符串。

4. `// @match *://chat.openai.com/*`：定义了 UserScript 运行的网站，这里设置为所有协议的 "chat.openai.com" 下的所有路径。

5. `// @grant none`：定义了 UserScript 需要的特殊权限，这里设置为 "none"，表示不需要任何特殊权限。

6. `// @version 1.0`：定义了 UserScript 的版本号。

7. `// @author NijikaMyWaifu`：定义了 UserScript 的作者。

8. `(() => {...})()`：这是一个自调用的匿名函数，也被称为立即执行函数表达式(IIFE)。所有的代码都在这个函数中执行，以避免污染全局作用域。

9. `let replaceFetch = localStorage.getItem('replaceFetch') !== 'false'`：从浏览器的本地存储中获取 "replaceFetch" 的值，如果它不是 "false"，则 `replaceFetch` 将为真。

10. `const origFetch = window.fetch`：保存原始的 fetch 函数。

11. `window.fetch = async function (resource, options) {...}`：替换原始的 fetch 函数。当 URL 是 "https://chat.openai.com/backend-api/conversation" ，并且 `replaceFetch` 为真时，它会修改请求的 body，将模型改为 "gpt-4-mobile"。

12. `const checkbox = document.createElement('input')...`：创建一个复选框，并添加一个事件监听器，当复选框的状态改变时，将新的状态保存到本地存储，并更新 `replaceFetch` 的值。

13. `const label = document.createElement('label')...`：创建一个标签，内容为 "Use GPT-4 Mobile"。

14. `const container = document.createElement('div')...`：创建一个 div 元素作为容器，并设置样式。然后，将复选框和标签添加到容器中。

15. `const observer = new MutationObserver((mutationsList, observer) => {...})`：创建一个 MutationObserver，它会观察 document.body 的变化。当 main 元素出现时，将容器添加到 main 元素中。

16. `observer.observe(document.body, { childList: true, subtree: true })`：开始观察 document.body 的变化。

这个 UserScript 的主要功能是在 OpenAI 聊天室中添加一个复选框，让用户可以选择是否将默认的语言模型切换为 "gpt-4-mobile"。
