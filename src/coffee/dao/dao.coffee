###
@author miujing
@date 2014-11-6 15:23:53
###

models = require '../models/models'

LOG =
    #return new money log instance
    #@relusername related username, who's money been change
    new_money_log: (relusername, reluid, description, money)->
        moneylog =
            relUsername: relusername
            relUID: reluid
            description: description
            type: models.ActionLogModel.TYPE.MONEY
            money: money
        new models.ActionLogModel(moneylog)

module.exports =
    LOG: LOG