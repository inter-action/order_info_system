###
@author miujing
@date 2014.11.4
###


#express dependencies
express = require 'express'
path = require 'path'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'
http = require 'http'

# my dependencies
log = require './logger/logger'
routes = require './routes/routes'

ROOT_PATH = path.normalize(__dirname + '/../../')

# -------- START: express setting up
app = express()
#WARNING: IN EXPRESS 4.XX, THE ONLY BUILDED-IN MIDDLE-WARE IS STATIC MIDDLEWARE, OTHERS ARE
#ALL REMOVED FROM EXPRESS 4.XX, THEY ALL INCLUDED IN
#CONNECT(https://github.com/senchalabs/connect) PACKAGE

# set up static middleware
static_middleware_options =
    dotafiles: 'ignore'
STATIC_FILE_PATH = path.join(ROOT_PATH, 'public')
log.info("use path : #{STATIC_FILE_PATH} as static files")
app.use(express.static(STATIC_FILE_PATH, static_middleware_options))

#set view path
VIEW_PATH = path.join(ROOT_PATH, 'views')
app.set('views', VIEW_PATH)
log.info "use path: #{VIEW_PATH} as views path"

#set the view engine to ejg
app.set('view engine', 'ejs')
#enable trust proxy for  X-Forwarded-* to work
app.enable('trust proxy')

#SET UP MIDDLEWARES

## set up body-parser middleware
app.use bodyParser.urlencoded({ extended: false })  #parse application/x-www-form-urlencoded
app.use bodyParser.json()    # parse application/json
#app.use bodyParser.multipart()

## set up cookieParser middleware
app.use cookieParser()


# set up routes
app.use('/', routes)


# catch 404 error
app.use (req, res, next)->
    error = new Error('Not Found')
    error.status = 404
    next(error)


# setting up error handling stack
env = process.env.NODE_ENV || 'development'
if env is 'development'
    app.use (error, req, res, next)->
        res.status(error.status || 500)
        res.render 'error', {
            message: error.message,
            error: error
        }

#production error handler
#no stacktraces leaked to user
app.use (error, req, res, next)->
    res.status(error.status || 500)
    res.render 'error', {
        message: error.message,
        error: {}
    }


# -------- ENDS: express setting up

PORT = 3000
#app.listen PORT
app.server = http.createServer(app)
app.server.listen(PORT)

module.exports = app

console.log "app started at port: #{PORT} with env: #{env}"