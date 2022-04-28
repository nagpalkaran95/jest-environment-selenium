import NodeEnvironment from 'jest-environment-node';
import webdriver from 'selenium-webdriver';
import proxy from 'selenium-webdriver/proxy';

class WebdriverEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    config.testEnvironmentOptions = config.projectConfig.testEnvironmentOptions;
    // this.configuration = Object.assign(
    //   {
    //     capabilities: {
    //       browserName: 'chrome'
    //     }
    //   },
    //   config.testEnvironmentOptions
    // );

    this.configuration = config.testEnvironmentOptions;
    this.global.webdriver = webdriver;
    this.global.By = webdriver.By;
    this.global.until = webdriver.until;
    this.global.configuration = this.configuration;
    this.global.cleanup = async () => {
      // await this.global.driver.quit();
      asyncFunctions = [];
      this.global.driver.forEach(_dr => {
        asyncFunctions.push(_dr.quit());
      })
      await Promise.all(asyncFunctions);
      this.global.driver = await buildDriver(this.configuration);
    };
  }

  async setup() {
    await super.setup();
    this.global.driver = await buildDriver(this.configuration);
  }

  async teardown() {
    if (this.global.driver) {
      // await this.global.driver.quit();
      asyncFunctions = [];
      this.global.driver.forEach(_dr => {
        asyncFunctions.push(_dr.quit());
      })
      await Promise.all(asyncFunctions);
    }
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

async function buildDriver(configuration) {
  let drivers = [];
  configuration.capabilities.forEach(caps => {
    let driver = new webdriver.Builder().withCapabilities(caps);

    if (configuration.server) driver.usingServer(configuration.server);
    if (configuration.proxyType) {
      let prxy;
      if (configuration.proxyType === 'socks') {
        prxy = proxy.socks(configuration.proxyOptions.socksProxy, configuration.proxyOptions.socksVersion);
      } else {
        prxy = proxy[configuration.proxyType](configuration.proxyOptions);
      }
      driver.setProxy(prxy);
    }

    drivers.push(driver);
    // return driver.build();
  });
  return drivers;
}

module.exports = WebdriverEnvironment;
