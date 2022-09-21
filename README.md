# powertools-shell

#### 介绍
PowerTools Shell程序, Shell主程序。

## 初始化环境

Node版本：`v12.13.0`，其他版本暂未测试


```bash
# clone 仓库
git clone https://gitee.com/powertools/powertools-shell.git

# 安装npm依赖包,使用本地淘宝镜像（可以考虑使用cnpm）
npm install --registry=https://registry.npm.taobao.org
```


## 开发

Bash Shell：
```bash
# 初始化环境
node devtools/synccore.js

# 启动环境，分别执行
# 首先启动web开发环境
npm run serve
# 启动core调试环境
node devtools/rundev.js
```

PowerShell（Windows）：
```ps
# PowerShell
node .\devtools\synccore.js

npm run serve
node .\devtools\rundev.js
```

CMD命令行（Windows）：
```bat
node devtools\synccore.js

npm run serve
node devtools\rundev.js
```
