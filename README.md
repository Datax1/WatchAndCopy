### PRODUCT Change 
>Vers 0.2.2:
 - Possibilité de changé le format du hash (sha256, sha512 etc...) => le parametrage se fait via le conf.xml
 - Modification du conf.js


>Vers 0.2.1:
 - Passage du hash du md5 au sha256 (Ajout prévisionnel de pouvoir laisser le choix du hash dans le fichier de conf)
 - Correction du readme

>Vers 0.2.0:
 - Ajoute le Hash des fichiers (pour vérifier leur intégrité):\
 - Les hash sont ajouté sous forme d'info dans les logs\
 - En cas d'erreur le processus est interrompu.


______________________________________________________________________
# INTRODUCTION
>Il s’agit d’une application Watch Directory.

Qui surveille un ou plusieurs dossiers, puis peut :
- Copier les fichiers.
-  Déplacer les fichiers
-  Exécuter script un PowerShell (ou une commande powershell)


## PREREQUIS	
-	Windows (La doc et le package d’installation sont prévu pour Windows)

## PROCEDURE D’INSTALLATION WINDOWS
__Si Node n'est pas installé:__
- Décompresser le zip (WatchAndCopy.zip) dans le dossier d’installation (exemple : D:\Locarchives\WatchAndCopy )
- Editer le fichier « install.cmd »
Et modifier la ligne « set Install_dir=D:\Locarchives » pour y mettre le dossier d’installation
- Exécuter l’install.cmd en tant qu’administrateur.
- Redémarrer la machine.
- Exécuter une 2eme fois l’install.cmd en tant qu’administrateur.

__Si Node est installé:__
``` 
npm install
npm install -g qckwinsvc
qckwinsvc --name WatchAndCopy --description "WatcherYF" --script "%Install_dir%\server.js" --startImmediately y
```
## L’INSTALLATION A AJOUTE UN SERVICE
 - Il faut démarrer le service.

### CONFIGURATION
Le fichier de configuration se trouve dans <install_dir>\conf\conf.xml : 
```
<watchdir>
<!-- On peut scanner autant de dossier que voulu, il suffie de copier la totalité des balises Folder -->
    <folder>
    <!-- scan = chemin -->
        <scan>D:/ProjetsNJS/test/1</scan>
    <!-- ignoreInitial = ignore les fichier présent initialement dans le dossier -->
        <ignoreInitial>true</ignoreInitial>
    <!-- awaitWriteFinish = attend la fin de modification ou lance les evenement dès l'apparition du fichier -->
        <awaitWriteFinish>true</awaitWriteFinish>
    <!-- stabilityThreshold = attend que le fichier ne soit pas modifié depuis 300ms pour considéré que la modification est fini -->
        <stabilityThreshold>300</stabilityThreshold>
    <!-- pollInterval = verifi la modification de taille de fichier toutes les 100ms (A augmenter si l'on surverille un dossier réseau) -->
        <pollInterval>100</pollInterval>
        <actions>
        <!-- enrase = ecrase le fichier si deja présent -->
        <!-- datejour = créé un dossier à la date du jour (YYYYMMJJ) dans le dossier de destination -->
        <!-- plusieurs copy peuvent etre effectuées -->
            <copy enrase='true' datejour='true'>D:/ProjetsNJS/test/sav/</copy>
            <copy enrase='true' datejour='false'>D:/ProjetsNJS/test/3/</copy>
        <!-- enrase = ecrase le fichier si deja présent -->
        <!-- datejour = créé un dossier à la date du jour (YYYYMMJJ) dans le dossier de destination -->
        <!-- Un seul move peut etre effectuées -->
            <move enrase='true' datejour='false'>D:/ProjetsNJS/test/4/</move>
        <!-- Execute un script powershell et passe le chemin de fichier en parametre -->
        <!-- exemple, pour c:\script.ps1 cela executera c:\script.ps1 d:\chemincomplet\dufichier.txt -->
            <ps1>echo test: </ps1>
        </actions>
    </folder>
</watchdir>
```

Il est possible de mettre autant de balise « copy » que l’on désire (le fichier sera alors copié à plusieurs endroits).
Une seule balise « move » et «ps1 » est autorisé.

L’on peut surveiller plusieurs dossiers en copiant tous le bloc folder, exemple : 
```
<watchdir>
<!-- On peut scanner autant de dossier que voulu, il suffie de copier la totalité des balises Folder -->
    <folder>
    <!-- scan = chemin -->
        <scan>D:/ProjetsNJS/test/1</scan>
    <!-- ignoreInitial = ignore les fichier présent initialement dans le dossier -->
        <ignoreInitial>true</ignoreInitial>
    <!-- awaitWriteFinish = attend la fin de modification ou lance les evenement dès l'apparition du fichier -->
        <awaitWriteFinish>true</awaitWriteFinish>
    <!-- stabilityThreshold = attend que le fichier ne soit pas modifié depuis 300ms pour considéré que la modification est fini -->
        <stabilityThreshold>300</stabilityThreshold>
    <!-- pollInterval = verifi la modification de taille de fichier toutes les 100ms (A augmenter si l'on surverille un dossier réseau) -->
        <pollInterval>100</pollInterval>
        <actions>
        <!-- enrase = ecrase le fichier si deja présent -->
        <!-- datejour = créé un dossier à la date du jour (YYYYMMJJ) dans le dossier de destination -->
        <!-- plusieurs copy peuvent etre effectuées -->
            <copy enrase='true' datejour='true'>D:/ProjetsNJS/test/sav/</copy>
            <copy enrase='true' datejour='false'>D:/ProjetsNJS/test/3/</copy>
        <!-- enrase = ecrase le fichier si deja présent -->
        <!-- datejour = créé un dossier à la date du jour (YYYYMMJJ) dans le dossier de destination -->
        <!-- Un seul move peut etre effectuées -->
            <move enrase='true' datejour='false'>D:/ProjetsNJS/test/4/</move>
        <!-- Execute un script powershell et passe le chemin de fichier en parametre -->
        <!-- exemple, pour c:\script.ps1 cela executera c:\script.ps1 d:\chemincomplet\dufichier.txt -->
            <ps1>echo test: </ps1>
        </actions>
    </folder>
    <folder>
    <!-- scan = chemin -->
        <scan>D:/ProjetsNJS/test/2</scan>
    <!-- ignoreInitial = ignore les fichier présent initialement dans le dossier -->
        <ignoreInitial>true</ignoreInitial>
    <!-- awaitWriteFinish = attend la fin de modification ou lance les evenement dès l'apparition du fichier -->
        <awaitWriteFinish>true</awaitWriteFinish>
    <!-- stabilityThreshold = attend que le fichier ne soit pas modifié depuis 300ms pour considéré que la modification est fini -->
        <stabilityThreshold>300</stabilityThreshold>
    <!-- pollInterval = verifi la modification de taille de fichier toutes les 100ms (A augmenter si l'on surverille un dossier réseau) -->
        <pollInterval>100</pollInterval>
        <actions>
        <!-- enrase = ecrase le fichier si deja présent -->
        <!-- datejour = créé un dossier à la date du jour (YYYYMMJJ) dans le dossier de destination -->
        <!-- plusieurs copy peuvent etre effectuées -->
            <copy enrase='true' datejour='true'>D:/ProjetsNJS/test/sav/</copy>
            <copy enrase='true' datejour='false'>D:/ProjetsNJS/test/3/</copy>
        <!-- enrase = ecrase le fichier si deja présent -->
        <!-- datejour = créé un dossier à la date du jour (YYYYMMJJ) dans le dossier de destination -->
        <!-- Un seul move peut etre effectuées -->
            <move enrase='true' datejour='false'>D:/ProjetsNJS/test/4/</move>
        <!-- Execute un script powershell et passe le chemin de fichier en parametre -->
        <!-- exemple, pour c:\script.ps1 cela executera c:\script.ps1 d:\chemincomplet\dufichier.txt -->
            <ps1>echo test: </ps1>
        </actions>
    </folder>
</watchdir>
```

Il faut redémarrer le service Windows après avoir modifié le xml.

### EMPLACEMENT DES LOGS
Les logs sont placé dans <Install_dir>\log
Le système crée un fichier de log par jour, et y log (La détection de fichier, les actions et les erreurs)
