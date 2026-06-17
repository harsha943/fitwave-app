const path = require('path');
const { generateExcelReport } = require('./utilities/mobileReportGenerator');

// Store test results across the session
global.testResults = [];

exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    port: 4723,

    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './tests/**/*.js'
    ],
    exclude: [],

    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        // The defaults you need to have in your config
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        // The path to the APK
        'appium:app': path.resolve(__dirname, '../Fitwave/app/build/outputs/apk/debug/app-debug.apk'),
        'appium:appPackage': 'com.fitwave.app',
        'appium:appActivity': '.MainActivity',
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 240,
    }],

    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    // =====================
    // Appium Service Config
    // =====================
    services: [
        ['appium', {
            args: {
                address: 'localhost',
                port: 4723,
                relaxedSecurity: true
            },
            logPath: './'
        }]
    ],

    framework: 'mocha',
    reporters: ['spec'],
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    // =====
    // Hooks
    // =====
    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        // Collect results for each test
        global.testResults.push({
            id: test.title.split(':')[0].trim() || 'TC-UNKNOWN', // Assuming title is like "TC-001: Description"
            scenario: test.title,
            status: passed ? 'PASS' : 'FAIL',
            error: error ? error.message : null,
            duration: duration / 1000 // converting ms to seconds
        });

        // Take screenshot on failure
        if (!passed) {
            const timestamp = new Date().getTime();
            const fileName = `screenshot_${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`;
            const filePath = path.join(__dirname, 'reports', 'screenshots', fileName);
            await browser.saveScreenshot(filePath);
        }
    },

    afterSession: async function (config, capabilities, specs) {
        // Generate the Excel report after all tests in the session complete
        try {
            await generateExcelReport(global.testResults);
        } catch (err) {
            console.error('Failed to generate Excel report:', err);
        }
    }
}
