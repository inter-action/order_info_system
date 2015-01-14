getUserHomeDirectory = ()->
    process.env[if process.platform is 'win32' then 'USERPROFILE' else 'HOME']

CONSTANTS = 
    # image folder path, with a default value of course
    LOG_PATH: process.env.LOG_PATH || getUserHomeDirectory() + '/temp/log'

module.exports = CONSTANTS

console.log('** CONSTANT MODULE LOADED **')