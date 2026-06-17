const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    // Note: These selectors are placeholders and should be updated with actual Accessibility IDs or resource-ids from the APK.
    get inputUsername() { return '~username-input'; }
    get inputPassword() { return '~password-input'; }
    get btnLogin() { return '~login-button'; }
    get msgError() { return '~error-message'; }

    async login(username, password) {
        await this.setValue(this.inputUsername, username);
        await this.setValue(this.inputPassword, password);
        await this.click(this.btnLogin);
    }
}

module.exports = new LoginPage();
