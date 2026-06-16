@echo off
echo =======================================================
echo     Pushing Fitwave Frameworks to GitHub
echo =======================================================
echo.
echo Adding files...
git add .
echo Committing files...
git commit -m "Added Selenium and Appium test automation frameworks"
echo.
echo Pushing to GitHub (A browser window or popup may appear asking you to sign in)...
git push -u origin master
echo.
pause
