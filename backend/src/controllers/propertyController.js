const Property = require('../models/Property');
const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');

// Helper function to calculate completion status
const updateCompletionStatus = (prop) => {
  const status = {
    basicInfo: !!(prop.name && prop.type && prop.state && prop.city && prop.address),
    images: !!(prop.images && prop.images.length >= 5),
    pricing: !!(prop.pricePerDay || prop.monthlyPrice),
    razorpay: !!(prop.razorpayPaymentId) // This would be checked if host has linked Razorpay
  };
  prop.completionStatus = status;
  return prop;
};

exports.listProperties = async (req, res) => {
  try {
    const { city, type } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (type) filter.type = type;
    const props = await Property.find(filter).limit(100);
    res.json({ properties: props });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id).populate('host', 'name email avatar');
    if (!prop) return res.status(404).json({ message: 'Not found' });
    updateCompletionStatus(prop);
    res.json({ property: prop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const hostId = req.userId;
    const data = req.body;
    let images = [];
    if (req.files && req.files.length) {
      for (const f of req.files) {
        const r = await uploadImage(f.path, 'properties');
        images.push(r.secure_url);
        try { fs.unlinkSync(f.path); } catch (e){}
      }
    }
    data.images = images;
    data.host = hostId;
    let prop = await Property.create(data);
    prop = updateCompletionStatus(prop);
    res.json({ property: prop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Not found' });
    if (String(prop.host) !== String(req.userId)) return res.status(403).json({ message: 'Forbidden' });
    const data = req.body;
    if (req.files && req.files.length) {
      let images = prop.images || [];
      for (const f of req.files) {
        const r = await uploadImage(f.path, 'properties');
        images.push(r.secure_url);
        try { fs.unlinkSync(f.path); } catch (e){}
      }
      data.images = images;
    }
    Object.assign(prop, data);
    await prop.save();
    updateCompletionStatus(prop);
    res.json({ property: prop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listHostProperties = async (req, res) => {
  try {
    const props = await Property.find({ host: req.userId });
    // Update completion status for each property
    const propsWithStatus = props.map(prop => updateCompletionStatus(prop));
    res.json({ properties: propsWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
