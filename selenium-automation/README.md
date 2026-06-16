# Fitwave E2E Selenium Node.js Automation Testing Framework

An enterprise-level, Page Object Model (POM) based Selenium automation testing framework using Node.js, Mocha, Allure, and ExcelJS to run E2E validation against the Fitwave Web Application.

---

## 🛠️ Technology Stack
*   **Language**: Node.js
*   **Web Automation**: Selenium WebDriver 4
*   **Test Runner**: Mocha Test Runner (supports retry, sequential, and parallel worker pools)
*   **Allure Reports**: Allure-Mocha Integration for detailed reporting dashboards
*   **Excel Reports**: ExcelJS for generating formatted spreadsheet matrices
*   **Logging**: Winston Logger for file and console stream logging
*   **Mock Server**: Express.js web server serving the responsive, secure fitness application under test

---

## 📂 Project Directory Structure

```text
selenium-automation/
├── config/
│   └── config.js              # Configuration loader for environment variables
├── pages/                     # Page Object Model (POM) classes
│   ├── BasePage.js            # Base page wrapping Selenium operations
│   ├── LoginPage.js           # Login page actions & elements
│   ├── RegisterPage.js        # Register page actions & elements
│   ├── DashboardPage.js       # Dashboard grid elements (Workouts CRUD, search, files, notifications)
│   ├── ProfilePage.js         # User Profile update and avatar upload actions
│   └── SettingsPage.js        # Settings options toggles
├── testcases/                 # Test suites divided by module folders
│   ├── login/
│   ├── registration/
│   ├── dashboard/
│   ├── profile/
│   ├── settings/
│   ├── search/
│   ├── filters/
│   ├── crud/
│   ├── fileupload/
│   ├── filedownload/
│   ├── notifications/
│   ├── reports/
│   ├── logout/
│   ├── security/
│   ├── responsive/
│   ├── businessflow/
│   └── testHelper.js          # Shared Selenium builder & results logger
├── testdata/
│   ├── generateTestData.js    # Programmatic script to generate the 125 test scenarios
│   ├── testdata.json          # Main data source defining 125 test specifications
│   └── sample_upload.png      # Mock file used for uploads verification
├── utilities/
│   ├── logger.js              # Winston logging stream builder
│   └── reportGenerator.js     # ExcelJS spreadsheet workbook compiler
├── reports/                   # Holds generated artifacts
│   ├── execution.log          # Consolidated text logs
│   ├── TestExecutionReport.xlsx # 5-tab excel report with status charts
│   └── allure-results/        # Raw data for Allure Dashboards
├── screenshots/               # Failure screenshot images folder
├── .env                       # Environment configurations (credentials, base URL, timeouts)
├── package.json               # Manifest file containing scripts and dependencies
├── runner.js                  # Main test suite runner/orchestrator
└── README.md                  # Setup and usage guide
```

---

## 🚀 Getting Started

### Prerequisites
1.  **Node.js**: Ensure Node.js (v16.0.0 or higher) is installed.
2.  **Google Chrome**: Google Chrome must be installed on the system.
3.  **Allure Commandline**: To compile/serve Allure reports, download and install Allure on your system (e.g., `npm install -g allure-commandline`).

### Setup & Installation
1.  Navigate to the `selenium-automation` folder:
    ```bash
    cd selenium-automation
    ```
2.  Install all framework dependencies:
    ```bash
    npm install
    ```

---

## 🏃 Test Execution Commands

### 1. Run All Tests (Sequential Mode)
Executes all 125 test cases sequentially, starts the mockup Express server on port 3000, and generates reports:
```bash
npm test
```

### 2. Run All Tests (Parallel Worker Mode)
Spawns multiple Chrome browser sessions and executes tests in parallel across Mocha worker pools to optimize runtime:
```bash
npm run test:parallel
```

---

## 📊 Reports & Logs

### 📑 1. Excel Execution Spreadsheet
After test completion, a file is saved at `reports/TestExecutionReport.xlsx`.
It includes **5 specialized sheets**:
*   **Sheet 1: Test Cases**: Lists the 125 scenarios mapping module classifications and expected results.
*   **Sheet 2: Execution Results**: Details status (PASS/FAIL), actual runtime outputs, and execution duration.
*   **Sheet 3: Summary**: Shows metric summaries (Total, Passed, Failed, Pass %, Fail %) along with a visual block bar chart.
*   **Sheet 4: Defect Report**: Logs defect severity, descriptive errors, and statuses for any failing assertions.
*   **Sheet 5: Failed Screenshots**: Lists links and paths to screenshot files captured at failure points.

### 📊 2. Allure Report Dashboard
To generate and view the interactive, visual Allure report dashboard:
1.  Generate report assets:
    ```bash
    npm run allure:generate
    ```
2.  Serve the dashboard in a web browser:
    ```bash
    npm run allure:serve
    ```

### 📝 3. Execution Log File
A comprehensive runtime execution log is recorded under `reports/execution.log`. You can inspect this file to audit step logs, warnings, or debug stack traces.
