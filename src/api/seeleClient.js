// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var seelejs = require('seeleteam.js');
var fs = require('fs');
var os = require("os");
var path = require('path');
var shell = require('shelljs');
var editFile = require("edit-json-file");
var process = require('process');
var tkill = require('tree-kill');
var ps = require('ps-node');

const Q = require('bluebird');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const editJsonFile = require("edit-json-file");

function seeleClient() {
  
    this.accountArray = [];
    this.accountArray2= [];
    this.langPath = `${__dirname}`+`/../json/lang.json`
    this.configpath = os.homedir()+"/.SeeleWallet/viewconfig_1.1.json";
    this.accountPath = os.homedir() + "/.SeeleWallet/account/";
    this.rcPath = os.homedir() + "/.SeeleWallet/rc/";
    this.nodeConfigPath = os.homedir() + "/.SeeleWallet/node/";
    this.txPath = os.homedir() + "/.SeeleWallet/tx/";
    this.txArray = [];
    this.txRecords = [];
    
    this.init = function () {
        if (!fs.existsSync(os.homedir() + "/.SeeleWallet/")) {
            fs.mkdirSync(os.homedir() + "/.SeeleWallet/")
            fs.mkdirSync(this.accountPath)
        }

        if (!fs.existsSync(os.homedir()+'/.SeeleWallet')){
          fs.mkdirSync(os.homedir()+'/.SeeleWallet', { recursive: true }, (err) => {if (err) throw err;})
        }
        if (!fs.existsSync(os.homedir()+'/.SeeleWallet/tx')) {
          fs.mkdirSync(os.homedir()+'/.SeeleWallet/tx', { recursive: true }, (err) => {if (err) throw err;})
        }
        if (!fs.existsSync(os.homedir()+'/.SeeleWallet/rc')) {
          fs.mkdirSync(os.homedir()+'/.SeeleWallet/rc', { recursive: true }, (err) => {if (err) throw err;})
        }
        if (!fs.existsSync(os.homedir()+'/.SeeleWallet/account')) {
          fs.mkdirSync(os.homedir()+'/.SeeleWallet/account', { recursive: true }, (err) => {if (err) throw err;})
        }
        if (!fs.existsSync(os.homedir()+'/.SeeleWallet/viewconfig_1.1.json')) {
          console.log('not found, copy');
          var err = shell.cp('-f', `${__dirname}/../json/viewconfig_1.1.json`, os.homedir()+'/.SeeleWallet/')
          console.log(err)
        }
        if (!fs.existsSync(os.homedir()+'/.SeeleWallet/lang.json')) {
          var err = shell.cp('-f', `${__dirname}/../json/lang.json`, os.homedir()+'/.SeeleWallet/')
          console.log(err)
        }
    };
    this.init()
    
    var configJson = JSON.parse(fs.readFileSync(this.configpath.toString()).toString());
    // console.log(configJson.connect);
    this.address = [0,
      configJson.connect[1],
      configJson.connect[2],
      configJson.connect[3],
      configJson.connect[4]
    ];
    
    var shardCount = 4;

    // this.address = [0,
    //   "http://117.50.97.136:18037",
    //   "http://117.50.97.136:8038",
    //   "http://107.150.102.94:8039",
    //   "http://117.50.97.136:8036"
    // ];

    this.client = [
      0,
      new seelejs(this.address[1]),
      new seelejs(this.address[2]),
      new seelejs(this.address[3]),
      new seelejs(this.address[4])
    ]

    this.getOS = function () {
        var  osName="Unknown OS";

        if (os.type().indexOf("Win")!=-1)  osName="Windows";
        if (os.type().indexOf("Darwin")!=-1)  osName="MacOS";
        if (os.type().indexOf("Linux")!=-1)  osName="Linux";
        if (os.type().indexOf("X11")!=-1)  osName="UNIX";
        if (os.type().indexOf("Android")!=-1)  osName="Android";
        if (os.type().indexOf("iPhone")!=-1)  osName="iPhone";

        // console.log(osName);
        return osName;
    };

    this.binPath = function () {
        var clientpath = `${__dirname}`;
        // app.asar : An asar archive is a simple tar-like format that concatenates files into a single file.
        // Electron can read arbitrary files from it without unpacking the whole file.
        if (clientpath.indexOf("app.asar") > 0) {
            // return clientpath.substring(0, clientpath.indexOf("app.asar")) + "/../client";
            if(this.getOS() === "MacOS") {
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "mac/client";
            } else if(this.getOS() === "Windows") { //so far, we only provide win32
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "win/client";
            } else if(this.getOS() === "Linux") {
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "linux/client";
            } else {
                console.log("the operation system may not be supported");
                return null;
            }
        } else {
            //TODO this works for dev environment, need to check path validity for packed exe
            // return "./cmd/win32/client"
            //console.log(this.getOS());
            if(this.getOS() === "MacOS") {
                return clientpath + "/../../cmd/mac/client";
            } else if(this.getOS() === "Windows") { //so far, we only provide win32
                return clientpath + "/../../cmd/win32/client";
            } else if(this.getOS() === "Linux") {
                return clientpath + "/../../cmd/linux/client";
            } else {
                console.log("the operation system may not be supported");
                return null;
            }
        }
    };

    this.nodePath = function() {
        var clientpath = `${__dirname}`;
        if (clientpath.indexOf("app.asar") > 0) {
            // return clientpath.substring(0, clientpath.indexOf("app.asar")) + "/../node";
            if(this.getOS() === "MacOS") {
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "mac/node";
            } else if(this.getOS() === "Windows") { //so far, we only provide win32
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "win/node";
            } else if(this.getOS() === "Linux") {
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "linux/node";
            } else {
                console.log("the operation system may not be supported");
                return null;
            }
        } else {
            //return "./cmd/win32/node";
            if(this.getOS() === "MacOS") {
                return clientpath + "/../../cmd/mac/node";
            } else if(this.getOS() === "Windows") { //so far, we only provide win32
                return clientpath + "/../../cmd/win32/node";
            } else if(this.getOS() === "Linux") {
                return clientpath + "/../../cmd/linux/node";
            } else {
                console.error("the operation system may not be supported");
                return null;
            }
        }
    };

    this.StartNode = function (shardNum, initiate) {

        return new Q((resolve, reject) => {
            try {
                var args = this.nonMiningArgs(shardNum);
                const proc = spawn(this.nodePath(), args);

                proc.stdout.on('data', data => {
                    resolve(data.toString())
                });
                proc.stderr.on('data', data => {
                    reject(data.toString())
                    // console.error(data.toString())
                });
            } catch (e) {
                // console.error(e)
                console.log(e.toString())
                return reject(false)
            }
        });
    };

    this.reStart = function(shardNum) {
        return new Q((resolve, reject) => {
            try {
                var args = [
                    'miner',
                    'stop'
                ];
                if (shardNum === 1) {
                    args.push('-a 127.0.0.1:8025');
                } else if(shardNum === 2){
                    args.push('-a 127.0.0.1:8022');
                } else if(shardNum === 3) {
                    args.push('-a 127.0.0.1:8023')
                } else if(shardNum === 4) {
                    args.push('-a 127.0.0.1:8024')
                }

                const proc = spawn(this.binPath(), args);

                proc.stdout.on('data', data => {
                    resolve(data);
                });

                proc.stderr.on('data', data => {
                    reject(data)
                });
            } catch (e) {
                return reject(e)
            }
        });
    };

    this.startMine = function(publickey) {
        var shardNum = this.getShardNum(publickey);
        this.killnode(shardNum);
        this.makeNodeFile(publickey, shardNum, false);
        this.execute('echo ')
        // this.execute('/Users/seele/go/src/github.com/seeleteam/SeeleWallet/cmd/mac/node start  -c /Users/seele/.SeeleWallet/node/node-1.json')

        // this.execute('nodeexc start  -c /Users/seele/.SeeleWallet/node/node-1.json')
        //start the mining node
        return new Q((resolve, reject) => {
            try {
                var args = this.miningArgs(shardNum)
                const proc = spawn(this.nodePath(), args);
                console.log(proc)
                this.execute('echo "starting mine before proc on"')
                proc.stdout.on('data', data => {
                    console.log(data.toString())
                    resolve(data.toString())
                });
                proc.stderr.on('data', data => {
                    reject(data.toString())
                });
            } catch (e) {
                // console.error(e)
                console.log(e.toString())
                return reject(false)
            }
        });
    };

    this.makeNodeFile = function(account, shard, initiate) {
    // this.makeNodeFile = function (account, privatekey, shard) {
        // cp file and save into nodepath
        var configpath = `${__dirname}`+path.sep+'..'+path.sep+'..'+path.sep+'cmd'+path.sep+'config'+path.sep
        var nodefile = configpath + 'node'+shard+'.json'
        // var dstfile = this.nodeConfigPath+path.sep+'node-'+shard+'-'+account+'.json'
        var dstfile = this.nodeConfigPath+'node-'+shard+'.json'
        if (!fs.existsSync(this.nodeConfigPath)) {
            fs.mkdirSync(this.nodeConfigPath)
        }
        shell.cp('-f', nodefile, dstfile);

        //replace files with right configs
        this.setUpNodeFile(dstfile, account, shard, initiate)
    };

    this.setUpNodeFile = function(dstfile, account, shard, initiate){

        let file = editJsonFile(dstfile);
        // Set a couple of fields
        file.set("basic.coinbase", ''+account);
        file.set("basic.dataDir", 'seeleWallet-node'+shard);
        file.set("ipcconfig.name", 'seeleWallet'+shard+'.ipc');
        //p2p privatekey
        if(initiate === true) {
            var args = [
                'key',
            ];
            args.push('--shard', shard)
            const proc = spawn(this.nodePath(), args);

            proc.stdout.on('data', data => {
                var output = `${data}`
                var privatekey = this.ParsePrivateKey(output)
                file.set("p2p.privateKey", ''+privatekey)
            });
        }
        // file.set("p2p.privateKey", ''+privatekey);

        // Save the data to the disk
        file.save();
        // Reload it from the disk
        file = editJsonFile(dstfile, {
            autosave: true
        });
    };

    this.nonMiningArgs = function(shard){
        var args = [
            'start',
        ];
        args.push('-c')
        args.push(this.nodeConfigPath+'node-'+shard+'.json')
        args.push('-m')
        args.push('stop')
        return args
    };

    this.miningArgs = function(shard){
        // var shard = this.getShardNum(account)
        var thread = 16;
        var args = [
            'start',
        ];
        args.push('-c');
        args.push(this.nodeConfigPath+'node-'+shard+'.json');
        args.push('--threads');
        args.push(thread);
        return args;
    };

    this.killnode = function (shardNum) {

        if (shardNum === '1'){
            this.execute('ps -ef | grep "node-1.json" | grep -v grep | awk {\'print $2\'} | xargs kill -9');
            console.log("node-1 is killed");
       } else if (shardNum === '2'){
           this.execute('ps -ef | grep "node-2.json" | grep -v grep | awk {\'print $2\'} | xargs kill -9');
           console.log("node-2 is killed");
       } else if (shardNum === '3'){
           this.execute('ps -ef | grep "node-3.json" | grep -v grep | awk {\'print $2\'} | xargs kill -9');
           console.log("node-3 is killed");
       } else if (shardNum === '4'){
           this.execute('ps -ef | grep "node-4.json" | grep -v grep | awk {\'print $2\'} | xargs kill -9');
           console.log("node-4 is killed");
       }
    };

    this.execute = function(command) {
        const exec = require('child_process').exec
        exec(command, (err, stdout, stderr) => {
            process.stdout.write(stdout)
        })
    };

    this.initateNodeConfig = function(shard) {
        var initiate = true
        var args = [
            'key',
        ];
        args.push('--shard', shard)
        const proc = spawn(this.nodePath(), args);

        proc.stdout.on('data', data => {
            var output = `${data}`
            var publickey = this.ParsePublicKey(output)
            this.makeNodeFile(publickey, shard, initiate)
        });
    };

    this.solcPath = function() {
        var clientpath = `${__dirname}`;
        if (clientpath.indexOf("app.asar") > 0) {
            // return clientpath.substring(0, clientpath.indexOf("app.asar")) + "/../solc";
            if(this.getOS() === "MacOS") {
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "mac/solc";
            } else if(this.getOS() === "Windows") { //so far, we only provide win32
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "win/solc";
            } else if(this.getOS() === "Linux") {
                return clientpath.substring(0, clientpath.indexOf("app.asar")) + "linux/solc";
            } else {
                console.log("the operation system may not be supported");
                return null;
            }
        } else {
            // return "./cmd/win32/solc"
            if(this.getOS() === "MacOS") {
                return clientpath + "/../../cmd/mac/solc";
            } else if(this.getOS() === "Windows") { //so far, we only provide win32
                return clientpath + "/../../cmd/win32/solc";
            } else if(this.getOS() === "Linux") {
                return clientpath + "/../../cmd/linux/solc";
            } else {
                console.error("the operation system may not be supported");
                return null;
            }
        }
    };

    this.compileContract = function (input) {
        // if (input != '') {
        // console.log(__dirname);


            return new Q((resolve, reject) => {
                // try {
                    var args = [
                        '--combined-json',
                    ];
                    args.push("bin,abi,userdoc,devdoc")
                    args.push('--optimize')
                    args.push('--')
                    args.push('-')

                    const proc = spawn(this.solcPath(), args);
                    proc.stdin.write(input);
                    proc.stdin.end();

                    proc.stdout.on('data', data => {
                        var output = `${data}`
                        var contractBinaryCode = this.ParseContractBinaryCode(output)
                        resolve(contractBinaryCode)
                    });

                    proc.stderr.on('data', data => {
                        reject(data)
                        var output = document.getElementById("compileSuccess")
                        output.innerText = data.toString()
                        console.log(data.toString())
                        output.style.display = 'block'
                     });
                // } catch (e) {
                //     return reject(e)
                // }
            });
        // }
    };

    this.ParseContractBinaryCode = function (input) {
        try {
            input = JSON.parse(input)
            // var contract = input.contracts['<stdin>:validUintContractTest'].bin
            var contracts = input.contracts;
            var contract;
            for(var key in contracts){
               contract =  contracts[key].bin;
            }
            return contract ;
        } catch (e) {
            return e.toString
        }
    };

    this.generateKey = function (shardnum) {
        this.init();
        return new Q((resolve, reject) => {
            try {
                var args = [
                    'key',
                ];
                if (shardnum == "1" || shardnum == "2" || shardnum == "3" || shardnum == "4" ) {
                    args.push('--shard', shardnum)
                }

                const proc = spawn(this.binPath(), args);

                proc.stdout.on('data', data => {
                    var output = `${data}`
                    var privatekey = this.ParsePrivateKey(output)
                    var publickey = this.ParsePublicKey(output)
                    // seeleClient.makeNodeFile(publickey,shardnum)
                    resolve({"publickey":publickey,"privatekey":privatekey})
                });

                proc.stderr.on('data', data => {
                    reject(data)
                });
            } catch (e) {
                return reject(e)
            }
        });
    };

    this.getshardnum = function (publicKey) {
        var args = [
            'getshardnum',
        ];
        args.push('--account', publicKey)
        const proc = spawnSync(this.binPath(), args);

        var info = `${proc.stdout}`
        if (info == "") {
            var err = `${proc.stderr}`
            return err
        }
        return info.replace("shard number:", "").trim()
    };

    this.keyStore = function (fileName, privatekey, passWord) {
        return new Q((resolve, reject) => {
            var args = [
                'savekey',
            ];

            var filePath = this.accountPath + fileName;

            this.accountArray.push(fileName);

            args.push("--privatekey", privatekey)
            args.push("--file", filePath)

            const proc = spawn(this.binPath(), args);

            proc.stdout.on('data', data => {
                console.log(data);
                proc.stdin.write(passWord + '\n');
                console.log(data);
                resolve(data)
            });

            proc.stderr.on('data', data => {
                reject(data)
            });
        });
    };

    this.decKeyFile = function (fileName, passWord) {
        return new Q((resolve, reject) => {
            var args = [
                'deckeyfile',
            ];

            var filePath = this.accountPath + fileName;

            args.push("--file", filePath)

            const proc = spawn(this.binPath(), args);

            proc.stdout.on('data', data => {
                proc.stdin.write(passWord + '\n');
                var output = `${data}`
                // console.log(output.slice(-67));
                if (output.indexOf("private") > 0) {
                    resolve(output.slice(-67))
                }
            });

            proc.stderr.on('data', data => {
                console.log(data.toString());
                // console.log("what?")
                reject(data)
            });
        });
    };

    this.keyfileisvalid = function (keyfilepath) {
      var fsize = fs.statSync(keyfilepath).size;
      if ( fsize <= 376 ) {
        try {
            filecontents = JSON.parse(fs.readFileSync(keyfilepath).toString());
        } catch (e) {
            return false;
        }
        try {
            if (filecontents.version != 1) { return false; }
            if(!/^[0-9a-z]{64,64}$/.test(filecontents.crypto.ciphertext)){ return false; }
            if(!/^[0-9a-z]{32,32}$/.test(filecontents.crypto.iv)){ return false; }
            if(!/^[0-9a-z]{64,64}$/.test(filecontents.crypto.salt)){ return false; }
            if(!/^0x[0-9a-z]{64,64}$/.test(filecontents.crypto.mac)){ return false; }
            return filecontents.address;
        } catch (e) {
            return false;
        }
      }
      return false;
    }

    this.accountList = function () {
        this.accountArray=[]
        if (fs.existsSync(this.accountPath)) {
            filelist = fs.readdirSync(this.accountPath)
            var publickey;
            for(i = 0; i < filelist.length; i ++){
              publickey = this.keyfileisvalid(this.accountPath+filelist[i]);
              // if ( publickey ) { this.accountArray.push(publickey); }
              console.log(`${filelist[i].split(/\ /).join('\ ')}`);
              if ( publickey ) { this.accountArray.push({
                "pubkey": publickey,
                "filename": filelist[i].split(/\ /).join('\ '),
                "shard": this.getShardNum(publickey)
              });}
            }
        } else {
            console.log(this.accountPath + "  Not Found!");
        }
        this.accountArray.sort(function(a,b){return a.shard - b.shard })
        // console.log(this.accountArray)
    };

    this.accountListPromise = function () {
        var accountArray=[]
        if (fs.existsSync(this.accountPath)) {
            filelist = fs.readdirSync(this.accountPath)
            var publickey;
            for(i = 0; i < filelist.length; i ++){
              publickey = this.keyfileisvalid(this.accountPath+filelist[i]);
              // if ( publickey ) { this.accountArray.push(publickey); }
              if ( publickey ) { accountArray.push({
                "pubkey": publickey,
                "filename": filelist[i],
                "shard": this.getShardNum(publickey)
              });}
            }
        } else {
            console.log(this.accountPath + "  Not Found!");
        }
        accountArray.sort(function(a,b){return a.shard - b.shard })
        // console.log(this.accountArray)
        return new Q((resolve, reject) => {
          try {
            resolve(accountArray)
            reject(accountArray)
          } catch (e) {
            console.log(e.toString())
            return reject(false)
          } finally {}
        });
    };

    this.getInfo = function (shard, callBack) {
      try {
          if (!/^[1-4]{1,1}$/.test( shard )) {
              console.error("invalid shardnum getInfo", shard)
          } else {
              this.client[shard].getInfo(callBack)
          }
      } catch (e) {
          console.error(e)
      }
    }

    this.getBalance = function (account, callBack) {
        publicKey = account.pubkey;
        shard = account.shard;
        try {
          if (!/^[1-4]{1,1}$/.test( shard )) {
              console.error("invalid shardnum getBalance", shard)
          } else {
              this.client[shard].getBalance(publicKey, "", -1, callBack);
          }
        } catch (e) {
            console.error("no node started in local host")
        }
    };

    this.sendtx = function (accountstr, passWord, to, amount, price, gaslimit, payload, callBack) {
        var account = JSON.parse(accountstr)
        publicKey = account.pubkey;
        shard = account.shard;
        console.log("in send:", publicKey, shard);
        if (!/^[1-4]{1,1}$/.test( shard )) {
            console.error("invalid shardnum sendtx", shard)
        } else {
            client = this.client[shard];
        }
        
        var nonce = client.sendSync("getAccountNonce", publicKey, "", -1);
        console.log("in send returned nonce: "+nonce)
        nonce+=1
        var rawTx = {
            "Type":0,
            "From": publicKey,
            "To": to,
            "Amount": parseInt(amount*Math.pow(10,8)),
            "AccountNonce": nonce,
            "GasPrice": parseInt(price),
            "GasLimit": parseInt(gaslimit),//3000000,
            "Timestamp": 0,
            "Payload": payload
        }

        var filename = account.filename.replace(/\[sPaCe\]/g, "\ ")
        console.log(filename);
        this.decKeyFile(filename, passWord).then((data) => {
            // console.log(data);
            var tx = client.generateTx(data, rawTx);
            // console.log(tx);
            //files are structured shorter because 256 limit of file writing limit
            //2 for pending, 3 for contract, 1 for success, 0 for nonce fail
            if ( rawTx.To == "0x0000000000000000000000000000000000000000") {
              var ts = this.getShardNum(rawTx.From)
            } else {
              var ts = this.getShardNum(rawTx.To)
            }
            let txRecord = {
              "t":new Date().getTime(),
              "fa":rawTx.From,
              "fs":this.getShardNum(rawTx.From),
              "ta":rawTx.To,
              "ts":ts,
              "m":rawTx.Amount,
              "s":tx.Hash,
              "n":nonce,
              "u":2
            }
            console.log(txRecord);
            client.addTx(tx, function (info, err) {
                console.log("in send returns:", info, err, tx.Hash, JSON.stringify(txRecord));
                callBack(info, err, tx.Hash, JSON.stringify(txRecord));
            });
        }).catch((data) => {
            console.log("in send returns:", data.toString());
            callBack("", new Error(data.toString()), "");
        });
    };

    this.gettxbyhash = function (hash, publickey, callBack) {
        var client
        var shard = this.getshardnum(publickey)
        if (!/^[1-4]{1,1}$/.test( shard )) {
            console.error("invalid shardnum gettxbyhash", shard)
        } else {
            client = this.client[shard];
        }

        client.getTransactionByHash(hash, callBack);
    }

    this.getShardNum = function(publickey) {
            var numberInfo = this.getshardnum(publickey);
            return numberInfo;
    }

    this.ParsePublicKey = function (input) {
        try {
            return input.substring(input.indexOf("publick key:") + 12, input.indexOf("private key:")).trim()
        } catch (e) {
            return ""
        }
    };

    this.ParsePrivateKey = function (input) {
        try {
            return input.substring(input.indexOf("private key:") + 12).trim()
        } catch (e) {
            return ""
        }
    };

    this.getblock = function (shard, hash, height, fulltx, callBack) {

        if (!/^[1-4]{1,1}$/.test( shard )) {
            console.error("invalid shardnum getBlock", shard)
        } else {
            this.client[shard].getBlock(hash, height, fulltx, callBack)
        }
    };

    this.getblockheight = function (shard, callBack) {
      if (!/^[1-4]{1,1}$/.test( shard )) {
          console.error("invalid shardnum getBlockHeight", shard)
      } else {
          this.client[shard].getBlockHeight(callBack);
      }
    };

    this.isListening = function (shard, callBack) {
      console.log(shard);
      if (!/^[1-4]{1,1}$/.test( shard )) {
          console.error("invalid shardnum isListening", shard)
      } else {
          this.client[shard].isListening(callBack);
      }
    };

    this.saveFile = function (isTx, hash) {
        if (!fs.existsSync(this.txPath)) {
            fs.mkdirSync(this.txPath)
        }
        var _path = this.txPath + hash
        fs.writeFile(_path, hash, function (err) {
            if (err)
                console.log(err.message)
        })
    };

    this.readFile = function () {
        if (fs.existsSync(this.txPath)) {
            // this.txArray = fs.readdirSync(this.txPath)
            var dir = this.txPath;
            this.txArray = fs.readdirSync(dir)
              .map(function(v) {
                  return {
                    name:v,
                    time:fs.statSync(dir + v).mtime.getTime()
                  };
               })
               .sort(function(a, b) { return b.time - a.time; })
               .map(function(v) { return v; });
        } else {
            console.log(this.txPath + "  Not Found!");
        }
    };

    this.queryContract = function (shard, hash,callBack) {
        // let hash = $('#QueryHash').text()
        if (hash != null && hash != "" && hash != undefined) {
            // var send = document.getElementById("contractPublicKey").value
            // var shard = this.getshardnum(send)
            if (!/^[1-4]{1,1}$/.test( shard )) {
                console.error("invalid shardnum getReceiptByTxHash", shard)
            } else {
                this.client[shard].getReceiptByTxHash(hash, "", callBack);
            }
        }
    };

    this.callContract = function (shard, payload, to, callBack) {
        // curl -H "Content-Type: application/json" -X POST --data '{"jsonrpc":"2.0","method":"seele_call","params":["0x47a99059219055cf8277d5d7dff933446edb0012","0x6d4ce63c",-1],"id":1}' 117.50.97.136:8036
        // let hash = $('#QueryHash').text()

            // var send = document.getElementById("contractPublicKey").value
            // var shard = this.getshardnum(send)
        console.log(to);
        console.log(shard);
        if (/^0x[0-9a-zA-Z]{40,40}$/.test(to)){
            if (!/^[1-4]{1,1}$/.test( shard )) {
                console.error("invalid shardnum getReceiptByTxHash", shard)
            } else {
                this.client[shard].call(to, payload, -1, callBack);
            }
        } else {
          // console.error("invalid contract address", to)
          alert("invalid contract address", to)
        }

    };

    this.estimateGas = function(from,to,payload,callBack) {
        var txData = {};
        txData.From = from;
        txData.To = to;
        txData.Amount = 0;
        txData.GasPrice = 0;
        txData.GasLimit = 100000000;
        txData.AccountNonce = 9999999999;
        txData.Payload = payload;
        var tx = {};
        tx.Data = txData;
        var shard = this.getshardnum(from);

        if (!/^[1-4]{1,1}$/.test( shard )) {
            console.error("invalid shardnum estimateGas", shard);
        } else {
            this.client[shard].estimateGas(tx, callBack);
        }
    }

    // this.rcPath = os.homedir() + "/.SeeleWallet/rc/";
    this.rcPath = os.homedir() + path.sep + '.SeeleWallet' + path.sep + 'rc' + path.sep;

    this.saveRecord = function(r){
      if (!fs.existsSync(this.rcPath)) {
          fs.mkdirSync(this.rcPath)
      }
      r = r.replace(/\"/g, "-")
      r = r.replace(/\:/g, ";")
      console.log(r);
      var _path = this.rcPath + r
      console.log("I'm about to write!", _path);
      fs.writeFile(_path, "", function (err) {
          console.log("huh?");
          if (err){
            console.log("oh!");
            console.log(err.message)
          }
      })
    }

    this.getRecords = function(){
      // this.txReccords = [];

      if (fs.existsSync(this.rcPath)) {
          var dir = this.rcPath;
          this.txRecords = fs.readdirSync(dir).map(
             function(x){
               try {
                 x = x.replace(/-/g,"\"")
                 x = x.replace(/;/g,"\:")
                 var y = JSON.parse(x)
                 return y;
               } catch (err){}
             }
          ).sort((a, b) => (a.t > b.t) ? -1 : 1)
             // .sort(function(a, b) { return b.time - a.time; })
             // .map(function(v) { return v; });
      } else {
          console.log(this.rcPath + "  Not Found!");
      }

      console.log(this.txRecords.length, "local tx records");
    }

    //returns wait, done/debt, fail,0x354f0905c557462999ca965775a991c529530032，
    this.verify = function(tx, callBack){
      var status = "wait"
      nonce = this.client[tx.fs].sendSync("getAccountNonce", tx.fa, "", -1);

      console.log("account nonce:",nonce,"\ntx nonce:",tx.n);
      if (nonce < tx.n) {
          console.log(tx.t,status);
          callBack(tx,status)
      } else {
          this.client[tx.fs].getTransactionByHash(tx.s, function(data){
              console.log(data.status);
              if(data.status=="pool"){
                console.log(tx.t,status);
                callBack(tx,status)
              } else if (data.status=="block") {
                // if (){
                if (tx.fs == tx.ts) {
                  status = "done"
                  // console.log(status);
                  console.log(tx.t,status);
                  callBack(tx,status)
                } else if (data.debt.Hash) {
                  status="debt"
                  console.log(data.debt.Hash,tx.ts);
                  if(data.debt.Hash)
                  // console.log(this.client[tx.ts]);
                  // this.client[tx.ts].getInfo(function(data){console.log(data);})
                  // this.client[tx.ts].getDebtByHash(data.debt.Hash,function(deb){
                  //   console.log("result of debt:",deb);
                  // })
                  // console.log(tx.t,status);
                  // console.log(data.debt.Hash, tx.ts);
                  // getDebtByHash
                  callBack(tx,status,data.debt.Hash)
                } else {
                  console.log("unthought of");
                }
                //
                // }
              } else if(data == [tx.s]) {
                console.log("isarray");
                callBack(tx,status)
              } else {
                status = "fail"
                // console.log(status);
                console.log(tx.t,status,data);
                callBack(tx,status)
              }
          })
      }
    }

    this.getDebtByHash = function(hash, shard, callBack) {
      if (!/^[1-4]{1,1}$/.test( shard )) {
          console.error("getDebtByHash", shard);
      } else {
          this.client[shard].getDebtByHash(hash, callBack);
      }
    }
}


module.exports = seeleClient;
