bunyan = require 'bunyan'
fs = require 'fs'
mkdirp = require 'mkdirp'
constant = require '../constant/constant'


create_file_if_not_exsited = (files)->
    f = (path)->
        try
            fs.statSync(path)
        catch e
            if e.errno == 34 and e.code == 'ENOENT' #file not exsited
                #file not exsited
                index = path.lastIndexOf('/')
                if index != -1
                    mkdirp.sync(path.substring(0, index))
                console.log('create file in path: ' + path)
                fs.openSync(path, 'w')

    f(file) for file in files



ERROR_FILE = constant.LOG_PATH + '/myapp-error.log'
DEV_FILE = constant.LOG_PATH + '/myapp-dev.log'

console.log("use log paths: \n #{ERROR_FILE}\n#{DEV_FILE}")

create_file_if_not_exsited([ERROR_FILE, DEV_FILE])

bunyan_options =
    name: "myapp"
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },{
            stream: process.stderr,
            level: 'error'
        },{
            path: ERROR_FILE,  # log ERROR and above to a file
            level: 'error'
        },{
            path: DEV_FILE,
            level: 'debug'
        }
    ]

logger = bunyan.createLogger bunyan_options

module.exports = logger
     

console.log('** LOGGER MODULE LOADED **')