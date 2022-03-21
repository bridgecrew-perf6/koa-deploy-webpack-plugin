const compressionPlugin = require("compression-webpack-plugin");

const { join, extend, isObject } = require("./lib/utilis");
const { runCommand } = require("./lib/command");
const { PLUGIN_NAME } = require("./lib/constant");
const { defaultSshConfig, defaultProjectConfig } = require("./lib/config");
const initialLocalProject = require("./lib/initialProject");

class KoaDeployWebpackPlugin {
  constructor(config = {}) {
    const { ssh, project, staticConfig, compress } = config;
    this.sshConfig = extend(defaultSshConfig, ssh);
    this.projectConfig = extend(defaultProjectConfig, project);
    this.staticConfig = isObject(staticConfig) ? staticConfig : {};
    this.compressConfig = isObject(compress) ? compress : {};
  }
  apply(compiler) {
    // use compression-webpack-plugin
    const compress = new compressionPlugin(this.compressConfig);
    compress.apply(compiler);

    compiler.hooks.done.tap(PLUGIN_NAME, async ({ compilation }) => {
      const { outputOptions } = compilation;
      const webpackBuildPath = outputOptions.path;

      const projectName = this.projectConfig.name;
      const projectPort = this.projectConfig.port;
      const localProjectPath = join(process.cwd(), projectName);
      initialLocalProject(
        webpackBuildPath,
        localProjectPath,
        projectPort,
        this.staticConfig
      );
      runCommand(this.sshConfig, this.projectConfig);
    });
  }
}

module.exports = KoaDeployWebpackPlugin;
