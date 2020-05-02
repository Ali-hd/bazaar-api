
// ?page=2&limit=1
const pagination = (model,type) => {
    return async (req, res, next)=> {

    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const city = req.query.city
    const time = req.query.time

    const convertedTime = time == 'l-d' ? 24*60*60 * 1000 :
                          time == 'l-w' ? 24*60*60 * 1000 * 7 :
                          time == 'l-m' ? 24*60*60 * 1000 * 30 :
                          time == 'l-q' ? 24*60*60 * 1000 * 90 : { }

    const filterTime = time == 'a-t' ? { $exists: true} : {$gt:new Date(Date.now() - convertedTime)}

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}
    results.success = true
    
    if (endIndex < await model.countDocuments( city=='all' ? { } : {location: city}).exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      if(type == 'posts'){
        console.log(city, time)
          results.results = await model.find(city=='all' ? {"createdAt": filterTime} : {location: city,"createdAt": filterTime }, {comments: 0, images: { $slice: 1}}).sort({ _id: -1 }).limit(limit).skip(startIndex).populate('user','username profileImg').exec()

      }else if(type == 'search'){

          if(req.body.search.length < 1){
            results.results = await model.find(city=='all' ? {"createdAt": filterTime} : {location: city, "createdAt": filterTime}, {comments: 0, images: { $slice: 1}}).sort({ _id: -1 }).limit(limit).skip(startIndex).populate('user','username profileImg').exec()
          }else{
            results.results = await model.find( city == 'all' ? {title: new RegExp(req.body.search, 'i'),"createdAt": filterTime} : {title: new RegExp(req.body.search, 'i'), location: city, "createdAt": filterTime}, {comments: 0, images: { $slice: 1}}).sort({ _id: -1 }).limit(limit).skip(startIndex).populate('user','username profileImg').exec()
          }

      }else{
          results.results = {}
      }
      
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message, success: false })
    }
  }
}

module.exports = pagination;