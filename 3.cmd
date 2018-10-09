if %1 == i goto :i
goto u

:i
npm install -g qckwinsvc
goto END

:u
npm uninstall -g qckwinsvc
goto END

:END