const TypeProduct = require('../models/type_product');  // Import model TypeProduct

// Lấy danh sách tất cả loại sản phẩm
exports.getTypeProducts = async (req, res) => {
  try {
    const types = await TypeProduct.find();  
    res.json(types);  
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi khi lấy danh sách loại sản phẩm' });
  }
};

// Lấy loại sản phẩm theo ID
exports.getTypeProductById = async (req, res) => {
  const { typeId } = req.params;  // Lấy typeId từ URL

  try {
    const typeProduct = await TypeProduct.findById(typeId); 

    if (!typeProduct) {
      return res.status(404).json({ msg: 'Loại sản phẩm không tồn tại' });
    }

    res.json(typeProduct);  // Trả về dữ liệu loại sản phẩm
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi khi lấy loại sản phẩm' });
  }
};

// Thêm loại sản phẩm mới
exports.addTypeProduct = async (req, res) => {
  const { type_name } = req.body; 
  try {
    const newTypeProduct = new TypeProduct({
      type_name,
    });

    await newTypeProduct.save();  
    res.status(201).json({ msg: 'Loại sản phẩm đã được thêm thành công', newTypeProduct });
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi khi thêm loại sản phẩm' });
  }
};

// Cập nhật loại sản phẩm
exports.updateTypeProduct = async (req, res) => {
  const { typeId } = req.params;  
  const { type_name } = req.body;  

  try {
    const typeProduct = await TypeProduct.findById(typeId); 
    if (!typeProduct) {
      return res.status(404).json({ msg: 'Loại sản phẩm không tồn tại' });
    }

    // Cập nhật thông tin loại sản phẩm
    typeProduct.type_name = type_name || typeProduct.type_name;

    await typeProduct.save();  
    res.json({ msg: 'Loại sản phẩm đã được cập nhật thành công', typeProduct });
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server khi cập nhật loại sản phẩm' });
  }
};

// Xóa loại sản phẩm
exports.deleteTypeProduct = async (req, res) => {
  const { typeId } = req.params;  

  try {
    const typeProduct = await TypeProduct.findById(typeId);  

    if (!typeProduct) {
      return res.status(404).json({ msg: 'Loại sản phẩm không tồn tại' });
    }

    await TypeProduct.findByIdAndDelete(typeId);  
    res.json({ msg: 'Loại sản phẩm đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server khi xóa loại sản phẩm' });
  }
};
