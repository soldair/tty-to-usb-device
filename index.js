var path = require('path');
var fs = require("fs");
module.exports = function(tty,cb){
  // expect /dev/ttyACM0 
  // first strip /dev/
  tty = path.basename(tty);

  var debug = {};

  var actions = [
    function ttyToDevicePath(tty,cb){
      // read the device path from the link in class for this tty
      var ttyclass = path.join("/sys/class/tty",tty)
      fs.readlink(ttyclass,function(err,target){
        if(err) return cb(err);      
        debug.link = path.resolve(path.dirname(ttyclass),target);
        cb(false,debug.link);
      });
    },
    function devicePathToUsb(device,cb){
      // i have this 
      //  /sys/devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.4/2-1.4:1.0/tty/ttyACM1
      // i need the specific usb device 
      //  /sys/devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.4

      var chunks = device.split(path.sep);
      var offset = chunks.length;
      var start = offset-3

      chunks.splice(start,3)

      var usbDevicePath = chunks.join(path.sep);

      debug.usbDevice = usbDevicePath;


      var files = [
        [path.join(usbDevicePath,'uevent'),"uevent"]
        ,[path.join(usbDevicePath,'product'),"product"]
        ,[path.join(usbDevicePath,'manufacturer')]
        ,[path.join(usbDevicePath,'serial'),'serial']
        ,[path.join(usbDevicePath,'idVendor'),'idVendor']
        ,[path.join(usbDevicePath,'idProduct'),'idProduct'] 
        ,[path.join(usbDevicePath,'version'),'version']
      ]

      readFilesKeyed(files,function(errors,data){
        // we require uevent
        if(errors.uevent) return cb(errors.uevent);
        // copy all data to debug;
        Object.keys(data).forEach(function(k){
          debug[k] = (data[k]+'').trim();
        });

        // parse uevent and get the device finally.

        var devnum;
        var busnum;

        debug.uevent.split("\n").forEach(function(l){
          var parts = l.split('=');
          var key = parts.shift();
          var value = parts.join('=');

          if(key == "DEVNUM") devnum = value;
          if(key == "BUSNUM") busnum = value; 
 
        });

        if(!devnum || !busnum) return cb(new Error("this tty does not point to a usb device i can find in /dev/bus/usb"));
        
        var devpath = "/dev/bus/usb/"+busnum+"/"+devnum;

        debug.devpath = devpath;

        cb(false,devpath); 

      });

    }
  ];

  (function next(err,data){
    if(err) return cb(err,undefined,debug);
    if(!actions.length) cb(err,data,debug);
    else actions.shift()(data,next);
  }(false,tty));

}

function readFilesKeyed(files,cb){
  var res = {};
  var errors = {};

  var c = files.length;
  while(files.length) {
    (function(){
      var file = files.shift();
      fs.readFile(file[0],function(err,buf){

        if(err) errors[file[1]] = err;
        else res[file[1]] = buf;
        c--;
        if(!c) cb(Object.keys(errors).length?errors:false,res);
      });
    }());
  }
}
