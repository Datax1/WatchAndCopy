
set Install_dir=C:\PRJET\



rem qckwinsvc --uninstall --name WatchAndCopy --script "%Install_dir%\WatchAndCopy\server.js"
call %Install_dir%\WatchAndCopy\3.cmd u
call %Install_dir%\WatchAndCopy\2.cmd %Install_dir%\WatchAndCopy u
call %Install_dir%\WatchAndCopy\1.cmd %Install_dir% i
echo -------------------------------------
echo -------------------------------------
echo Desinstallation ok
echo Il faut redemarrer l'ordinateur et supprimer le dossier %Install_dir%
pause
goto END


:END