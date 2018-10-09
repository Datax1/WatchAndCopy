if %2 == i goto :i
goto u

:i
npm install %1 --prefix %1
goto END

:u
npm uninstall %1 --prefix %1

goto END
:END