import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { movieService, type Movie } from "../services/movieService";
import { showtimeService, type Showtime } from "../services/showtimeService";
import { cinemaDate } from "../utils/cinemaDate";
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";


export default function MovieShowtimesPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [dates] = useState(() => Array.from({ length: 4 }, (_, index) => {
    const day = new Date(`${cinemaDate()}T12:00:00+07:00`);
    day.setUTCDate(day.getUTCDate() + index);
    return cinemaDate(day);
  }));
  const [date, setDate] = useState(dates[0]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"none" | "login" | "register" | "forgot">("none");
  const [pendingShowtime, setPendingShowtime] = useState<string | null>(null);
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setShowtimes([]);
    if (!movieId) return;
    Promise.all([movieService.getMovieById(movieId), showtimeService.getShowtimes({ movieId, date })])
      .then(([movieResult, schedule]) => {
        if (!active) return;
        setMovie(movieResult.movie);
        setShowtimes(schedule.showtimes.filter(st => ["scheduled", "opened"].includes(st.status) && new Date(st.startTime).getTime() > Date.now()).sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime)));
      })
      .catch(() => { if (active) setError("Không tải được thông tin phim và lịch chiếu. Vui lòng thử lại sau."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [movieId, date]);

  const selectShowtime = (showtime: Showtime) => {
    if (new Date(showtime.startTime).getTime() <= Date.now()) {
      setError("Suất chiếu đã bắt đầu. Vui lòng chọn suất khác.");
      return;
    }
    if (!localStorage.getItem("token")) {
      setPendingShowtime(showtime._id);
      setModal("login");
      return;
    }
    navigate(`/booking/${showtime._id}`);
  };

  const formats = [...new Set(showtimes.map(st => st.roomId?.roomType).filter(Boolean))];
  const ratingText = movie?.rating === "P" ? "Phim được phép phổ biến đến người xem ở mọi độ tuổi"
    : movie?.rating === "K" ? "Phim dành cho người xem dưới 13 tuổi có cha, mẹ hoặc người giám hộ đi cùng"
    : movie?.rating === "C" ? "Phim không được phép phổ biến"
    : `Phim được phổ biến đến người xem từ đủ ${movie?.rating.slice(1)} tuổi trở lên (${movie?.rating.slice(1)}+)`;
  const trailerUrl = movie?.trailerUrl && /^https?:\/\//i.test(movie.trailerUrl) ? movie.trailerUrl : null;

  return <div className="min-h-screen bg-[#101319] text-[#f8f8fc] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#ff878a] [&_button:focus-visible]:outline-offset-4 motion-reduce:[&_button]:transition-none">
    <Navbar currentUser={user} onOpenLogin={() => setModal("login")} onOpenRegister={() => setModal("register")} />
    <main>
      <section className="relative isolate overflow-hidden px-8 pt-[108px] pb-20 min-h-[570px] after:content-[''] after:absolute after:inset-0 after:-z-10 after:bg-[linear-gradient(0deg,#101319,#10131955_55%,#10131988)] max-[600px]:pt-[150px] max-[600px]:px-5 max-[600px]:pb-9 max-[600px]:min-h-0" aria-label="Thông tin phim">
        {movie && <>
          {(movie.banner || movie.poster) && <img className="absolute inset-0 -z-20 w-full h-full object-cover blur-[3px] opacity-[.24]" src={movie.banner || movie.poster} alt="" />}
          <div className="max-w-[1320px] mx-auto grid grid-cols-[minmax(200px,26%)_minmax(0,1fr)] items-start gap-12 max-[900px]:gap-6 max-[900px]:grid-cols-[28%_minmax(0,1fr)] max-[600px]:grid-cols-1 max-[600px]:gap-5">
            {movie.poster && <img className="w-full aspect-[2/3] object-cover rounded-2xl max-[600px]:w-[48%] max-[600px]:max-w-[220px] max-[600px]:mx-auto" src={movie.poster} alt={`Poster ${movie.title}`} />}
            <div className="pt-2 text-base leading-[1.65] max-[900px]:text-sm [&_h1]:text-[clamp(25px,2.5vw,36px)] [&_h1]:font-extrabold [&_h1]:leading-tight [&_h1]:tracking-[-.6px] [&_h1]:mb-[22px] [&_h1]:[overflow-wrap:anywhere] max-[600px]:[&_h1]:text-2xl">
              <h1>{movie.title}{movie.rating !== "P" && <span>-{movie.rating}</span>}{formats.length > 0 && <span className="inline-block align-middle ml-3 border border-[#fafafa] p-[9px] rounded-[15px] text-lg tracking-normal">{formats.join(" / ")}</span>}</h1>
              <div className="flex flex-wrap gap-y-1 gap-x-6 max-[600px]:gap-x-3.5"><span>{movie.genres.join(", ")}</span><span>{movie.duration} phút</span>{movie.director && <span>Đạo diễn: {movie.director}</span>}</div>
              {movie.cast && movie.cast.length > 0 && <p>Diễn viên: {movie.cast.join(", ")}</p>}
              {movie.releaseDate && <p>Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>}
              {movie.description && <p className="mt-[26px] max-w-[72ch] whitespace-pre-line">{movie.description}</p>}
              <p className="text-[#ff474c] mt-6">Kiểm duyệt: {ratingText}</p>
              <div className="flex flex-wrap items-start gap-5 mt-[26px] font-semibold [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:py-[13px] [&_summary::-webkit-details-marker]:hidden [&_details]:flex-[0_1_210px] [&_details_p]:text-sm [&_details_p]:font-normal [&_details_p]:text-[#c6ccd4] [&_a]:inline-flex [&_a]:items-center [&_a]:gap-3 [&_a]:border [&_a]:border-[#2d3543] [&_a]:rounded-[40px] [&_a]:py-3 [&_a]:px-8 [&_a]:text-[#ffda46] [&_a]:bg-[#1a1e25b3] [&_a:hover]:border-[#ff6568] [&_a:hover]:bg-[#322027] [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-[#ff878a] [&_a:focus-visible]:outline-offset-4 [&_summary:focus-visible]:outline [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-[#ff878a] [&_summary:focus-visible]:outline-offset-4">
                {movie.description && <details><summary>Chi tiết nội dung →</summary><p>{movie.description}</p></details>}
                {trailerUrl && <a href={trailerUrl} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span> Xem trailer</a>}
              </div>
            </div>
          </div>
        </>}
        {!movie && loading && <p className="text-center text-[#b1b9c7] py-10 px-4" role="status">Đang tải thông tin phim...</p>}
      </section>
      <section aria-label="Chọn suất chiếu">
        <div className="flex justify-center bg-[#1b1e23] max-[600px]:justify-start max-[600px]:overflow-x-auto [&_button]:min-w-24 [&_button]:py-[18px] [&_button]:px-3 [&_button]:flex [&_button]:flex-col [&_button]:items-center [&_button]:gap-0.5 [&_button]:text-sm [&_button]:tabular-nums [&_button]:transition-colors [&_button]:duration-200 [&_strong]:text-[28px] [&_strong]:font-extrabold [&_button[aria-pressed=true]]:bg-[#e92127] [&_button:hover]:bg-[#70252e] max-[600px]:[&_button]:min-w-[25%] max-[600px]:[&_button]:shrink-0 max-[600px]:[&_button]:text-xs" role="group" aria-label="Chọn ngày xem phim">
          {dates.map(day => {
            const value = new Date(`${day}T12:00:00+07:00`);
            return <button key={day} type="button" aria-pressed={date === day} onClick={() => setDate(day)}>
              <span>Th. {day.slice(5, 7)}</span><strong>{day.slice(8)}</strong><span>{value.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", weekday: "long" })}</span>
            </button>;
          })}
        </div>
        <div className="max-w-[1384px] mx-auto p-8 max-[600px]:px-5 max-[600px]:py-6">
          {loading ? <p role="status" className="text-center text-[#b1b9c7] py-10 px-4">Đang tải lịch chiếu...</p>
            : error ? <p role="alert" className="text-center text-[#b1b9c7] py-10 px-4">{error}</p>
            : showtimes.length === 0 ? <p className="text-center text-[#b1b9c7] py-10 px-4">Chưa có suất chiếu có thể đặt cho ngày này. Vui lòng chọn ngày khác.</p>
            : <div className="grid grid-cols-5 gap-5 max-[900px]:grid-cols-3 max-[900px]:gap-3 max-[600px]:grid-cols-2 [&_button]:border [&_button]:border-[#2c3645] [&_button]:rounded-[40px] [&_button]:py-[13px] [&_button]:px-4 [&_button]:bg-gradient-to-b [&_button]:from-[#22262d] [&_button]:to-[#171b21] [&_button]:font-extrabold [&_button]:text-[17px] [&_button]:tabular-nums [&_button]:transition-colors [&_button]:duration-200 [&_button:hover:not(:disabled)]:border-[#ff6568] [&_button:hover:not(:disabled)]:bg-none [&_button:hover:not(:disabled)]:bg-[#322027] [&_button:disabled]:opacity-40 [&_button:disabled]:cursor-not-allowed">{showtimes.map(st => <button key={st._id} type="button" onClick={() => selectShowtime(st)} disabled={movie?.rating === "C"} title={`${st.roomId?.name || ""} · ${st.roomId?.roomType || ""} · ${st.price.toLocaleString("vi-VN")} đ`}>
              {new Date(st.startTime).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}
            </button>)}</div>}
        </div>
      </section>
    </main>
    <Footer />
    {modal === "login" && <LoginModal onClose={() => { setModal("none"); setPendingShowtime(null); }} onSuccess={() => { setModal("none"); if (pendingShowtime) navigate(`/booking/${pendingShowtime}`); }} onSwitchToRegister={() => setModal("register")} onSwitchToForgotPassword={() => setModal("forgot")} />}
    {modal === "register" && <RegisterModal onClose={() => setModal("none")} onSwitchToLogin={() => setModal("login")} />}
    {modal === "forgot" && <ForgotPasswordModal onClose={() => setModal("none")} onSwitchToLogin={() => setModal("login")} />}
  </div>;
}
