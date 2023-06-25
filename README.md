# GPT-Models-Plus
这是一个油猴脚本，通过改变 [OpenAI's ChatGPT](https://chat.openai.com/) 的模型版本来改进聊天体验。

用于在ChatGPT 网页版 强制锁定模型，支持GPT3.5/GPT4/GPT3.5M/GPT4M/GPT4B/GPT4P等模型

## 功能

该脚本允许用户在OpenAI's ChatGPT页面中选择并锁定使用不同的GPT模型，包括 `GPT-3.5`, `GPT-3.5 Mobile`, `GPT-4 Mobile`, `GPT-4`, `GPT-4 Browsing`, 和 `GPT-4 Plugins`。

脚本会在页面上添加一个下拉框（dropdown），用于选择要锁定的模型。选定的模型会被保存在本地，用于之后的聊天会话。（MAX版本还会修改按钮）

## 使用方式

1. 首先，你需要一个支持用户脚本（user scripts）的浏览器插件，如 Tampermonkey。

2. 安装GPT-Models-Plus用户脚本。

3. 打开 [OpenAI's ChatGPT](https://chat.openai.com/)。你会在页面右上角看到一个新的下拉框，允许你选择和锁定不同的模型。

4. 从下拉菜单中选择一个模型，之后的聊天会话将使用这个模型进行。

## 了解更多

请前往 https://github.com/BlueSkyXN/GPT4-Moblie 这个项目，其中对模型和版本进行了一些较为细致的介绍。

如何知道自己的账号支持哪些模型？请在Chat页面F12后打开网络监测然后重新加载，即可看到一个URL为　[https://chat.openai.com/backend-api/models?history_and_training_disabled=false](https://chat.openai.com/backend-api/models?history_and_training_disabled=false)　的返回值就是一个可用模型的JSON。

JSON内容参考[models.json](models.json)和[models-review.md](models-review.md)。

## 注意事项

- 使用此脚本时需要注意，因为它会强制锁定新建对话的语言模型。
- 它可能和其他脚本冲突（同网页的时候，可能效果无效）。如果你发现锁定GPT4M无效，我建议是要么关了其他的，要么去手机App发起新对话然后网页版继续即可。
- 你需要本身就能在对应浏览器访问对应的ChatGPT模型（比如网络、浏览器、PLUS订阅）
- 如果你在无痕模式使用则需要注意是否在扩展插件设置中启用了无痕的支持。
- 不得用于违法违规行为，后果自行承担，和本人无关。
- 这个脚本可能不会与 OpenAI 的所有更新保持兼容。该方式随时可能会被阻止、封锁等。甚至对你的账号、IP等造成损失，比如被封号等。由此产生的经济损失和法律风险由使用者自行承担。

## Update 更新事宜
Jun 4, 2023：增加了按钮效果的MAX版本

Jun 25, 2023：HKT 17:36 ，发现ChatGPT对GPT4M模式增加了RateLimit，以往的对话也一样受到影响，移动端提示你发送了过多的信息给这个模型、网页端提示 “You've reached the current usage cap for GPT-4. You can continue with the default model now, or try again after XXX” 并给了个链接 https://share.hsforms.com/16d0ZZVM3QZirXnCD_q7u1Q4sk30 为了给予每一位Plus用户都有机会尝试该模型，我们目前正在动态调整GPT-4的使用上限，因为我们了解了更多关于需求和系统性能的信息。

## 法律、版权和许可证

此项目遵循GPLv3许可证。

OpenAI相关为 https://openai.com/ 网站控制者所有。

油猴相关为 https://greasyfork.org/ 网站控制者所有。

如果你对版权有异议，请提交issue。

If you have an objection to copyright, please submit an issue。

此脚本用于学习和研究目的。不得用于违法违规用途、不得对任何网站、个人、团体、组织造成损失和其他负面影响（包括中国政府机关、美国政府机关、Github/OpenAI/MicroSoft等公司）。

使用了本代码的任何行为后果均由使用者自行承担，包括经济、法律、民事刑事等各项责任或损失。

本核心代码参考了 [NijikaMyWaifu](https://www.reddit.com/r/saraba2nd/comments/13t2329) 的实现，虽然感谢他提供的代码原型，不过由于他的不满意见，下架了原先的GPT4M的镜像项目。

## GPT版本

在 [compare](compare.md)  中，可以注意到截至2023-05-26 HKT，GPT官方在GPT4-Mobile、GPT4-Browser两个环境下，不使用联网模式是不能认知到自己是GPT4模型的，而GPT3.5和GPT4以及进行联网的GPT4-Browser没有这个问题，可以认知到自己的模型版本

## GPT账号、订阅、购买、付费等

### 账号

目前手动注册需要
1. 邮箱/谷歌苹果微软账号x1，建议邮箱，一旦注册了不可复用，注销也是。
2. 服务区手机号，不支持虚拟号（尤其是美国、Google Voice）、不支持中国包括大陆香港，支持常见的英国实体手机号。也有人用的什么接码。
3. 可用的网络、浏览器

### 付费

升级付费需要服务区发行的银行卡（包括借记卡），网关是Stripe，不支持大陆、香港卡，非美国卡失败率也很高，基本都是用美国发行的卡。注意API订阅只能走卡付款。结算方式是月结账单，每月初扣费。

### 订阅

之前只能在网页版购买PLUS，规则是月滚动扣款。后来开通了IOS商店付费。现在在苹果商店US即可付费PLUS订阅（但是API的那种付费不支持）。苹果商店CN和HK别想太多。

苹果US的付费方式主要是 美国卡、美国PayPal、余额。目前余额可以用礼品卡充值没什么难度；美国卡就正常的都行，可以参考我博客；美国PayPal不推荐，目前注册也是要求美国非虚拟号且日常封号，基本不太可能弄。注意没有卡和P时，使用余额可能要求绑定付款方式，原因是你没有使用美国IP。【其他可用区请看下面】

### 购买

账号其实也可以去各类第三方网站购买，这类网站很多，空号基本1-3CNY 一个。

### ChatGPT For IOS 可用区
2023-05-18 开放 美国

2023-05-25 开放 阿尔巴尼亚、克罗地亚、法国、德国、爱尔兰、牙买加、韩国、新西兰、尼加拉瓜、尼日利亚和英国

2023-05-26 开放 阿尔及利亚、阿根廷、阿塞拜疆、玻利维亚、巴西、加拿大、智利、哥斯达黎加、厄瓜多尔、爱沙尼亚、加纳、印度、伊拉克、以色列、日本、约旦、哈萨克斯坦、科威特、黎巴嫩、立陶宛、毛里塔尼亚、毛里求斯、墨西哥、摩洛哥、纳米比亚、瑙鲁、阿曼、巴基斯坦、秘鲁、波兰、卡塔尔、斯洛文尼亚、突尼斯、阿拉伯联合酋长国 



