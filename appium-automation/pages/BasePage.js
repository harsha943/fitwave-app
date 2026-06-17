module.exports = class BasePage {
    /**
     * Set a value to an element
     * @param {string} locator 
     * @param {string} value 
     */
    async setValue(locator, value) {
        const element = await $(locator);
        await element.waitForDisplayed({ timeout: 10000 });
        await element.setValue(value);
    }

    /**
     * Click on an element
     * @param {string} locator 
     */
    async click(locator) {
        const element = await $(locator);
        await element.waitForDisplayed({ timeout: 10000 });
        await element.click();
    }

    /**
     * Get text from an element
     * @param {string} locator 
     */
    async getText(locator) {
        const element = await $(locator);
        await element.waitForDisplayed({ timeout: 10000 });
        return await element.getText();
    }

    /**
     * Wait for element to be displayed
     * @param {string} locator 
     */
    async waitForDisplayed(locator) {
        const element = await $(locator);
        await element.waitForDisplayed({ timeout: 10000 });
    }
}
