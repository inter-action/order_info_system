###
@miujing
created 2014.11.3
main express routes configuration
###
express = require('express')
_un = require 'underscore'

log = require '../logger/logger'
models = require '../models/models'
dao = require '../dao/dao'
common = require '../common/common'

router = express.Router()



#route middleware that will happen on every request
#log each request to the console

# router.user (req, res, next)->
#     console.log(req.method, req.url)
#     next()

#---------------- STARTS: CONFIG ROUTTS MIDDLEWARE

router.param 'user', (req, res, next, userid)->
    # WARN: find donest work in this example, will throw `Cast to ObjectId failed for value` exception
    # models.UserModel.find({'_id', userid}).exec().then(
    models.UserModel.findById(userid).exec().then(
        (user)->
            req.user = user
            next()

        (error)->
            res.status(404).send('user not found')
    )


#---------------- STARTS: CONFIG ROUTTS MIDDLEWARE



#GET home page
router.get '/', (req, res)->
    context =
        appName: '订单信息系统'
    res.render 'pages/index', {context: context}

# angularjs demo page
router.get '/angularjs', (req, res)->
    res.render 'pages/angularjs_demo'


#----------- start: USER ROUTES
if router
    router.get '/users.json', (req, res)->
        models.UserModel.find({}).exec().then(
            (userlist)->
                res.json(userlist)
            (error)->
                res.status(500).send(error.stack)
        )


    router.post '/users', (req, res)->
        if not req.body.username
            throw new common.exceptions.validation('username is required')

        user = new models.UserModel {
            username: req.body.username
        }

        user.save (error, userInstance)->
            if error
                res.status(500).send(error.stack)
            else
                res.json(userInstance)


    #find a specific user
    router.get '/users/:user.json', (req, res)->
        res.json(req.user)


    #update user info
    router.post '/users/:user', (req, res)->
        money = req.body.money || 0
        user = req.user
        moneylog = null
        if money isnt 0
            user.money += money
            #(relusername, reluid, description, money)->
            moneylog = dao.LOG.new_money_log(user.username, user._id, "账户金额改变 #{money} 元", money)

        user.save (error, user)->
            if error
                res.status(500).send(error.stack)
            else
                moneylog.save (error, moneylog)->
                    if error
                        log.error("save log failed: #{error.message}, logdata: #{JSON.stringify(moneylog)}")
                res.json(user)

#----------- ends: USER ROUTES


#----------- start: MENU ENTRY ROUTES
if router
    # create a new menu
    # @name, @price is required
    router.post '/menus', (req, res)->
        menu_entry = new models.MenuEntryModel(req.body)

        menu_entry.save (error, menu_entry_instance)->
            if error
                res.status(500).send(error.stack)
            else
                res.json(menu_entry_instance)

    # get list of menus
    router.get '/menus.json', (req, res)->
        models.MenuEntryModel.find({}).exec().then(
            (menus)->
                res.json(menus)
            (error)->
                res.status(500).send(error.stack)
        )


#----------- ends: MENU ENTRY ROUTES

#----------- start: MoneyLog ROUTES
router.get '/logs.json', (req, res)->

    pageno = req.query.pageno || 1
    max = req.query.max || 100

    data = {}
    data.relUID = req.query.relUID if req.query.relUID
    data.type = req.query.type if req.query.type

    pagination = new common.Pagination(pageno, max)
    query = models.ActionLogModel.find(data).sort('-createdTime')#order by createdTime desc
    pagination.query(query,
        (page)->
            res.json(page)
        (error)->
            res.status(500).send(error.stack)
    )


#----------- start: MoneyLog ROUTES

#----------- start: BOARD ROUTES

if router
    router.get '/board/list', (req, res)->
        res.render 'pages/board'

    router.get '/board/list.json', (req, res)->
        today = new Date().trim()
        pageno = req.query.pageno || 1
        max = req.query.max || 100
        date = if req.query.date then new Date(req.query.date)  else today
        pagination = new common.Pagination(pageno, max)

        next_day = date.shift(Date.A_DAY)

        #sort('-createdTime') desc order by field createdTime
        query = models.BulletinModel.find({'createdTime': {"$gte": date, "$lt": next_day}}).sort('createdTime')

        pagination.query( query,
            (page)->
                res.json(page)
            (error)->
                printError(res, error)
        )

#----------- end: BOARD ROUTES


#----------- start: ORDER ROUTES
if router
    router.post '/orders', (req, res)->
        order =  new models.OrderModel(req.body)

        order.save (error, order_instance)->
            if error
                res.status(500).send(error.stack)
            else
                res.json(order_instance)


#----------- end: ORDER ROUTES



#----------- start: ADMIN ROUTES
if router
    router.get '/admin/users', (req, res)->
        res.render 'pages/admin/users'

    router.get '/admin/menus', (req, res)->
        res.render 'pages/admin/menus'

#----------- start: ADMIN ROUTES

#------------ start: SSE(Server Side Event), EXPERIMENTAL!
#目前用queue数组来存放消息，并不能做到消息的分发,里边的消息是随机发送给其中一个客户端
#解决方式有
#   一是自己写个带有时间标签的队列，
#   自己写个广播,sub/pub pattern, 用session_id做key, []做listeners, 当访问这个请求的时候先注册，
#   之后，有任何消息的时候，通过遍历listeners来广播掉。可行性需要试下
#   第二个就是用redis来做消息队列的消息广播
#   -
#
#或者直接用socketio
# reference:
# http://www.html5rocks.com/en/tutorials/eventsource/basics/
#
#不继续往下写了，SSE IE下不支持，Android等移动平台也不支持

if router
    queue = []
    router.get '/events', (req, res)->
        headers=
            'Content-Type': 'text/event-stream'
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        res.set headers

        setInterval(
            ()->
                if queue.length != 0
                    data = queue.splice(queue.length-1, 1)[0]
                if data
                    content = 'data:' + JSON.stringify(data) + '\n\n'
                    res.end(content, 'utf-8')
            1000
        )

    router.get '/subscribers', (req, res)->
        res.render 'pages/sse'

    router.get '/publish', (req, res)->
        queue.push('new line', new Date().toISOString())
        res.send('ok')

    router.get '/preview', (req, res)->
        res.send(JSON.stringify(queue))


#------------ end: SSE

#------------ start: socketio
if router
    router.get '/socketio-demo', (req, res)->
        res.render 'pages/demo/socketio'

#------------ end: socketio
printError = (res, error)->
    log.error(error)
    res.status(500).send(error.stack)

router.post '/board', (req, res)->
    req.body.ip = req.ip
    bulletin = new models.BulletinModel(req.body)
    bulletin.save (error, bulletin)->
        if error
            res.status(500).send(error.message)
            log.debug('post /board: ', error)
        else
            res.json(bulletin)



module.exports = router

console.log('** module ./routes/routes loaded **')