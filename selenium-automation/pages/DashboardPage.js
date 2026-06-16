const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    // Nav elements
    this.navDashboard = '#navDashboard';
    this.navProfile = '#navProfile';
    this.navSettings = '#navSettings';
    this.navLogout = '#navLogout';
    
    // Sidebar elements
    this.sidebarUserName = '#sidebarUserName';
    this.menuToggle = '#menuToggle';
    
    // Notifications elements
    this.btnNotifications = '#btnNotifications';
    this.notifBadge = '#notifBadge';
    this.clearNotificationsBtn = '#clearNotificationsBtn';
    this.notificationsDropdown = '#notificationsDropdown';
    this.noNotifMsg = '#noNotifMsg';
    
    // Stats elements
    this.welcomeUserName = '#welcomeUserName';
    this.activeWorkoutsCount = '#activeWorkoutsCount';
    this.totalDurationCount = '#totalDurationCount';
    
    // Search & Filter
    this.searchBar = '#searchBar';
    this.categoryFilter = '#categoryFilter';
    this.btnApplySearch = '#btnApplySearch';
    this.btnClearFilters = '#btnClearFilters';
    this.workoutTable = '#workoutTable';
    this.noWorkoutsMsg = '#noWorkoutsMsg';
    this.workoutRows = '.workout-row';
    
    // CRUD elements
    this.workoutNameInput = '#workoutNameInput';
    this.workoutCategoryInput = '#workoutCategoryInput';
    this.workoutDurationInput = '#workoutDurationInput';
    this.btnSubmitWorkout = '#btnSubmitWorkout';
    
    // File elements
    this.fileUploadInput = '#fileUploadInput';
    this.btnUploadFile = '#btnUploadFile';
    this.btnDownloadReport = '#btnDownloadReport';
    this.btnDownloadBackup = '#btnDownloadBackup';
    
    // Upload Success Elements
    this.uploadSuccessMsg = '#uploadSuccessMsg';
    this.uploadSuccessBackBtn = '#uploadSuccessBackBtn';
  }

  async navigateToProfile() {
    await this.click(this.navProfile);
  }

  async navigateToSettings() {
    await this.click(this.navSettings);
  }

  async logout() {
    await this.click(this.navLogout);
  }

  async toggleNotifications() {
    await this.click(this.btnNotifications);
  }

  async clearNotifications() {
    await this.click(this.clearNotificationsBtn);
  }

  async searchWorkout(keyword) {
    await this.type(this.searchBar, keyword);
    await this.click(this.btnApplySearch);
    await this.driver.sleep(1000);
  }

  async filterByCategory(category) {
    await this.selectDropdownByValue(this.categoryFilter, category);
    await this.driver.sleep(1000);
  }

  async resetFilters() {
    await this.click(this.btnClearFilters);
    await this.driver.sleep(1000);
  }

  async addWorkout(name, category, duration) {
    await this.type(this.workoutNameInput, name);
    await this.selectDropdownByValue(this.workoutCategoryInput, category);
    await this.type(this.workoutDurationInput, String(duration));
    await this.click(this.btnSubmitWorkout);
    await this.driver.sleep(1000);
  }

  async deleteWorkout(id) {
    const selector = `#delete-wk-${id}`;
    await this.click(selector);
    // Accept alert dialog
    try {
      const alert = await this.driver.switchTo().alert();
      await alert.accept();
    } catch (e) {
      // alert might not pop up on custom layouts, or it's native
    }
  }

  async editWorkoutClick(id) {
    const selector = `#edit-wk-${id}`;
    await this.click(selector);
  }

  async uploadFile(absoluteFilePath) {
    await this.type(this.fileUploadInput, absoluteFilePath);
    await this.click(this.btnUploadFile);
    await this.driver.sleep(1000); // Allow upload request processing
  }

  async getWorkoutsCount() {
    const rows = await this.findElements(this.workoutRows);
    return rows.length;
  }
}

module.exports = DashboardPage;
