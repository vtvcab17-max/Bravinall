/* Bravinall: phần tương tác dùng chung cho mọi trang.
   - Promo: "video" giới thiệu dựng bằng HTML (cảnh + chương + đầu phát), tua, tạm dừng, phím tắt.
     Nếu có data-video (MP4 thật) thì hiện nút "Xem video đầy đủ".
   - So sánh (.vs): công tắc góc nhìn trên điện thoại.
   - Tải về (.dlhub): thẻ chọn ứng dụng, tự đánh dấu bản hợp với máy đang xem. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = s => { s = Math.max(0, Math.floor(s)); return "00:" + String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5.5" y="4.5" width="4.5" height="15" rx="1.2"/><rect x="14" y="4.5" width="4.5" height="15" rx="1.2"/></svg>',
    again: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg>'
  };

  document.querySelectorAll(".promo").forEach(root => {
    const scr = root.querySelector(".scr");
    const scenes = [...root.querySelectorAll(".scene")];
    if (!scenes.length) return;
    const durs = scenes.map(s => +s.dataset.dur || 5);
    const starts = durs.reduce((a, d, i) => (a.push(i ? a[i - 1] + durs[i - 1] : 0), a), []);
    const total = durs.reduce((a, b) => a + b, 0);

    const big = document.createElement("button");
    big.className = "bigplay"; big.type = "button"; big.setAttribute("aria-label", "Phát video giới thiệu");
    big.innerHTML = "<span>" + ICON.play + "</span>";
    scr.appendChild(big);

    const ctrl = document.createElement("div");
    ctrl.className = "ctrl";
    ctrl.innerHTML = '<button type="button" class="pp" aria-label="Phát">' + ICON.play + '</button><span class="tcv">00:00:00</span><div class="chap"></div>';
    root.appendChild(ctrl);
    const pp = ctrl.querySelector(".pp"), tcv = ctrl.querySelector(".tcv"), chap = ctrl.querySelector(".chap");
    const bars = scenes.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.title = s.dataset.label || ("Cảnh " + (i + 1));
      b.setAttribute("aria-label", "Tới cảnh: " + b.title);
      b.innerHTML = "<i></i><span>" + b.title + "</span>";
      b.onclick = e => { e.stopPropagation(); seek(starts[i]); play(); };
      chap.appendChild(b); return b;
    });
    if (root.dataset.video) {
      const f = document.createElement("button");
      f.type = "button"; f.className = "full"; f.textContent = "Xem video đầy đủ";
      f.onclick = () => {
        pause();
        const v = document.createElement("video");
        v.src = root.dataset.video; v.controls = true; v.playsInline = true; v.autoplay = true;
        if (root.dataset.poster) v.poster = root.dataset.poster;
        if (root.dataset.track) { const t = document.createElement("track"); t.kind = "subtitles"; t.srclang = "vi"; t.label = "Tiếng Việt"; t.src = root.dataset.track; t.default = true; v.appendChild(t); }
        scr.replaceWith(v); ctrl.remove();
      };
      ctrl.appendChild(f);
    } else ctrl.style.gridTemplateColumns = "auto auto minmax(0,1fr)";

    let t = 0, playing = false, last = 0, cur = -1, raf = 0;
    function show(i) {
      if (i === cur) return; cur = i;
      scenes.forEach((s, k) => {
        s.classList.toggle("on", k === i);
        // khởi động lại hoạt ảnh CSS trong cảnh
        if (k === i) s.querySelectorAll("[data-anim]").forEach(el => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
      });
      bars.forEach((b, k) => b.classList.toggle("on", k === i));
    }
    function draw() {
      let i = 0; while (i < scenes.length - 1 && t >= starts[i + 1]) i++;
      show(i);
      bars.forEach((b, k) => { const p = Math.min(1, Math.max(0, (t - starts[k]) / durs[k])); b.firstChild.style.width = (p * 100) + "%"; });
      tcv.textContent = fmt(t) + " / " + fmt(total);
    }
    function loop(now) {
      if (!playing) return;
      t += (now - last) / 1000; last = now;
      if (t >= total) { t = total; draw(); pause(true); return; }
      draw(); raf = requestAnimationFrame(loop);
    }
    function play() {
      if (t >= total) t = 0;
      playing = true; root.classList.add("playing", "started");
      pp.innerHTML = ICON.pause; pp.setAttribute("aria-label", "Tạm dừng");
      scenes.forEach(s => s.style.setProperty("--ps", "running"));
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    }
    function pause(ended) {
      playing = false; root.classList.remove("playing");
      pp.innerHTML = ended === true ? ICON.again : ICON.play; pp.setAttribute("aria-label", ended === true ? "Xem lại" : "Phát");
      scenes.forEach(s => s.style.setProperty("--ps", "paused"));
      cancelAnimationFrame(raf);
    }
    function seek(x) { t = Math.max(0, Math.min(total - 0.01, x)); cur = -1; draw(); }
    pp.onclick = () => (playing ? pause() : play());
    big.onclick = e => { e.stopPropagation(); play(); };
    scr.addEventListener("click", () => (playing ? pause() : play()));
    root.tabIndex = 0;
    root.addEventListener("keydown", e => {
      if (e.key === " " || e.key === "k") { e.preventDefault(); playing ? pause() : play(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); seek(starts[Math.min(scenes.length - 1, cur + 1)]); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); seek(starts[Math.max(0, cur - 1)]); }
    });
    seek(0);
    // tự phát khi cuộn tới (trừ khi người xem tắt chuyển động)
    if (!reduce && "IntersectionObserver" in window) {
      let auto = false;
      new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting && en.intersectionRatio > .55 && !auto) { auto = true; play(); }
        else if (!en.isIntersecting && playing) pause();
      }), { threshold: [0, .55] }).observe(root);
    }
  });

  // so sánh
  document.querySelectorAll(".vs").forEach(vs => {
    const seg = vs.querySelector(".seg"); if (!seg) return;
    vs.dataset.view = "new";
    seg.querySelectorAll("button").forEach(b => b.onclick = () => {
      vs.dataset.view = b.dataset.v;
      seg.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    });
  });

  // tải về: đánh dấu bản hợp với máy
  const ua = navigator.userAgent || "";
  const os = /Android/i.test(ua) ? "android" : /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document) ? "ios" : /Windows/i.test(ua) ? "windows" : /Mac OS X|Macintosh/i.test(ua) ? "mac" : "other";
  document.querySelectorAll(".get[data-os]").forEach(a => { if (a.dataset.os.split(" ").includes(os)) a.classList.add("rec"); });

  // thẻ chọn ứng dụng trong khu tải về
  document.querySelectorAll(".dlhub").forEach(hub => {
    const tabs = [...hub.querySelectorAll('[role="tab"]')];
    const sel = id => tabs.forEach(t => { const on = t.dataset.p === id; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; hub.querySelector("#" + t.dataset.p).hidden = !on; });
    tabs.forEach((t, i) => {
      t.onclick = () => sel(t.dataset.p);
      t.onkeydown = e => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; sel(n.dataset.p); n.focus(); } };
    });
    const want = (location.hash.match(/tai-(bravin|antifact|micron)/) || [])[1];
    if (want) sel("p-" + want);
  });
})();
