log = require '../logger/logger'
mongoose = require 'mongoose'

#mongoose.connect('mongodb://username:password@host:port/database?options...');
mongoose.connect('mongodb://localhost/orderinfosys')

#listen mongodb connection event
mongoose.connection.on 'errror', console.error.bind(console, 'connection error')
mongoose.connection.once 'open', ->
    console.log 'mongodb successfully connected'



# start define models

# ----------- start: user defination
UserSchemaOption =
    username: String
    money:
        type: Number
        default: 0
    privilige:
        type: Number
        default: 0
    createdTime:
        type: Date
        default: Date.now


UserModel = mongoose.model('User', userSchema = mongoose.Schema(UserSchemaOption))

# ----------- end: user defination


# ----------- start: log defination
ActionLogOption =
    relUsername: String
    relUID:
        type: mongoose.Schema.Types.ObjectId
        ref: 'User'
    description: String
    type:
        type: Number
        default: 0
    money:
        type: Number
        default: 0
    createdTime:
        type: Date
        default: Date.now

ActionLogModel = mongoose.model('ActionLog', mongoose.Schema(ActionLogOption))

ActionLogModel.TYPE =
    COMMON: 0x00 #一般日志
    MONEY: 0x01 #充值相关

# ----------- end: log defination

# ----------- end: bulletin defination
BulletinOption =
    username: String
    ip: String
    htmlBody: String
    markdownBody: String
    createdTime:
        type: Date
        default: Date.now

BulletinModel = mongoose.model('Bulletin', mongoose.Schema(BulletinOption))
# ----------- end: bulletin defination


# ----------- START: MENU ENTRY
MenuEntryOption =
    name: String
    price:
        type: Number
        default: 0
    createdTime:
        type: Date
        default: Date.now

menuEntrySchema = mongoose.Schema(MenuEntryOption)
#define an unique compound key
menuEntrySchema.index({name: 1, price: 1}, {unique: true})
MenuEntryModel = mongoose.model('MenuEntry', menuEntrySchema)
# ----------- END: MENU ENTRY

# ----------- START: Order
# WARN: NESTED SCHEMA HAS TO USE `[<SCHEMA_NAME>]` PATTERN OR REF PATTERN
OrderOption=
    orders: [
        {
            menus: [MenuEntryModel.schema],
            username: String,
            uid:
                type: mongoose.Schema.Types.ObjectId
                ref: 'User'
        }
    ]
    createdTime:
        type: Date
        default: Date.now

orderSchema = mongoose.Schema(OrderOption)
OrderModel = mongoose.model('Order', orderSchema)

# ----------- ENDS: Order

scripts=
    insertUser: (username, money)->
        user = new UserModel {
            username: username
            money: money || 0
        }

        user.save (error, userInstance)->
            if error
                console.error(error)
            else
                console.info('user inserted into database')

    insertUsers: ->
        users = ['alex', 'sam', 'will']
        scripts.insertUser(user) for user in users


    findUser: ->
        UserModel.find {name: /Alex/}, (error, docs)->
            if error
                console.error('failed to find any user results')
            else
                console.info('find result docs is: ' + docs)

    insert_menu:(menuname, price)->
        menu = new MenuEntryModel {
            name: menuname,
            price: price
        }

        menu.save (error, menu_instance)->
            if error
                console.log('failed to save :', menu)
            else
                console.log(menu.name + 'successfully saved into database')

    #create menus in databases
    #todo: should i drop it first?
    insert_menus: ->
        menus = ['noodles', 'rice', 'spagadies']
        scripts.insert_menu(menu, 10) for menu in menus


    insertBulletin: ->

        bulletin = new BulletinModel {
            username: 'alex'
            ip: '192.169.0.2'
            htmlBody: 'hey im here'
        }

        bulletin.save (error, bulletinInstance)->
            if error
                console.error(error)
            else
                console.info('new bulletin created')


module.exports =
    scripts: scripts
    UserModel: UserModel
    ActionLogModel: ActionLogModel
    BulletinModel: BulletinModel
    MenuEntryModel: MenuEntryModel
    OrderModel: OrderModel