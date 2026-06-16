const LoginPage = require('../../pages/LoginPage');
const DashboardPage = require('../../pages/DashboardPage');
const ProfilePage = require('../../pages/ProfilePage');
const { buildDriver, saveResult } = require('../testHelper');
const testData = require('../../testdata/testdata.json');
const path = require('path');
const logger = require('../../utilities/logger');

describe('User Profile Module Tests', function() {
  this.retries(1);
  let driver;
  let profilePage;
  let dashboardPage;
  const profileTests = testData.filter(tc => tc.module === 'User Profile');

  beforeEach(async function() {
    driver = await buildDriver();
    dashboardPage = new DashboardPage(driver);
    profilePage = new ProfilePage(driver);
    
    // Log in and navigate to Profile
    const loginPage = new LoginPage(driver);
    await loginPage.navigate('/login');
    await loginPage.login('admin@fitwave.com', 'AdminPassword123!');
    await dashboardPage.navigateToProfile();
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  profileTests.forEach(tc => {
    it(`${tc.id}: ${tc.scenario}`, async function() {
      const startTime = Date.now();
      let status = 'PASS';
      let actual = 'User profile updated and changes verified.';
      let screenshotPath = null;

      try {
        logger.info(`Starting execution for profile test: ${tc.id}`);
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('/profile')) {
          throw new Error('Failed to navigate to Profile page');
        }

        const isAvatarTest = tc.scenario.toLowerCase().includes('avatar') || tc.id === 'TC-040';
        if (isAvatarTest) {
          // Avatar upload path
          const sampleFile = path.resolve(__dirname, '..', '..', 'testdata', 'sample_upload.png');
          await profilePage.uploadAvatar(sampleFile);
          
          // Re-navigate to profile and confirm
          await dashboardPage.navigateToProfile();
          const avatarText = await profilePage.getText(profilePage.profileAvatarText);
          if (!avatarText) {
            throw new Error('Avatar image/tag is missing after upload');
          }
          actual = 'Profile picture uploaded and validated on avatar details component.';
        } else {
          // Standard text profile update
          await profilePage.updateProfile(tc.data.name, tc.data.email, tc.data.phone);
          
          // Re-verify from UI
          const savedName = await profilePage.getValue(profilePage.nameInput);
          if (savedName !== tc.data.name) {
            throw new Error(`Profile name failed to update. Expected: ${tc.data.name}, Got: ${savedName}`);
          }
          
          // Verify sidebar name updated
          const sidebarName = await dashboardPage.getText(dashboardPage.sidebarUserName);
          if (sidebarName !== tc.data.name) {
            throw new Error(`Sidebar name didn't update to: ${tc.data.name}`);
          }
          
          actual = `Successfully updated profile details to: Name=${tc.data.name}, Email=${tc.data.email}, Phone=${tc.data.phone}. Changes correctly synced in sidebar.`;
        }
      } catch (err) {
        status = 'FAIL';
        actual = err.message;
        if (driver) {
          screenshotPath = await profilePage.takeScreenshot(tc.id);
        }
        throw err;
      } finally {
        const duration = Date.now() - startTime;
        saveResult({
          id: tc.id,
          module: tc.module,
          scenario: tc.scenario,
          expected: tc.expected,
          actual,
          status,
          duration,
          severity: tc.severity,
          screenshotPath
        });
      }
    });
  });
});
