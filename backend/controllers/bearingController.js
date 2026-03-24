const Bearing = require('../models/Bearing');

exports.searchBearings = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    
    const limit = parseInt(req.query.limit) || 20;
    
    const resultados = await Bearing.find({
      $or: [
        { sku: new RegExp(query, 'i') },
        { aliases: new RegExp(query, 'i') }
      ]
    }).limit(limit);
    
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBearingsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const { d_min, d_max, limit = 300, page = 1 } = req.query;
    
    let queryObj = { category: new RegExp(`^${category}$`, 'i') };
    
    if (d_min || d_max) {
      queryObj.d = {};
      if (d_min) queryObj.d.$gte = Number(d_min);
      if (d_max) queryObj.d.$lte = Number(d_max);
    }
    
    const skip = (page - 1) * limit;
    const resultados = await Bearing.find(queryObj)
      .skip(skip)
      .limit(Number(limit))
      .sort({ sku: 1 });
      
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};