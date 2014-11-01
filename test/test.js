var test = require('tape');
var lookup = require('../'); 
var fs = require('fs');

// in order for this test to work you must have /dev/ttyACM1

test("can get info.",function(t){
  lookup('/dev/ttyACM1',function(err,device,meta){
    console.log(err,device,meta);

    fs.stat(device,function(err,stat){
      t.ok(stat,'must have device.');
      t.end();
    })    

  });
})


