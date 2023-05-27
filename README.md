# GPT-Models-Plus
这是一个油猴脚本，通过改变 [OpenAI's ChatGPT](https://chat.openai.com/) 的模型版本来改进聊天体验。

用于在ChatGPT 网页版 强制锁定模型，支持GPT3.5/GPT4/GPT3.5M/GPT4M/GPT4B/GPT4P等模型

该项目基于 https://github.com/BlueSkyXN/GPT4-Moblie 进行了拓展二开。本项目开发过程中大量应用了AIGC。

## 功能

该脚本允许用户在OpenAI's ChatGPT页面中选择并锁定使用不同的GPT模型，包括 `GPT-3.5`, `GPT-3.5 Mobile`, `GPT-4 Mobile`, `GPT-4`, `GPT-4 Browsing`, 和 `GPT-4 Plugins`。

脚本会在页面上添加一个下拉框（dropdown），用于选择要锁定的模型。选定的模型会被保存在本地，用于之后的聊天会话。

## 使用方式

1. 首先，你需要一个支持用户脚本（user scripts）的浏览器插件，如 Tampermonkey。

2. 安装GPT-Models-Plus用户脚本。

3. 打开 [OpenAI's ChatGPT](https://chat.openai.com/)。你会在页面右上角看到一个新的下拉框，允许你选择和锁定不同的模型。

4. 从下拉菜单中选择一个模型，之后的聊天会话将使用这个模型进行。

## 了解更多

请前往 https://github.com/BlueSkyXN/GPT4-Moblie 这个项目，其中对模型和版本进行了一些较为细致的介绍。

如何知道自己的账号支持哪些模型？请在Chat页面F12后打开网络监测然后重新加载，即可看到一个URL为　[https://chat.openai.com/backend-api/models?history_and_training_disabled=false](https://chat.openai.com/backend-api/models?history_and_training_disabled=false)　的返回值就是一个可用模型的JSON。

JSON内容参考[models.json](https://github.com/BlueSkyXN/GPT4-Moblie/blob/main/models.json)和[models-review.md](https://github.com/BlueSkyXN/GPT4-Moblie/blob/main/models-review.md)。


## 注意事项

此脚本用于学习和研究目的。不得用于违法违规用途、不得对任何网站、个人、团体、组织造成损失和其他负面影响（包括中国政府机关、美国政府机关、Github/OpenAI/MicroSoft等公司）。

使用了本代码的任何行为后果均由使用者自行承担包括经济、法律、民事刑事等各项责任或损失。


## 版权和许可证

此项目遵循GPLv3许可证。

OpenAI相关为 https://openai.com/ 网站控制者所有。

油猴相关为 https://greasyfork.org/ 网站控制者所有。

如果你对版权有异议，请提交issue。

If you have an objection to copyright, please submit an issue。




