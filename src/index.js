import aimakeWebpackConfig from 'webpack-config-aimake';
import server from 'aimake-cli-server';
import _ from 'lodash';
import path from 'path';
import fse from 'fs-extra';

const rootDir = process.cwd();

process.env.NODE_ENV = 'development';

function getWebpackOptions(aimakeOptions, options) {
  let webpackOptions;
  if (!aimakeOptions.webpack) {
    webpackOptions = {};
  }
  // 合并配置
  webpackOptions = _.merge({
    appName: aimakeOptions.appName,
    needNameSpace: aimakeOptions.needNameSpace,
    projectType: aimakeOptions.projectType, // 项目类型
    libType: aimakeOptions.libType, // 框架类型
    env: options.env,
    baseUrl: options.baseUrl,
    weinre: options.weinre, // 开启远程调试
  }, aimakeOptions.webpack);

  return webpackOptions;
}

// 用户端自定义Webpack配置
function clientWebpackConfig(config) {
  let newConfig;
  try {
    newConfig = require(path.join(rootDir, 'webpack.config.js'))(config);
  } catch (e) {
    newConfig = null;
  }
  return newConfig || config;
}

export default {
  // 定义命令选项
  options: [
    ['-e, --env <env>', '静态资源环境'],
    ['-b, --baseUrl <baseUrl>', '静态资源基础URL'],
    ['-w, --weinre', '开启Weinre远程调试'],
    ['-h, --https', '开启Https'],
  ],
  run(argument, options) {
    // argument 命令参数 options 命令配置
    // 用户配置
    let aimakeOptions;
    try {
      aimakeOptions = require(path.join(rootDir, '.legao'));
    } catch (e) {
      try {
        aimakeOptions = fse.readJsonSync(path.join(rootDir, '.legao'));
      } catch (err) {
        aimakeOptions = {};
      }
    }

    // 获取 Webpack 配置（合并用户配置和命令行配置）
    const webpackOptions = getWebpackOptions(aimakeOptions, options);
    // 根据配置生成WebpackConfig
    const webpackConfig = clientWebpackConfig(aimakeWebpackConfig(webpackOptions));
    // 服务端配置
    const serverOptions = _.merge(aimakeOptions.server, {
      webpackConfig,
      weinre: options.weinre,
      https: options.https,
      proxy: aimakeOptions.proxy || false,
      proxyServer: aimakeOptions.proxyServer || {},
    });

    // server
    server(serverOptions, () => {
    });
  },
};
