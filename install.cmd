
set Install_dir=D:\Locarchives

IF EXIST %Install_dir%\NodeJS goto 2

:1
call %Install_dir%\WatchAndCopy\1.cmd %Install_dir% i
echo -------------------------------------
echo -------------------------------------
echo Install interpreteur ok
echo Merci de redemarrer la machine et relancer l'install une 2eme fois
pause
goto END

:2
call %Install_dir%\WatchAndCopy\2.cmd %Install_dir%\WatchAndCopy i
call %Install_dir%\WatchAndCopy\3.cmd i
qckwinsvc --name WatchAndCopy --description "WatcherYF" --script "%Install_dir%\WatchAndCopy\server.js" --startImmediately y
echo -------------------------------------
echo -------------------------------------
echo Install ok
echo Penser à configurer le fichier %Install_dir%\WatchAndCopy\conf\conf.xml et à relancer le service WatchAndCopy
pause
goto END


:END