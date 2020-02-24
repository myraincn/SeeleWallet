var refreshAccount = require('./src/js/getBalance.js');
// var SeeleClient = require('./src/api/seeleClient');
// seeleClient = new SeeleClient();

function moreAbout(account, phrase){
    // console.log(account);
    //place your filename, shard and publickey on the top
    //which you can then use to 
    var acc = JSON.parse(account)
    $('.more-filename').html(acc.filename.replace(/\[sPaCe\]/g, "\ "))
    $('.more-shard').html(phrase + acc.shard)
    $('.more-publickey').html(acc.pubkey)
    
    $('.morepopup').show()  
    $('.dask').show()
    
    $('.dask').click ( function () { clearMoreAbout(); } )
    $('.copy-pub').click( function(){ toclip($('.more-publickey').html()); } )
    $('.copy-key').click( function(){ toclip(acc.pubkey); } )
    $('.move-key').click( function(){ moveKeyfileTo(acc.filename); } )
}

function clearMoreAbout() {
  // hide
  $('.morepopup').hide()
  $('.dask').hide()
  $('.dask').off()
  
  // clear fields
  $('.passwordfield').val('')
  $('.more-filename').val('')
  $('.more-shard').val('')
  $('.more-publickey').val('')
  // disable options
  $('.copy-pri').removeClass("enabledOption")
  $('.copy-pri').addClass("disabledOption")
  $('.option').off()
  // update account if move happened
  refreshAccount()
}

function unlockmore() {
    var pass = $('.passwordfield-more').val()
    $('.passwordfield-more').val('')
    var file = $('.more-filename').html()
    var key = fs.readFileSync(seeleClient.accountPath+file).toString()
    seeleClient.decKeyFile(file,pass).then( 
      function(result){
        layer.msg("unlock success!")
        $('.copy-pri').removeClass("disabledOption")
        $('.copy-pri').addClass("enabledOption")
        $('.prikey').html(result)
        $('.copy-pri').click( function(){ toclip(result); } )
      }, 
      function(error){
        $('.morepopup').addClass("smh")
        setTimeout(function(){ $('.morepopup').removeClass("smh"); }, 200);
      })
}

function moveKeyfileTo( f ) {
    var { dialog } = require('electron').remote
    // var fsPromises = require('fs').promises
    var file    = f.replace(/\[sPaCe\]/g, "\ ")
    var dstpath = dialog.showOpenDialog(
      { properties: ['openDirectory'],
        buttonLabel: 'Export To'})
    var srcpath = seeleClient.accountPath;
    var success = false
    try {
      fs.copyFileSync(srcpath+file, dstpath+'/'+file, fs.constants.COPYFILE_EXCL);
      try {
        fs.unlinkSync(srcpath+file)
        success = true;
      } catch (e) {
        console.log(e)
      }
    } catch (e) {
      console.log(e);
    }
    if(success){ layer.msg('move success') } else { layer.msg('move failed') }
    setTimeout(function(){}, 500);
}


