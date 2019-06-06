'use strict';

const Service = require('egg').Service;
const mapExportUtil = require('../util/mapExportUtil');

class MapExportService extends Service {
  async index() {
    return 'hi, egg';
  }
  async exportMap() {
    const { ctx } = this;
    // 通过中间件获取到post/get的请求参数
    const { url, mapName, userID, option, zoom } = ctx.params;
    // const url = 'http://47.96.162.249:3009/mapping';
    // const mapName = '统计专题图a4-150';
    // const userID = 'nuckyhu';
    // const option = {
    //   type: 'png',
    //   orientation: 'landscape',
    //   format: 'a4',
    //   quality: 150,
    // };
    try {
      const mapPath = await mapExportUtil.export(url, mapName, userID, option, zoom); // ./app/public/map_exports/nuckyhu/统计专题图a4-150.png
      return { path: mapPath };
    } catch (e) {
      return e;
    }

    // return hotArticle;
  }
  pin() {
    return { msg: 'egg is running! :)' };
  }
}

module.exports = MapExportService;
