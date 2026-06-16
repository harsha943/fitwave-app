const { until, By } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utilities/logger');

class BasePage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.timeout;
  }

  async navigate(path = '') {
    const url = `${config.baseUrl}${path}`;
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  async findElement(locator, timeoutMs = this.timeout) {
    try {
      const by = typeof locator === 'string' ? By.css(locator) : locator;
      await this.driver.wait(until.elementLocated(by), timeoutMs);
      const element = await this.driver.findElement(by);
      await this.driver.wait(until.elementIsVisible(element), timeoutMs);
      return element;
    } catch (error) {
      logger.error(`Error finding element: ${locator} - ${error.message}`);
      throw error;
    }
  }

  async findElements(locator, timeoutMs = this.timeout) {
    try {
      const by = typeof locator === 'string' ? By.css(locator) : locator;
      await this.driver.wait(until.elementsLocated(by), timeoutMs);
      return await this.driver.findElements(by);
    } catch (error) {
      logger.error(`Error finding elements: ${locator} - ${error.message}`);
      return [];
    }
  }

  async click(locator) {
    const element = await this.findElement(locator);
    logger.info(`Clicking element: ${locator}`);
    await element.click();
  }

  async type(locator, text) {
    const element = await this.findElement(locator);
    logger.info(`Typing text in ${locator}`);
    await element.clear();
    await element.sendKeys(text);
  }

  async selectDropdownByValue(locator, value) {
    const element = await this.findElement(locator);
    logger.info(`Selecting dropdown ${locator} option value: ${value}`);
    await element.click();
    const option = await this.findElement(By.css(`option[value="${value}"]`));
    await option.click();
  }

  async getText(locator) {
    const element = await this.findElement(locator);
    const text = await element.getText();
    logger.info(`Got text from ${locator}: "${text}"`);
    return text;
  }

  async getValue(locator) {
    const element = await this.findElement(locator);
    const val = await element.getAttribute('value');
    return val;
  }

  async isDisplayed(locator) {
    try {
      const element = await this.findElement(locator, 2000);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async takeScreenshot(testCaseId) {
    const screenshotDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotName = `${testCaseId}_${Date.now()}.png`;
    const screenshotPath = path.join(screenshotDir, screenshotName);
    try {
      const img = await this.driver.takeScreenshot();
      fs.writeFileSync(screenshotPath, img, 'base64');
      logger.info(`Screenshot captured for failed test: ${screenshotPath}`);
      return screenshotPath;
    } catch (err) {
      logger.error(`Failed to capture screenshot: ${err.message}`);
      return null;
    }
  }
}

module.exports = BasePage;
