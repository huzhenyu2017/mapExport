'use strict';

const Controller = require('egg').Controller;

class MapExportController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = this.service.mapExport.index();
  }
  async exportMap() {
    const { ctx } = this;
    ctx.body = await this.service.mapExport.exportMap();
  }
  async pin() {
    const { ctx } = this;
    ctx.body = this.service.mapExport.pin();
  }
}

module.exports = MapExportController;
