
tty-to-usb-device
=================

find out the usb device path for a usb serial tty ex (/dev/ttyACM0)

lets say you have an arduino or some usb serial connected. this will find the path to the usb device it belongs to. im usaing it for the module reset-usb to kick unresponsive devices.
might only work on linux but should work on anything with /dev /sys  and probably udev for uevent files 

```js
var lookup = require('tty-to-usb'); 

lookup('/dev/ttyACM1',function(err,device,meta){
  console.log(err,device,meta)
});

```
output will be something like this.

```js
false '/dev/bus/usb/002/017' { link: '/sys/devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.4/2-1.4:1.0/tty/ttyACM1',
  usbDevice: '/sys/devices/pci0000:00/0000:00:1d.0/usb2/2-1/2-1.4',
  uevent: 'MAJOR=189\nMINOR=144\nDEVNAME=bus/usb/002/017\nDEVTYPE=usb_device\nDRIVER=usb\nPRODUCT=1d50/6051/1\nTYPE=2/0/0\nBUSNUM=002\nDEVNUM=017',
  product: 'Pinoccio',
  manufacturer: 'Pinoccio',
  serial: '9533534303635191C0C1',
  idVendor: '1d50',
  version: '1.10',
  idProduct: '6051',
  devpath: '/dev/bus/usb/002/017' }
```
