const Product = require("../models/product")
const Cart = require('../models/cart')
const Order = require('../models/order');  // Import Order model




exports.getProduct = async (req, res) => {
  try {
    // const products = await Product.find(); // Lấy tất cả sản phẩm từ database
    const products = await Product.find().populate('category'); // Sử dụng populate để lấy thông tin chi tiết về category

    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi khi lấy danh sách sản phẩm' });
  }
};

exports.getProductById = async (req, res) => {
  const { productId } = req.params; // Lấy productId từ params

  try {
    // Tìm sản phẩm theo id và sử dụng populate để lấy thông tin chi tiết về category (nếu cần)
    const product = await Product.findById(productId).populate('category');

    if (!product) {
      return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    }

    res.json(product);
  } catch (error) {
    console.log("err", error);
    res.status(500).json({ msg: 'Lỗi khi lấy thông tin sản phẩm' });
  }
};




exports.addProduct = async (req, res) => {
  const { name, image_url, price, description, category } = req.body;

  try {
    const product = new Product({
      name,
      image_url,
      price,
      description,
      category,
    });

    await product.save();
    res.status(201).json({ msg: 'Sản phẩm đã được thêm thành công' });
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi khi thêm sản phẩm' });
  }
};




exports.updateProduct = async (req, res) => {
  const { productId } = req.params;  // Lấy productId từ params
  const { name, image_url, price, description, category } = req.body;  // Lấy thông tin cập nhật từ body

  try {
    // Tìm sản phẩm theo productId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    }

    // Cập nhật thông tin sản phẩm
    product.name = name || product.name;
    product.image_url = image_url || product.image_url;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;

    // Lưu sản phẩm đã cập nhật vào cơ sở dữ liệu
    await product.save();

    res.json({ msg: 'Sản phẩm đã được cập nhật thành công', product });
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server khi cập nhật sản phẩm' });
  }
};



exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    } else {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    }

    await cart.save();
    res.status(201).json({ msg: 'Sản phẩm đã được thêm vào giỏ hàng' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ msg: 'Lỗi server' });
  }
};


// Lấy danh sách sản phẩm trong giỏ hàng


exports.getCart = async (req, res) => {
  const userId = req.userId;

  try {
    // Tìm giỏ hàng của người dùng
    // const cart = await Cart.findOne({ user: userId }).populate('items.product');  // Sử dụng populate để lấy thông tin chi tiết về sản phẩm

    // Tìm giỏ hàng của người dùng và populate cho sản phẩm và category
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product', // Populate cho sản phẩm
        populate: {
          path: 'category', // Populate cho category của sản phẩm
        },
      });

    if (!cart) {
      return res.status(404).json({ msg: 'Giỏ hàng trống' });
    }

    res.json(cart.items);  // Trả về danh sách sản phẩm trong giỏ hàng
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};





// Gửi đơn hàng


exports.checkout = async (req, res) => {
  const userId = req.userId;
  const { address, phoneNumber } = req.body;

  try {
    // Lấy giỏ hàng của người dùng
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Giỏ hàng của bạn đang trống' });
    }

    // Tính tổng giá trị đơn hàng
    let totalAmount = 0;
    cart.items.forEach(item => {
      totalAmount += item.product.price * item.quantity;
    });

    // Tạo đơn hàng mới
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      totalAmount,
      shippingAddress: {
        address,
        phoneNumber,
      },
    });

    // Lưu đơn hàng
    await order.save();

    // Xóa giỏ hàng sau khi đặt đơn
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({ msg: 'Đơn hàng của bạn đã được gửi thành công', order });

  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};



// Lấy danh sách đơn hàng

exports.getOrder = async (req, res) => {
  const userId = req.userId;

  try {
    // Tìm các đơn hàng của người dùng
    const orders = await Order.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ msg: 'Bạn chưa có đơn hàng nào' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server' });
  }
};



// API tìm kiếm sản phẩm theo tên
exports.search = async (req, res) => {
  console.log('API tìm kiếm được gọi với từ khóa:', req.query.q);
  const { q } = req.query;  // Lấy từ khóa tìm kiếm từ query params

  try {
    if (!q) {
      console.log('Từ khóa tìm kiếm không được cung cấp.');
      return res.status(400).json({ msg: 'Vui lòng nhập từ khóa tìm kiếm' });
    }

    // Tìm sản phẩm có tên chứa từ khóa (không phân biệt hoa thường)
    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    }).populate('category');

    if (products.length === 0) {
      console.log(`Không tìm thấy sản phẩm cho từ khóa: ${q}`);  // Log khi không tìm thấy sản phẩm
      return res.status(404).json({ msg: 'Không tìm thấy sản phẩm phù hợp' });
    }

    // Log thông tin sản phẩm tìm thấy
    console.log(`Tìm thấy ${products.length} sản phẩm cho từ khóa: ${q}`);
    res.json(products);
  } catch (error) {
    console.error('Lỗi trong khi tìm kiếm sản phẩm:', error);  // Log chi tiết lỗi
    res.status(500).json({ msg: 'Lỗi server', error: error.message });
  }
};
