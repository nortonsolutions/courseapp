


## CourseApp
#### Copyright Norton 2021

This production version assumes MongoDB is up and running on port 27017 
and uses the DB called "CourseApp" (wiredtiger) by default.

-----

Auto-startup for pm2.exe service configured with pm2-windows-service module:

Launched Git Bash in Administrative Mode, then ran the following:

[ /c/util/courseApp/utils/yarn-pm2-windows-service/node_modules/pm2-windows-service ]

$ bin/pm2-service-install -n pm2
? Perform environment setup (recommended)? Y
? Set PM2_HOME? Y
? PM2_HOME value: c:\util\courseApp\utils\node
? Set PM2_SERVICE_SCRIPTS (the list of start-up scripts for pm2)? N
? Set PM2_SERVICE_PM2_DIR (the location of the global pm2 to use with the service? Y
? Specify the directory containing the pm2 version to be used by the service:
C:\util\courseApp\utils\node\node_modules\pm2

PM2 service installed and started.

Then again in administrative mode,

$ sc \\DESKTOP-83JAE79 config pm2.exe depend= MongoDB

To check pm2 services, login to cmd or bash in Administrative mode.

$ pm2 start /c/util/courseApp/server.js -i 1 --name courseApp
$ pm2 save

(The 'pm2 save' will cause pm2 to pick up from where it leaves off on the next restart.)

-----

Manual startup of the production server:

Assuming the MongoDB process is running, start CourseApp with:

pm2 start courseApp

... which essentially runs "node /c/util/courseApp/server.js" in daemon mode.

-----

Logs are in C:\util\courseApp\utils\node\logs

-----

Development mode:

If you want to run in development mode with a standalone DB (mmapv1), 
you can startup a local MongoDB using 'startDB.bat' instead (port 27018).  
This DB has some data loaded already in the "nortonQuiz" DB instance.  
Use F5 in Visual Studio Code to launch with .env settings.

-----

TODO: Precompile the babelscript.  Currently only used for React timer component.

DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) 
is deprecated, plug in your own promise library instead: 
http://mongoosejs.com/docs/promises.html

Express-Session Warning: connect.session() MemoryStore 
is not designed for a production environment, as it will leak memory, 
and will not scale past a single process.