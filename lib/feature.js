'use strict';

class Feature {
  /**
   * Feature Constructor
   *
   * @public
   * @param {Object} properties 用于Feature 实例构造的属性
   *                - run {Function}: 运行时的执行过程
   *                - scaffold {Array}: 脚手架文件列表
   *                - packageJson {Object}: 对目标项目package.json的调整, 如增加依赖、脚本等等
   *                - setup {Generator Function}: 脚手架构建过程
   *                - dependencies {Array}: 前置依赖的其他feature
   */
  constructor(properties) {
    // TODO 类型检测
    this.run          = properties.run;
    this.scaffold     = properties.scaffold;
    this.packageJson  = properties.packageJson;
    this.setup        = properties.setup;
    this.dependencies = properties.dependencies;

    this.config       = properties.config;
    this.name         = properties.name;
  }
}

Feature.required = ['base', 'utils', 'settings', 'controllers', 'errors', 'start_hooks'];
Feature.optional = ['eslint', 'jsonp', 'memcached', 'redis', 'prepare_commit_msg', 'auto_routes'];

Feature.load = function(type, featureName, config) {
  let feature = require(`./${type}_features/${featureName}`);
  feature.config = config;
  feature.name = featureName;
  return feature;
};

Feature.getFeatures = function(koa800Config) {
  return this.getRequiredFeatures().concat(this.getOptionalFeatures(koa800Config));
};

Feature.getRequiredFeatures = function() {
  let features = [];

  this.required.forEach(featureName => {
    features.push(this.load('required', featureName));
  });
  return features;
};

Feature.getOptionalFeatures = function(koa800Config) {
  let _koa800Config = Object.assign({}, koa800Config);
  let features = [];

  // 通过feature.dependencies 解析最终的koa800Config, 可优化
  this.optional.forEach(featureName => {
    let config = _koa800Config[featureName];
    if (!config) return;

    let feature = this.load('optional', featureName, config);
    if (feature.dependencies) {
      feature.dependencies.forEach(dependency => {
        _koa800Config[dependency] = _koa800Config[dependency] || true;
      });
    }
  });

  this.optional.forEach(featureName => {
    let config = _koa800Config[featureName];
    if (!config) return;

    let feature = this.load('optional', featureName, config);
    features.push(feature);
  });
  return features;
};

module.exports = Feature;
