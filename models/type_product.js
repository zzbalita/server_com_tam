const db = require('./db')
const TypeProductSchema = db.mongoose.Schema({
  type_name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const TypeProduct = db.mongoose.model('TypeProduct', TypeProductSchema);

module.exports = TypeProduct;
