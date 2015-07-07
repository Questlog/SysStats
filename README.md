# SysStats
Getting the CPU/RAM stats of a Linux-Server via Nodejs and Websockets.

Usually you get the System-Stats each second or so. That would be enough. But I wanted more.

NodeJs will currently read `/proc/meminfo` and `/proc/cpuinfo` each 100ms. 

Linux will generate the files each time they get read. So reading them too often will generate unnecessary load.
But doesn't it look fancy to see a graph flowing by? 

Shure it does. That's why CanvasJs is used to display them. They are sent as JSON via a Websocket to the Browser.

### Why?

To try stuff. 
