const BasePage = require('./BasePage');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.nameInput = '#profileNameInput';
    this.emailInput = '#profileEmailInput';
    this.phoneInput = '#profilePhoneInput';
    this.saveBtn = '#btnSaveProfile';
    this.avatarInput = '#avatarUploadInput';
    this.submitAvatarBtn = '#btnUploadAvatar';
    this.profileAvatarText = '#profileAvatarText';
  }

  async updateProfile(name, email, phone) {
    await this.type(this.nameInput, name);
    await this.type(this.emailInput, email);
    await this.type(this.phoneInput, phone);
    await this.click(this.saveBtn);
    await this.driver.sleep(1000); // Allow update reload
  }

  async uploadAvatar(absoluteFilePath) {
    await this.type(this.avatarInput, absoluteFilePath);
    await this.click(this.submitAvatarBtn);
    await this.driver.sleep(1000); // Allow image upload delay
  }
}

module.exports = ProfilePage;
