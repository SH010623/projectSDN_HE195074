import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService, type Movie } from "../services/movieService";
import { showtimeService, type Showtime } from "../services/showtimeService";
import { cinemaDate } from "../utils/cinemaDate";
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const ratingDescriptions: Record<Movie["rating"], string> = {
  P: "Phim được phép phổ biến đến người xem ở mọi độ tuổi",
  K: "Phim dành cho người xem dưới 13 tuổi có cha, mẹ hoặc người giám hộ đi cùng",
  T13: "Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên (13+)",
  T16: "Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên (16+)",
  T18: "Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (18+)",
  C: "Phim không được phép phổ biến",
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const [dates] = useState(() => Array.from({ length: 4 }, (_, index) => {
    const day = new Date(`${cinemaDate()}T12:00:00+07:00`);
    day.setUTCDate(day.getUTCDate() + index);
    return cinemaDate(day);
  }));
  const [date, setDate] = useState(dates[0]);
  const [entries, setEntries] = useState<{ movie: Movie; showtimes: Showtime[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [modal, setModal] = useState<"none" | "login" | "register" | "forgot">("none");
  const [pendingShowtime, setPendingShowtime] = useState<string | null>(null);
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      movieService.getMovies({ status: "all", limit: 100 }),
      showtimeService.getShowtimes({ date }),
    ]).then(([catalog, schedule]) => {
      if (!active) return;
      const groups = new Map<string, { movie: Movie; showtimes: Showtime[] }>();
      for (const showtime of schedule.showtimes) {
        const movie = catalog.movies.find(item => item._id === showtime.movieId?._id) || showtime.movieId;
        if (!movie || movie.rating === "C" || !["scheduled", "opened"].includes(showtime.status) || new Date(showtime.startTime).getTime() <= Date.now()) continue;
        if (!groups.has(movie._id)) groups.set(movie._id, { movie, showtimes: [] });
        groups.get(movie._id)!.showtimes.push(showtime);
      }
      setEntries(Array.from(groups.values()).map(entry => ({ ...entry, showtimes: entry.showtimes.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime)) })));
    }).catch(() => {
      if (active) setError("Không tải được lịch chiếu. Vui lòng thử lại.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, retry]);

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

  return <div className="min-h-screen bg-[#101319] text-[#f7f8fc] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#ff8588] [&_button:focus-visible]:outline-offset-4 motion-reduce:[&_button]:transition-none">
    <Navbar currentUser={user} onOpenLogin={() => setModal("login")} onOpenRegister={() => setModal("register")} />
    <main className="mx-auto max-w-[1536px] min-[1800px]:max-w-[1920px] min-h-[75vh] px-9 pt-[120px] pb-[72px] max-[1100px]:px-6 max-[600px]:px-4 max-[600px]:pt-[152px] max-[600px]:pb-12">
      <h1 className="flex items-center justify-center gap-[9px] text-[23px] max-[600px]:text-[21px] font-extrabold tracking-[-.5px] [&>span]:size-4 [&>span]:rounded-full [&>span]:bg-[#f14145]"><span aria-hidden="true" />Phim đang chiếu</h1>
      <div className="flex justify-center gap-4 mt-5 mb-6 max-[600px]:gap-2 max-[600px]:justify-start max-[600px]:overflow-x-auto max-[600px]:px-0.5 max-[600px]:pt-1 max-[600px]:pb-3 [&_button]:shrink-0 [&_button]:px-[13px] [&_button]:py-[9px] [&_button]:border [&_button]:border-[#28303e] [&_button]:rounded-md [&_button]:bg-gradient-to-b [&_button]:from-[#21242b] [&_button]:to-[#15181e] [&_button]:text-[15px] [&_button]:font-semibold [&_button]:tabular-nums [&_button]:transition-colors [&_button]:duration-200 [&_button[aria-pressed=true]]:bg-[linear-gradient(110deg,#ff4058,#ff6d60)] [&_button[aria-pressed=true]]:border-[#ff7b7b] [&_button[aria-pressed=true]]:shadow-[0_16px_32px_#ff46551a] [&_button:hover]:border-[#ff6669] [&_button:hover]:bg-none [&_button:hover]:bg-[#42242d] max-[600px]:[&_button]:text-[13px] max-[600px]:[&_button]:px-2.5" role="group" aria-label="Chọn ngày xem phim">
        {dates.map(day => <button key={day} type="button" aria-pressed={date === day} onClick={() => setDate(day)}>{day.split("-").reverse().join("-")}</button>)}
      </div>
      {loading ? <div className="grid grid-cols-2 max-[1100px]:grid-cols-1 gap-6" role="status" aria-label="Đang tải lịch chiếu">{[0, 1, 2, 3].map(item => <div key={item} className="h-[290px] rounded-[13px] bg-[#202630] animate-pulse motion-reduce:animate-none" />)}</div>
        : error ? <div className="py-14 px-6 text-center text-[#aab3c3] border border-dashed border-[#384150] rounded-xl [&_button]:mt-4 [&_button]:text-[#ff777d] [&_button]:underline" role="alert"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>Thử lại</button></div>
        : entries.length === 0 ? <p className="py-14 px-6 text-center text-[#aab3c3] border border-dashed border-[#384150] rounded-xl [&_button]:mt-4 [&_button]:text-[#ff777d] [&_button]:underline">Chưa có suất chiếu có thể đặt cho ngày này. Vui lòng chọn ngày khác.</p>
        : <div className="grid grid-cols-2 max-[1100px]:grid-cols-1 gap-6">{entries.map(({ movie, showtimes }) => {
          const formats = [...new Set(showtimes.map(showtime => showtime.roomId?.roomType).filter(Boolean))];
          return <article key={movie._id} className="grid grid-cols-[31.2%_minmax(0,1fr)] max-[600px]:grid-cols-[29%_minmax(0,1fr)] border border-[#384150] rounded-[13px] overflow-hidden">
            <div className="bg-[#20242d] min-h-[290px] max-[1100px]:min-h-[310px] max-[600px]:min-h-[230px] [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&>span]:flex [&>span]:items-center [&>span]:h-full [&>span]:p-4 [&>span]:text-[#98a2b5]">{movie.poster ? <img src={movie.poster} alt={`Poster ${movie.title}`} loading="lazy" /> : <span>{movie.title}</span>}</div>
            <div className="relative min-w-0 pt-[25px] pr-[22px] pb-[26px] pl-6 text-sm leading-[1.65] max-[1100px]:p-7 max-[600px]:px-3 max-[600px]:pt-10 max-[600px]:pb-[18px] max-[600px]:text-xs [&_h2]:text-[15px] [&_h2]:font-extrabold [&_h2]:leading-[1.45] [&_h2]:mb-[5px] [&_h2]:text-pretty [&_h3]:mt-[11px] [&_h3]:mb-[7px] [&_h3]:text-[15px] [&_h3]:font-bold max-[600px]:[&_h2]:text-sm max-[600px]:[&_h3]:text-sm">
              {formats.length > 0 && <span className="absolute top-2 right-2 max-w-[100px] py-0.5 px-[7px] border border-[#525b69] rounded-md text-[#d0d4dc] font-bold text-base max-[600px]:text-[13px]">{formats.join(" / ")}</span>}
              <p className="flex flex-wrap gap-y-1.5 gap-x-5 pr-10 text-[#8491a7] mb-2 max-[600px]:pr-0 max-[600px]:gap-y-0.5 max-[600px]:gap-x-2.5"><span>{movie.genres?.join(", ")}</span><span>{movie.duration} phút</span></p>
              <h2>{movie.title}</h2>
              {movie.language && <p>Ngôn ngữ: {movie.language}</p>}
              {movie.releaseDate && <p>Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>}
              <p className="text-[#ff4449] mt-[3px]">{ratingDescriptions[movie.rating]}</p>
              <h3>Lịch chiếu</h3>
              <div className="flex flex-wrap gap-2 max-[600px]:gap-1.5 [&_button]:min-w-[60px] [&_button]:py-1.5 [&_button]:px-[11px] [&_button]:border [&_button]:border-[#f1f2f5] [&_button]:rounded-md [&_button]:bg-gradient-to-b [&_button]:from-[#22252b] [&_button]:to-[#16191f] [&_button]:text-sm [&_button]:font-semibold [&_button]:tabular-nums [&_button]:transition [&_button]:duration-200 [&_button:hover]:border-[#ff6669] [&_button:hover]:bg-none [&_button:hover]:bg-[#42242d] [&_button:active]:translate-y-px max-[600px]:[&_button]:min-w-[54px] max-[600px]:[&_button]:py-[5px] max-[600px]:[&_button]:px-2 max-[600px]:[&_button]:text-[13px]">{showtimes.map(showtime => <button key={showtime._id} type="button" onClick={() => selectShowtime(showtime)} title={`${showtime.roomId?.name || ""} · ${showtime.price.toLocaleString("vi-VN")} đ`} aria-label={`${movie.title}, ${new Date(showtime.startTime).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}, ${showtime.roomId?.name || ""}`}>
                {new Date(showtime.startTime).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}
              </button>)}</div>
            </div>
          </article>;
        })}</div>}
    </main>
    <Footer />
    {modal === "login" && <LoginModal onClose={() => { setModal("none"); setPendingShowtime(null); }} onSuccess={() => { setModal("none"); if (pendingShowtime) navigate(`/booking/${pendingShowtime}`); }} onSwitchToRegister={() => setModal("register")} onSwitchToForgotPassword={() => setModal("forgot")} />}
    {modal === "register" && <RegisterModal onClose={() => setModal("none")} onSwitchToLogin={() => setModal("login")} />}
    {modal === "forgot" && <ForgotPasswordModal onClose={() => setModal("none")} onSwitchToLogin={() => setModal("login")} />}
  </div>;
}
