const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ cho Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Thư mục lưu trữ file tải lên
    },
    filename: (req, file, cb) => {
        cb(null, 'image-' + Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
    }
});

const upload = multer({ storage: storage });

module.exports = upload;