/* Thanh timeline ở đáy trang trình chiếu: mỗi slide một nút, kim vàng chạy theo vị trí cuộn, phím mũi tên để chuyển slide. */
(function () {
  const slides = [...document.querySelectorAll(".slide")], track = document.getElementById("track"), head = document.getElementById("head"), tcv = document.getElementById("tcv");
  if (!slides.length || !track) return;
  const btns = slides.map((s, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = s.dataset.label; b.title = s.dataset.label; b.setAttribute("aria-label", "Tới " + s.dataset.label); b.onclick = () => go(i); track.appendChild(b); return b; });
  const cur = () => { const y = scrollY + innerHeight * 0.4; let k = 0; slides.forEach((s, i) => { if (s.offsetTop <= y) k = i; }); return k; };
  function go(i) { i = Math.max(0, Math.min(slides.length - 1, i)); slides[i].scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }
  const total = +(document.body.dataset.total || 120);
  function upd() {
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0, k = cur();
    btns.forEach((b, i) => b.classList.toggle("on", i === k));
    const r = track.getBoundingClientRect(); head.style.left = (p * (r.width - 2)) + "px";
    const s = Math.round(p * total); tcv.textContent = "00:" + String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }
  addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
  const prev = document.getElementById("prev"), next = document.getElementById("next");
  if (prev) prev.onclick = () => go(cur() - 1);
  if (next) next.onclick = () => go(cur() + 1);
  addEventListener("keydown", e => {
    if (e.target.closest && e.target.closest("input,textarea,select,.promo,[contenteditable]")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); go(cur() + 1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); go(cur() - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(slides.length - 1); }
  });
})();
