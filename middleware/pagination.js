
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
      if(type == 'posts'){
        results.results = await model.find().limit(limit).skip(startIndex).populate('user','username profileImg').exec()
      }else{
        results.results = await model.find().limit(limit).skip(startIndex).exec()
      }
      
      res.paginatedResults = results
      next()
    } catch (e) {
      res.status(500).json({ message: e.message, success: false })
    }
  }
}

module.exports = pagination;