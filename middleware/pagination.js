
// ?page=2&limit=1
const pagination = (model,type) => {
    return async (req, res, next)=> {

    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}
    results.success = true
    
    if (endIndex < await model.countDocuments().exec()) {
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
      // contribs: { $slice: 2 }
      if(type == 'posts'){
        results.results = await model.find({ }, {comments: 0, images: { $slice: 1}}).limit(limit).skip(startIndex).populate('user','username profileImg').exec()
        Array.isArray(results.results.images) ? results.results.images.slice(0,1) : null
      }else if(type == 'search'){
          if(req.body.search.length < 1){
            results.results = await model.find({ }, {comments: 0, images: { $slice: 1}}).limit(limit).skip(startIndex).populate('user','username profileImg').exec()
          }else{
            results.results = await model.find({title: new RegExp(req.body.search, 'i')}, {comments: 0, images: { $slice: 1}}).limit(limit).skip(startIndex).populate('user','username profileImg').exec()
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