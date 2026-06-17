const BasePage = require('./BasePage');

class SettingsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.themeDropdown = '#settingsTheme';
    this.emailAlertsDropdown = '#settingsEmailAlerts';
    this.weeklySummaryDropdown = '#settingsWeeklySummary';
    this.saveBtn = '#btnSaveSettings';
    this.cancelBtn = '#btnCancelSettings';
  }

  async saveSettings(theme, emailAlerts, weeklySummary) {
    await this.selectDropdownByValue(this.themeDropdown, theme);
    await this.selectDropdownByValue(this.emailAlertsDropdown, emailAlerts);
    await this.selectDropdownByValue(this.weeklySummaryDropdown, weeklySummary);
    await this.click(this.saveBtn);
    await this.driver.sleep(1000); // Allow settings save reload
  }

  async cancelSettings() {
    await this.click(this.cancelBtn);
    await this.driver.sleep(1000); // Allow cancel redirect
  }
}

module.exports = SettingsPage;
