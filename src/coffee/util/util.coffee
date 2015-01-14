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


module.exports =
    Pagination: Pagination