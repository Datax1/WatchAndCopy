if %2 == i goto :i
goto u

:i
msiexec.exe /i %1\\WatchAndCopy\node-v8.12.0-x64.msi INSTALLDIR=%1\NodeJS /quiet
goto END

:u
msiexec.exe /x %1\\WatchAndCopy\node-v8.12.0-x64.msi /quiet
goto END


:END

