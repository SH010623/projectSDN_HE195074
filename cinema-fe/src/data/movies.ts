// Mock movie data for the landing page

export interface Movie {
  id: number;
  title: string;
  titleEn: string;
  genre: string[];
  rating: string;
  duration: string;
  releaseDate: string;
  director: string;
  cast: string[];
  description: string;
  posterColor: string; // CSS gradient for mock poster
  bannerColor: string; // CSS gradient for hero banner
  badge?: "now-showing" | "coming-soon";
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Chi Em Thanh Tra 3",
    titleEn: "Inspector Sisters 3",
    genre: ["Hành Động", "Hài"],
    rating: "T16",
    duration: "120 phút",
    releaseDate: "10.10.2026",
    director: "Nguyen Huu Hoang",
    cast: ["Chi Pu", "Ky Duyen", "Steven Nguyen", "Will Vu"],
    description:
      "Phần tiếp theo của loạt phim hành động hài hước đình đám, hai chị em thanh tra tiếp tục phá án với những tình huống dở khóc dở cười.",
    posterColor: "linear-gradient(145deg, #1a0a2e 0%, #3d1155 50%, #6b21a8 100%)",
    bannerColor: "linear-gradient(135deg, #0d0720 0%, #1e0a3c 40%, #4c1d95 100%)",
    badge: "now-showing",
  },
  {
    id: 2,
    title: "Lật Mặt 8",
    titleEn: "Face Off 8",
    genre: ["Hành Động", "Tâm Lý"],
    rating: "T18",
    duration: "135 phút",
    releaseDate: "15.10.2026",
    director: "Ly Hai",
    cast: ["Ly Hai", "Minh Ha", "Quang Tuan"],
    description:
      "Hành trình trở về quê hương đầy bí ẩn, những sự thật bị che giấu lâu năm dần được hé lộ trong màn đối đầu kịch tính.",
    posterColor: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)",
    bannerColor: "linear-gradient(135deg, #060e1f 0%, #0c1e3d 40%, #1e3a5f 100%)",
    badge: "now-showing",
  },
  {
    id: 3,
    title: "Ma Da",
    titleEn: "Water Ghost",
    genre: ["Kinh Dị", "Bí Ẩn"],
    rating: "T18",
    duration: "110 phút",
    releaseDate: "25.10.2026",
    director: "Tran Huu Tan",
    cast: ["Thanh Thuy", "Quang Tuan", "Hoang Yen Chibi"],
    description:
      "Câu chuyện kinh dị về vùng đất linh thiêng với những bí ẩn chưa được giải đáp, nơi ranh giới giữa người sống và người chết mờ nhạt.",
    posterColor: "linear-gradient(145deg, #0a1a1a 0%, #0d4040 50%, #047857 100%)",
    bannerColor: "linear-gradient(135deg, #051414 0%, #0a2929 40%, #0d3d3d 100%)",
    badge: "coming-soon",
  },
  {
    id: 4,
    title: "Nhà Bà Nu",
    titleEn: "Mrs. Nu's House",
    genre: ["Hài", "Gia Đình"],
    rating: "P",
    duration: "100 phút",
    releaseDate: "01.11.2026",
    director: "Tran Thanh",
    cast: ["Tran Thanh", "Nha Phuong", "Cat Phuong"],
    description:
      "Câu chuyện hài hước về một gia đình đặc biệt với bà Nu cá tính, mang đến tiếng cười và bài học ý nghĩa về tình thân.",
    posterColor: "linear-gradient(145deg, #1a0a0a 0%, #7c2020 50%, #dc2626 100%)",
    bannerColor: "linear-gradient(135deg, #0f0606 0%, #2d0e0e 40%, #6b1010 100%)",
    badge: "coming-soon",
  },
  {
    id: 5,
    title: "Avengers: Doomsday",
    titleEn: "Avengers: Doomsday",
    genre: ["Hành Động", "Sci-Fi"],
    rating: "T13",
    duration: "160 phút",
    releaseDate: "05.11.2026",
    director: "Russo Brothers",
    cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
    description:
      "Trận chiến cuối cùng của các siêu anh hùng trước ngày tận thế, khi kẻ thù mạnh nhất từ trước đến nay xuất hiện và đe dọa toàn vũ trụ.",
    posterColor: "linear-gradient(145deg, #0a0a1a 0%, #1e1e4a 50%, #3730a3 100%)",
    bannerColor: "linear-gradient(135deg, #060610 0%, #111130 40%, #1e1e4a 100%)",
    badge: "coming-soon",
  },
  {
    id: 6,
    title: "Kho Bau Rong Bien",
    titleEn: "Dragon's Treasure",
    genre: ["Phiêu Lưu", "Gia Đình"],
    rating: "P",
    duration: "95 phút",
    releaseDate: "20.10.2026",
    director: "Vo Thanh Hoa",
    cast: ["Trung Dan", "Kha Nhu", "Quang Trung"],
    description:
      "Cuộc phiêu lưu kỳ thú của ba người bạn tìm kiếm kho báu bí ẩn dưới đáy đại dương với những con rồng biển huyền thoại.",
    posterColor: "linear-gradient(145deg, #071a3a 0%, #0c3060 50%, #0284c7 100%)",
    bannerColor: "linear-gradient(135deg, #030d1e 0%, #081d3a 40%, #0c3060 100%)",
    badge: "now-showing",
  },
];

export const featuredMovie = movies[0];

export const showtimes = [
  { time: "10:00", hall: "Hall 1", available: true },
  { time: "12:30", hall: "Hall 2", available: true },
  { time: "14:45", hall: "Hall 1", available: false },
  { time: "17:00", hall: "Hall 3", available: true },
  { time: "19:30", hall: "Hall 2", available: true },
  { time: "21:45", hall: "Hall 1", available: true },
];
