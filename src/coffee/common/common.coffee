Date::trim = ->
    new Date(this.getFullYear(), this.getMonth()+1, this.getDay())

Date::shift = (milisecs)->
    new Date(this.getTime() + milisecs)

Date.A_DAY = 24 * 3600 * 1000

class Pagination
    constructor: (@pageno, @max) ->
        @skip = (pageno - 1) * max
        @total = 0

    query: (query, success_callback, failure_callback)->
        promise = query.skip(@skip).limit(@max).exec()
        promise.then( (results)=>
            @results = results

            delete query.options.sort#fix: Error: sort cannot be used with count
            #remove pagination so we can find the count we wanted
            delete query.options.skip
            delete query.options.limit

            query.count().exec()
        ).then( (total)=>
            @total = total

            success_callback(this)
        ).then(null, (error)->
            failure_callback(error)
        )


class EventHub
    constructor:->
        #nothing need to be intialized

    subscribe: (namespace, callback)->
        if not @register_hub[namespace]
            @register_hub[namespace] = []
        cbs = @register_hub[namespace]
        if _.indexOf(cbs, callback) is -1
            cbs.push(callback)

    unsubscribe: (namespace, callback)->
        cbs = @register_hub[namespace]
        if _.isArray(cbs) && _.indexOf(cbs, callback) isnt -1
            idx = _.indexOf(cbs, callback)
            cbs.splice(idx, 1)

    publish: (namespace, args)->
        cbs = @register_hub[namespace]
        if _.isArray(cbs)
            callback.apply(@, args) for callback in cbs

eventHub = new EventHub()

new_exception = (msg, code)->
    e = new Error(msg)
    e.code = code || 0x1001
    e

exceptions =
    validation: (msg)->
        new_exception(msg, 0x1002)

module.exports =
    Pagination: Pagination
    exceptions: exceptions
    eventHub: eventHub