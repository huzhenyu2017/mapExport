'use strict';
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
// 纸张尺寸(mm,dpi)
const formats = {
  a0: [ 1189, 841, 150 ],
  a1: [ 841, 594, 150 ],
  a2: [ 594, 420, 150 ],
  a3: [ 420, 297, 150 ],
  a4: [ 297, 210, 150 ],
  a5: [ 210, 148, 150 ],
};

/**
 * 同步方法创建保存导出地图的文件夹
 *
 * @param {*} dirname 文件夹目录
 */
const mkdirsSync = function(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  }
  if (mkdirsSync(path.dirname(dirname))) {
    console.log('创建文件夹:' + dirname);
    fs.mkdirSync(dirname);
    return true;
  }
};

/**
 * 按selector选择DOM，部分截屏导出
 * (保存整个页面为PDF很简单，然而保存pdf的API中没有类似page.screenshot中clip参数，因此可以将上一步保存的图片转为PDF)
 *
 * @param {*} page 打开的页面对象
 * @param {*} selector 元素选择器
 * @param {*} path 截屏保存地址
 * @param {*} padding 内边距
 */
const screenshotDOMElement = async (page, selector, path, padding = 0) => {
  const rect = await page.evaluate(selector => {
    try {
      const element = document.querySelector(selector);
      const {
        x,
        y,
        width,
        height,
      } = element.getBoundingClientRect();
      if (width * height != 0) {
        return {
          left: x,
          top: y,
          width,
          height,
          id: element.id,
        };
      }
      return null;

    } catch (e) {
      return null;
    }
  }, selector);

  return await page.screenshot({
    path,
    // fullPage: true，
    clip: rect ? {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    } : null,
  });
};

/**
 * 执行截屏导出地图操作
 *
 * @param {*} url 目标网页地址
 * @param {*} mapName 导出地图名称
 * @param {*} userID 当前用户ID
 * @param {Object} option 导出地图格式 {type: "png", orientation: "landscape", format: "a4", quality:'5'}
 * @param {Number} zoom 当前地图需要缩放的级别 {type: "png", orientation: "landscape", format: "a4", quality:'5'}
 * @param {string} [selector=".leaflet-container"]
 * @param {Array} [hideSelectors=".leaflet-container"]
 */
const runMapExport = async (url, mapName, userID, option, zoom = 0, selector = '.leaflet-container', hideSelectors = [ '.leaflet-control-container' ]) => {
  // 导出地图保存路径
  const saveDir = `./app/public/map_exports/${userID}`;
  mkdirsSync(saveDir);
  const savePath = `${saveDir}/${mapName}.png`;

  // 启动浏览器
  const browser = await puppeteer.launch({
    // headless: false, // 无界面 默认为true,改成false,则可以看到浏览器操作，目前生成pdf只支持无界面的操作。
    // devtools: true, // 开启开发者调试模式，默认false, 也就是平时F12打开的面版
  });

  // 打开一个标签页,页面在浏览器环境中被创建
  const page = await browser.newPage();

  const width = Math.round(formats[option.format][0] * (option.quality || formats[option.format][2]) / 25.4); // 打印尺寸-宽
  const height = Math.round(formats[option.format][1] * (option.quality || formats[option.format][2]) / 25.4); // 打印尺寸-高

  /* 测试导出图片格式(设置浏览器视口尺寸比例要与纸张比例保持一致) */
  page.setViewport({
    width: option.orientation === 'landscape' ? width : height,
    // 只需要地图部分，在高度上预留95px的头部元素，以保持导出尺寸比例
    height: (option.orientation === 'landscape' ? height : width) + 95,
    // width: 1980,
    // height: 1080
  });
  // await page.emulate(devices['iPhone X']); //模拟请求设备
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });

  // 模拟点击放大地图按钮
  if (zoom) {
    if (zoom) {
      for (let i = 0; i < zoom; i++) {
        await page.click('.leaflet-control-zoom-in');
      }
    }
  }

  // 获取dom元素:
  // 获取、修改dom元素属性:
  for (let i = 0; i < hideSelectors.length; i++) {
    await page.$eval(hideSelectors[i], el => {
      el.style.display = 'none'; // 隐藏地图缩放等按钮
    });
  }

  // 如果对页面进行操作，可能需要等待一定的时间，这里单位为ms
  await page.waitFor(1000);
  await screenshotDOMElement(page, selector, savePath); // 部分截屏导出页面,返回值为图像数组

  // 关闭浏览器
  await browser.close();

  // 判断导出格式是否为pdf
  if (option.type === 'pdf') {
    // 如果导出格式为pdf，则需要将导出的图片转换为pdf格式，再返回到客户端
    // var pdf = new jsPDF({
    //   orientation: option.orientation,
    //   unit: 'px',
    //   format: option.format
    // })
    // pdf.save('two-by-four.pdf');
  } else {
    // 否则，直接将导出的png图片返回客户端
  }
  console.log(savePath);
  return savePath.split('./app')[1];
};

module.exports = {
  export: runMapExport,
};
