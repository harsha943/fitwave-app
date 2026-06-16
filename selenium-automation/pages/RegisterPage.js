const BasePage = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.nameInput = '#regName';
    this.emailInput = '#regEmail';
    this.passwordInput = '#regPassword';
    this.submitBtn = '#registerSubmitBtn';
    this.loginLink = '#linkToLogin';
    this.errorMsg = '#regErrorMsg';
    this.successMsg = '#regSuccessMsg';
    this.goToLoginBtn = '#btnGoToLogin';
  }

  async register(name, email, password) {
    await this.type(this.nameInput, name);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.submitBtn);
    await this.driver.sleep(1000); // Allow registration submission delay
  }

  async navigateToLogin() {
    await this.click(this.loginLink);
  }

  async clickGoToLogin() {
    await this.click(this.goToLoginBtn);
  }

  async getErrorMessage() {
    return await this.getText(this.errorMsg);
  }

  async getSuccessMessage() {
    return await this.getText(this.successMsg);
  }
}

module.exports = RegisterPage;
