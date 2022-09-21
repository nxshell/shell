/**
 * 同步库核心库
 * 
 * 依赖git，cnpm
 * git需要在环境变量path中能够找得到，保证能正常启动
 * 
 * 1. 建立core目录
 * 2. 使用git从gitee.com将仓库fetch到本地core目录
 * 3. 运行npm install，根据国内情况，使用国内镜像源
 */

const shelljs = require("shelljs");

let gitExec = shelljs.which("git");
if (gitExec === null) {
    throw new Error("Please install git!");
}

if (!shelljs.test("-d", "core")) {
    // shelljs.mkdir("-p", "core")
    shelljs.exec(`"${gitExec.toString()}" clone https://gitee.com/powertools/powertools-core.git core`);
    shelljs.cd("core")
} else {
    shelljs.cd("core")
    shelljs.exec(`"${gitExec.toString()}" pull`);
}

shelljs.env['ELECTRON_MIRROR'] = "https://npm.taobao.org/mirrors/electron/";

shelljs.exec("npm install --registry=https://registry.npm.taobao.org");
