'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webpackConfigAimake = require('webpack-config-aimake');

var _webpackConfigAimake2 = _interopRequireDefault(_webpackConfigAimake);

var _aimakeCliServer = require('aimake-cli-server');

var _aimakeCliServer2 = _interopRequireDefault(_aimakeCliServer);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootDir = process.cwd();

process.env.NODE_ENV = 'development';

function getWebpackOptions(aimakeOptions, options) {
  var webpackOptions = void 0;
  if (!aimakeOptions.webpack) {
    webpackOptions = {};
  }
  // 合并配置
  webpackOptions = _lodash2.default.merge({
    appName: aimakeOptions.appName,
    needNameSpace: aimakeOptions.needNameSpace,
    projectType: aimakeOptions.projectType, // 项目类型
    libType: aimakeOptions.libType, // 框架类型
    env: options.env,
    baseUrl: options.baseUrl,
    weinre: options.weinre // 开启远程调试
  }, aimakeOptions.webpack);

  return webpackOptions;
}

// 用户端自定义Webpack配置
function clientWebpackConfig(config) {
  var newConfig = void 0;
  try {
    newConfig = require(_path2.default.join(rootDir, 'webpack.config.js'))(config);
  } catch (e) {
    newConfig = null;
  }
  return newConfig || config;
}

exports.default = {
  // 定义命令选项
  options: [['-e, --env <env>', '静态资源环境'], ['-b, --baseUrl <baseUrl>', '静态资源基础URL'], ['-w, --weinre', '开启Weinre远程调试'], ['-h, --https', '开启Https']],
  run: function run(argument, options) {
    // argument 命令参数 options 命令配置
    // 用户配置
    var aimakeOptions = void 0;
    try {
      aimakeOptions = require(_path2.default.join(rootDir, '.legao'));
    } catch (e) {
      try {
        aimakeOptions = _fsExtra2.default.readJsonSync(_path2.default.join(rootDir, '.legao'));
      } catch (err) {
        aimakeOptions = {};
      }
    }

    // 获取 Webpack 配置（合并用户配置和命令行配置）
    var webpackOptions = getWebpackOptions(aimakeOptions, options);
    // 根据配置生成WebpackConfig
    var webpackConfig = clientWebpackConfig((0, _webpackConfigAimake2.default)(webpackOptions));
    // 服务端配置
    var serverOptions = _lodash2.default.merge(aimakeOptions.server, {
      webpackConfig: webpackConfig,
      weinre: options.weinre,
      https: options.https,
      proxy: aimakeOptions.proxy || false,
      proxyServer: aimakeOptions.proxyServer || {}
    });

    // server
    (0, _aimakeCliServer2.default)(serverOptions, function () {});
  }
};
module.exports = exports['default'];