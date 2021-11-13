utils\pskill.exe -nobanner mongod.exe
utils\pskill.exe -nobanner node.exe
del data\db\mongod.lock

cmd.exe /K utils\mongo32\bin\mongod.exe --storageEngine=mmapv1 --port=27018 --dbpath=utils/data/db --quiet &
