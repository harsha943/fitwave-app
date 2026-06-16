const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = '#loginEmail';
    this.passwordInput = '#loginPassword';
    this.submitBtn = '#loginSubmitBtn';
    this.registerLink = '#linkToRegister';
    this.errorMsg = '#loginErrorMsg';
  }

  async login(username, password) {
    await this.type(this.emailInput, username);
    await this.type(this.passwordInput, password);
    await this.click(this.submitBtn);
    await this.driver.sleep(1000); // Allow redirection/render delay
  }

  async navigateToRegister() {
    await this.click(this.registerLink);
  }

  async getErrorMessage() {
    return await this.getText(this.errorMsg);
  }
}

module.exports = LoginPage;
