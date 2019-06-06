# mapExport
一个基于egg框架和puppeteer框架的高清在线地图导出node.js服务
# install
cd project-folder
<br>cnpm install
# use
dev: npm run dev
<br>prod: npm start | npm stop
# api
执行截屏导出地图操作runMapExport
 * @param {*} url 目标网页地址
 * @param {*} mapName 导出地图名称
 * @param {*} userID 当前用户ID
 * @param {Object} option 导出地图格式 {type: "png", orientation: "landscape", format: "a4", quality:'5'}
 * @param {Number} zoom 当前地图需要缩放的级别 {type: "png", orientation: "landscape", format: "a4", quality:'5'}
 * @param {string} [selector=".leaflet-container"] 需要导出的局部DOM结构
 * @param {Array} [hideSelectors=".leaflet-container"] 需要隐藏的DOM结构
