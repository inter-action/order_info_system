winston = require('winston')
constant = require('../constant/constant')
# require('winston-riak').Riak
# require('winston-mongo').Mongo

###
    by default, winston will exit after logging an uncaughtException.
    if this is not the behavior you want, set
    logger.exitOnError = false;
###
LOGGER_LEVEL = 'debug'
LOGGER_FILE_NAME = 'app'

logger = new (winston.Logger)({
    transports:[
        new winston.transports.Console({level: LOGGER_LEVEL})
        new winston.transports.File {
            filename: "#{constant.LOG_PATH}/#{LOGGER_FILE_NAME}.log"
            level: LOGGER_LEVEL
        }
        # new winston.transports.Couchdb({ 'host': 'localhost', 'db': 'logs' })
        # new winston.transports.Riak({ bucket: 'logs' })
        # new winston.transports.MongoDB({ db: 'db', level: 'info'})
    ]
    exceptionHandlers: [
        new winston.transports.File({ filename: "#{constant.LOG_PATH}/#{LOGGER_FILE_NAME}_exceptions.log" })
    ]
    exitOnError: false
})

module.exports = logger

console.log('** LOGGER MODULE LOADED **')
