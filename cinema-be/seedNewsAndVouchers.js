const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const News = require("./models/news.model");
const Voucher = require("./models/voucher.model");

const sampleNews = [
  {
    title: "Avatar 3: Hỏa Ngục Tro Tàn chính thức tung hình ảnh đầu tiên gây sốt",
    summary: "Đạo diễn James Cameron hứa hẹn một cuộc hành trình mãn nhãn hơn bao giờ hết, giới thiệu bộ tộc Tro Tàn đầy hung bạo của hành tinh Pandora.",
    content: "Đạo diễn James Cameron đã chính thức hé lộ những hình ảnh đầu tiên của siêu bom tấn Avatar: Fire and Ash (Hỏa Ngục Tro Tàn). Bộ phim sẽ đưa khán giả đến với vùng đất núi lửa khắc nghiệt và diện kiến bộ tộc Tro Tàn do thủ lĩnh Varang dẫn đầu. Với công nghệ kỹ xảo đỉnh cao và kỹ thuật ghi hình 3D đột phá, tác phẩm hứa hẹn sẽ xác lập thêm nhiều kỷ lục phòng vé mới khi đổ bộ các rạp chiếu trên toàn cầu.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
    category: "Tin điện ảnh",
    author: "Ban Biên Tập Cinema",
    views: 350,
    isActive: true,
  },
  {
    title: "Đại tiệc Combo Bắp Nước cuối tuần: Giảm sốc 50% cho thành viên",
    summary: "Thưởng thức những bộ phim bom tấn đỉnh cao cùng bắp rang bơ nóng hổi và nước mát lạnh với mức giá ưu đãi cực hấp dẫn vào mỗi cuối tuần.",
    content: "Từ thứ Sáu đến Chủ Nhật hàng tuần, Trung Tâm Chiếu Phim Quốc Gia áp dụng chương trình ưu đãi đặc quyền: Giảm ngay 50% cho combo bắp nước cỡ lớn khi khách hàng mua từ 2 vé xem phim trở lên. Hãy áp dụng mã khuyến mãi ngay trên hệ thống đặt vé trực tuyến để nhận ưu đãi tức thì!",
    image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=800",
    category: "Khuyến mãi",
    author: "Phòng Truyền Thông",
    views: 520,
    isActive: true,
  },
  {
    title: "Khai mạc Tuần lễ Phim Hoạt Hình Quốc Tế 2026 tại Rạp",
    summary: "Hơn 20 tác phẩm hoạt hình xuất sắc từng đoạt nhiều giải thưởng danh giá thế giới sẽ được trình chiếu phục vụ khán giả yêu điện ảnh.",
    content: "Trung Tâm Chiếu Phim Quốc Gia hân hạnh thông báo sự kiện Tuần lễ Phim Hoạt Hình Quốc Tế 2026 sẽ diễn ra từ ngày 15/11 đến 22/11. Khán giả sẽ có cơ hội thưởng thức những bộ phim hoạt hình kinh điển và những tác phẩm đương đại độc đáo đến từ Nhật Bản, Pháp, Hàn Quốc và Hoa Kỳ với chất lượng âm thanh Dolby Atmos sống động.",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
    category: "Sự kiện",
    author: "Ban Tổ Chức",
    views: 210,
    isActive: true,
  },
];

const sampleVouchers = [
  {
    code: "XINCHAO50",
    title: "Giảm 50.000 VNĐ cho khán giả mới",
    description: "Áp dụng cho đơn đặt vé xem phim từ 120.000 VNĐ trở lên tại toàn bộ hệ thống rạp.",
    discountType: "fixed",
    discountValue: 50000,
    minOrderValue: 120000,
    maxDiscount: 50000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
    usedCount: 42,
    isActive: true,
  },
  {
    code: "HSSV20",
    title: "Ưu đãi 20% Học sinh - Sinh viên",
    description: "Giảm 20% tổng giá vé xem phim 2D/3D cho học sinh và sinh viên toàn quốc.",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 80000,
    maxDiscount: 40000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 300,
    usedCount: 115,
    isActive: true,
  },
  {
    code: "VIPIMAX",
    title: "Giảm ngay 100.000 VNĐ trải nghiệm phòng IMAX & VIP",
    description: "Đặc quyền trải nghiệm màn hình siêu lớn IMAX và ghế da cao cấp với đơn từ 250.000 VNĐ.",
    discountType: "fixed",
    discountValue: 100000,
    minOrderValue: 250000,
    maxDiscount: 100000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    usageLimit: 200,
    usedCount: 28,
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Đang kết nối MongoDB để nạp dữ liệu Tin tức & Voucher...");

    await News.deleteMany({});
    await News.insertMany(sampleNews);
    console.log(`Đã nạp thành công ${sampleNews.length} bài viết tin tức mẫu.`);

    await Voucher.deleteMany({});
    await Voucher.insertMany(sampleVouchers);
    console.log(`Đã nạp thành công ${sampleVouchers.length} mã voucher mẫu.`);

    console.log("Hoàn tất nạp dữ liệu!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi nạp dữ liệu:", error);
    process.exit(1);
  }
}

seed();
