var fs = require('fs-extra');
var timestamp = require('time-stamp');
const shell = require('node-powershell');
const fileallhash = require('file-allhash')
//Chemin d'installation
var ScriptPath = process.argv[1].substring(0,(process.argv[1].length - 9));

//Chargement de la conf de l'applis
var conf = require(ScriptPath+'/conf/conf.js');

//Chargement du module de log
const opts = {
    errorEventName:'debug',
        logDirectory:ScriptPath+'/log', // NOTE: folder must exist and be writable...
        fileNamePattern:'roll-<DATE>.log',
        dateFormat:'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger( opts );
log.setLevel(conf.conf['errorlevel']);
log.info('Fonction Log Chargé');
log.info('Niveau de log: '+conf.conf['errorlevel']);
//log.debug('preparing email');
//log.info('sending email');
//log.error('failed to send email');


const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myevent = new MyEmitter();
log.info('Fonction Event Chargé');

const { DOMParser } = require('xmldom');
const xmlToJSON = require('xmlToJSON');
xmlToJSON.stringToXML = (string) => new DOMParser().parseFromString(string, 'text/xml');

var optionsxml = conf.optionsxml;
log.info('Fonction xml parser Chargé');


//Parsage du fichier de conf xml
fs.readFile(ScriptPath + '/conf/conf.xml','UTF8' , function(err, data) {
    if(err){ 
        log.error(err); 
        return;
    }
    else
        myevent.emit('LectureConfXMLOK',data);
});
log.info('Lecture conf xml ok');

//Quand le fichier xml est valide
myevent.on('LectureConfXMLOK', function (data) {
    result = xmlToJSON.parseString(data, optionsxml);

    result.watchdir[0].folder.forEach(element => {
        myevent.emit('folderscan',element);
    });
});

var chokidar = require('chokidar');    

//On set le watchdirectory
myevent.on('folderscan', function (folder) {
    log.debug('ON folderscan: ',folder);

    if(folder._attr && folder._attr.hash)
        var hasher = folder._attr.hash._value;
    else
    var hasher = conf.hash['hash'];

    if(folder.ignoreInitial){
        if(folder.ignoreInitial[0]._text == false)
            defignoreInitial = false;
        else
            defignoreInitial = conf.watcher['defignoreInitial'];
    }
    else
        defignoreInitial = conf.watcher['defignoreInitial'];

    if(folder.awaitWriteFinish){
        if(folder.awaitWriteFinish[0]._text == false)
            defawaitWriteFinish = false;
        else
            defawaitWriteFinish = conf.watcher['defawaitWriteFinish'];

    }
    else
        defawaitWriteFinish = conf.watcher['defawaitWriteFinish'];

    if(folder.stabilityThreshold)
        defstabilityThreshold = folder.stabilityThreshold[0]._text;
    else
        defstabilityThreshold = conf.watcher['defstabilityThreshold'];

    if(folder.pollInterval)
        defpollInterval = folder.pollInterval[0]._text;
    else
        defpollInterval = conf.watcher['defpollInterval'];

    log.debug('Chargement du watcher avant instance.');
//----------------A instancier en Children-----------------------------------------------
    log.info('Chargement du watcher: ', folder.scan[0]._text);
    var foldertst = '';
    if(folder.scan[0]._text.lastIndexOf('\\') != -1 ){
        foldertst = folder.scan[0]._text.substring(0,folder.scan[0]._text.lastIndexOf('\\')+1);
        
    }
    else if(folder.scan[0]._text.lastIndexOf('/') != -1){
        foldertst = folder.scan[0]._text.substring(0,folder.scan[0]._text.lastIndexOf('/')+1);
    }
    else{
        return log.error('Dossier introubable: ', folder.scan[0]._text)
    }
    
    fs.access(foldertst, fs.constants.F_OK, (err) => {
        if(err){ 
            log.error('Le dossier: ',foldertst,' inaccessible.');
            log.info('watcher: ', foldertst,' non charge');
            return
        }
        
        var watcher = chokidar.watch([folder.scan[0]._text], {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: defignoreInitial ,
            awaitWriteFinish: defawaitWriteFinish,
            awaitWriteFinish: {
                stabilityThreshold: defstabilityThreshold, 
                pollInterval: defpollInterval
            },
            depth: 0
        });
        watcher
        .on('add', path => myevent.emit('watchadd',`${path}`, folder.actions[0], hasher))
        //.on('change', path => myevent.emit('watchmod',`${path}`))
        //.on('unlink', path => myevent.emit('watchrem',`${path}`));
    });
//----------------A instancier en Children END-----------------------------------------------

});

//----------------A instancier en Children-----------------------------------------------
//Quand un nouveau fichier est detecté
myevent.on('watchadd', function (path,actions, hasher) {
    log.info('Nouveau fichier: ', path);
    log.debug('actions', actions);

    //On determine le nom du fichier
    var filename = '';
    if(path.lastIndexOf('\\') != -1){
        filename = path.substring(path.lastIndexOf('\\')+1);
    }
    else if(path.lastIndexOf('/') != -1){
        filename = path.substring(path.lastIndexOf('/')+1);
    }
    else{
        return log.error('nom de fichier introuvable: ', path)
    }

    
    fileallhash(path, hasher, function (err, hash) {
        if (err){
            log.error(err);
            return
        }

        log.info('hash: ', hash);
       
        if(actions.copy)
            myevent.emit('copy',path,actions,filename,hasher,hash);
        else if(actions.ps1)
            myevent.emit('ps1',path,actions,filename,hasher,hash);
        else if(actions.move)
            myevent.emit('move',path,actions,filename,hasher,hash);
    });


});

//Si une copie est à effectuer.
myevent.on('copy',function (path,actions,filename,hash) {
    actions.copy.forEach(element => {
        if(element._attr.datejour._value==true)
            var date=timestamp('YYYYMMDD')+'/';
        else
            var date='';
        
        fs.access(element._text, fs.constants.W_OK, (err) => {
            if(err){ 
                log.error('Le dossier: ',element._text,'  ne peut etre ecrit. // Copie impossible');
                return
            }

            if( (!fs.existsSync(element._text+date+filename)) | element._attr.enrase._value==true ){

                fs.copy(path, element._text+date+filename, err => {
                    if (err){
                        log.error(err);
                        return
                    }
    
                    log.info('Copie de ', path,' vers ',element._text+date+filename,' ok');
    
                    if(element._attr && element._attr.hash && element._attr.hash._value == false){
                        log.info(element._text+date+filename,' ok. Pas de Hash');
                            myevent.emit('cp'+filename,'ok');
                    }
                    else{
                        fileallhash(element._text+date+filename, hasher, function (err, hash1) {
                            if (err){
                                log.error(err);
                                return
                            }
    
                            if(hash == hash1){
                                log.info('Hash de ',element._text+date+filename,': ',hash1,' ok');
                                myevent.emit('cp'+filename,'ok');
                            }
                            else{
                                log.error('Hash de ',element._text+date+filename,': ',hash1,' Nok');
                                return
                            }
                        });
                    }
    
                });
            }
            else{
                log.error('Copie de ', path,' vers ',element._text+date+filename,' impossible // Fichier Existant');
            }
        });

    });

    var count = 0;
    myevent.on('cp'+filename, function (params) {
        count++;
        if(count == actions.copy.length){
            if(actions.ps1)
                myevent.emit('ps1',path,actions,filename,hasher,hash);
            else if(actions.move)
                myevent.emit('move',path,actions,filename,hasher,hash);
        }
    });
});


//Si un move est à effectuer.
myevent.on('move',function (path,actions,filename,hasher,hash) {
    if(actions.move){
        actions.move.forEach(element => {
            if(element._attr.datejour._value==true)
                var date=timestamp('YYYYMMDD')+'/';
            else
                var date='';
            
            fs.access(element._text, fs.constants.W_OK, (err) => {
                if(err){ 
                    log.error('Le dossier: ',element._text,' ne peut etre ecrit. // Deplacement impossible');
                    return
                }
                fs.access(path, fs.constants.W_OK, (err) => {
                    if(err){ 
                        log.error(path,' Ne peut etre supprimé. // Deplacement impossible');
                        return
                    }
                    
                    if( (!fs.existsSync(element._text+date+filename)) | element._attr.enrase._value==true ){
    
                        fs.copy(path, element._text+date+filename, err => {
                            if (err){
                                log.error(err)
                                
                                return
                            }
                            log.info('Copie de ', path,' vers ',element._text+date+filename,' ok');
        
                            if(element._attr && element._attr.hash && element._attr.hash._value == false){
                                log.info(element._text+date+filename,' ok. Pas de Hash');
                                fs.remove(path, err => {
                                    if (err) return log.error(err)
                                    log.info('Supression de ',path);
                                })
                            }
                            else{
                                fileallhash(element._text+date+filename,hasher, function (err, hash1) {
                                    if (err){
                                        log.error(err);
                                        return
                                    }
        
                                    if(hash == hash1){
                                        log.info('Hash de ',element._text+date+filename,': ',hash1,' ok');
                                        fs.remove(path, err => {
                                            if (err) return log.error(err)
                                            log.info('Supression de ',path);
                                        })
                                    }
                                    else{
                                        log.error('Hash de ',element._text+date+filename,': ',hash1,' Nok');
        
                                        return
                                    }
                                    
                                });
                            }
                        });
                    }
                    else{
                        log.error('Deplacement de ', path,' vers ',element._text+date+filename,' impossible // Fichier Existant');
                    }
                });
            });
        });
    }
});

//Si un ps1 est à executer.
myevent.on('ps1',function (path,actions,filename,hasher,hash) {

    log.info('Node power-shell Chargé');
    actions.ps1.forEach(element => {
        let ps = new shell({
            executionPolicy: 'Bypass',
            noProfile: true
          });
        
        var tmp = element._text;
        var regex = /_filename_/gi;
        tmp = tmp.replace(regex, path);
        var regex = /_hash_/gi;
        tmp = tmp.replace(regex, hash);
        log.info('Execution de la commande: '+tmp);
        ps.addCommand(tmp);
        ps.invoke()
        .then(output => {
          log.info(output);
          ps.dispose();
          log.info('Déchargement du module power-shell');
          myevent.emit('ps1'+filename,'ok');
        })
        .catch(err => {
          log.error(err);
          ps.dispose();
        });
    });
    
    var count = 0;
    myevent.on('ps1'+filename, function (params) {
        count++;
        if(count == actions.ps1.length){
            if(actions.move)
                myevent.emit('move',path,actions,filename,hasher,hash);
        }
    });
});

//----------------A instancier en Children END-----------------------------------------------