/* Bravin: các phần thử ngay trên trang giới thiệu. Mọi thứ chỉ là mô phỏng trên trang, không gửi dữ liệu đi đâu. */
(function () {
  const $ = id => document.getElementById(id);
  const press = (wrap, el) => wrap.querySelectorAll("button[aria-pressed]").forEach(b => b.setAttribute("aria-pressed", String(b === el)));
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- lane helper ---------- */
  function drawLanes(box, lanes, opts) {
    box.innerHTML = "";
    lanes.forEach((ln, li) => {
      const row = document.createElement("div"); row.className = "row";
      row.innerHTML = "<span>" + ln.n + '</span><div class="lane"></div>';
      const lane = row.querySelector(".lane");
      ln.c.forEach((c, ci) => {
        const el = document.createElement("span");
        el.className = "clip " + (c.k || "c1") + (c.cls ? " " + c.cls : "");
        el.style.left = c.l + "%"; el.style.width = c.w + "%"; el.textContent = c.n;
        el.dataset.li = li; el.dataset.ci = ci;
        lane.appendChild(el);
      });
      box.appendChild(row);
    });
    if (opts && opts.after) opts.after();
  }
  function dragClips(box, getState, onMove, onDrop, canDrag) {
    let d = null;
    box.addEventListener("pointerdown", e => {
      const el = e.target.closest(".clip"); if (!el || (canDrag && !canDrag(el, e))) return;
      const lane = el.parentElement.getBoundingClientRect();
      d = { el, x: e.clientX, w: lane.width, li: +el.dataset.li, ci: +el.dataset.ci, start: clone(getState()) };
      el.classList.add("drag"); el.setPointerCapture(e.pointerId); e.preventDefault();
    });
    box.addEventListener("pointermove", e => { if (!d) return; onMove(d, (e.clientX - d.x) / d.w * 100); });
    box.addEventListener("pointerup", () => { if (!d) return; d.el.classList.remove("drag"); onDrop && onDrop(d); d = null; });
  }

  /* ---------- 1. timeline: chọn / dao cắt / xoá ripple ---------- */
  if ($("tl2")) {
    const T0 = [{ n: "Chữ", c: [{ n: "Tiêu đề", l: 4, w: 30, k: "c5" }, { n: "Phụ đề", l: 52, w: 26, k: "c5" }] },
      { n: "Phủ", c: [{ n: "Logo", l: 30, w: 24, k: "c4" }] },
      { n: "Video", c: [{ n: "Cảnh 1", l: 0, w: 24, k: "c1" }, { n: "Cảnh 2", l: 25, w: 20, k: "c2" }, { n: "Cảnh 3", l: 46, w: 30, k: "c1" }, { n: "Cảnh 4", l: 77, w: 22, k: "c2" }] },
      { n: "Nhạc", c: [{ n: "Nhạc nền · ducking", l: 0, w: 100, k: "c3" }] }];
    let st = clone(T0), hist = [], tool = "v";
    const box = $("tl2"), hint = $("tlHint");
    const H = { v: "Kéo một clip sang trái hoặc phải.", c: "Bấm vào một clip để cắt đôi tại chỗ bấm.", b: "Bấm vào một clip để xoá; các clip phía sau tự dồn lại (ripple)." };
    const draw = () => drawLanes(box, st);
    document.querySelectorAll("#tlTools [data-t]").forEach(b => b.onclick = () => { tool = b.dataset.t; press($("tlTools"), b); box.classList.toggle("cut", tool === "c"); box.classList.toggle("rip", tool === "b"); hint.textContent = H[tool]; });
    $("tlUndo").onclick = () => { if (hist.length) { st = hist.pop(); draw(); hint.textContent = "Đã hoàn tác."; } };
    dragClips(box, () => st, (d, dx) => { const c = d.start[d.li].c[d.ci]; const l = Math.max(0, Math.min(100 - c.w, c.l + dx)); d.el.style.left = l + "%"; st[d.li].c[d.ci].l = l; },
      d => { hist.push(d.start); }, () => tool === "v");
    box.addEventListener("click", e => {
      const el = e.target.closest(".clip"); if (!el || tool === "v") return;
      const li = +el.dataset.li, ci = +el.dataset.ci, c = st[li].c[ci];
      hist.push(clone(st));
      if (tool === "c") {
        const r = el.getBoundingClientRect(), f = Math.max(.15, Math.min(.85, (e.clientX - r.left) / r.width)), w1 = c.w * f;
        st[li].c.splice(ci, 1, { ...c, w: w1 - .5 }, { ...c, n: c.n + " (b)", l: c.l + w1, w: c.w - w1, cls: "new" });
        hint.textContent = "Đã cắt “" + c.n + "” thành hai clip.";
      } else {
        st[li].c.splice(ci, 1); st[li].c.forEach(x => { if (x.l > c.l) x.l = Math.max(0, x.l - c.w - 1); });
        hint.textContent = "Đã xoá “" + c.n + "”, các clip phía sau dồn lại.";
      }
      draw();
    });
    draw();
  }

  /* ---------- 2. nhóm & compound ---------- */
  if ($("grp")) {
    const G0 = [{ n: "Chữ", c: [{ n: "Tiêu đề", l: 2, w: 26, k: "c5" }] }, { n: "Phủ", c: [{ n: "Logo", l: 30, w: 22, k: "c4" }] }, { n: "Video", c: [{ n: "Cảnh 1", l: 54, w: 30, k: "c1" }] }];
    let st = clone(G0), mode = "none";
    const box = $("grp"), hint = $("gHint");
    const draw = () => drawLanes(box, st, { after: () => { if (mode === "group") box.querySelectorAll(".clip").forEach(x => x.classList.add("grp")); } });
    dragClips(box, () => st, (d, dx) => {
      const move = (li, ci) => { const s = d.start[li].c[ci]; const l = Math.max(0, Math.min(100 - s.w, s.l + dx)); st[li].c[ci].l = l; };
      if (mode === "group") { st.forEach((ln, li) => ln.c.forEach((c, ci) => move(li, ci))); draw(); box.querySelectorAll(".clip").forEach(x => x.classList.add("drag")); }
      else { move(d.li, d.ci); d.el.style.left = st[d.li].c[d.ci].l + "%"; }
    }, () => draw());
    $("gG").onclick = () => { st = clone(G0); mode = "group"; draw(); hint.textContent = "Đã nhóm 3 clip (gạch vàng). Kéo một clip là cả nhóm đi theo."; };
    $("gC").onclick = () => { mode = "comp"; st = [{ n: "Video", c: [{ n: "▣ Compound 1 · 3 clip", l: 2, w: 82, k: "c2", cls: "new" }] }]; draw(); hint.textContent = "Đã gộp thành một layer: áp màu, hiệu ứng, mask một lần cho cả cụm."; };
    $("gU").onclick = () => { mode = "none"; st = clone(G0); draw(); hint.textContent = "Đã tách. Ba clip lại rời nhau."; };
    draw();
  }

  /* ---------- 3. keyframe & speed ramp ---------- */
  if ($("kfSvg")) {
    const svg = $("kfSvg"), keys = [{ t: 0, v: 1 }, { t: .4, v: .25 }, { t: 1, v: 3 }];
    const X = t => 40 + t * 400, Y = v => 220 - (Math.log2(v) + 2) / 4 * 180, V = y => Math.pow(2, (220 - y) / 180 * 4 - 2);
    const fmt = v => (Math.round(v * 100) / 100).toString().replace(".", ",") + "×";
    function speedAt(t) { for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t <= b.t) { const k = (t - a.t) / (b.t - a.t || 1), s = k * k * (3 - 2 * k); return Math.pow(2, Math.log2(a.v) + (Math.log2(b.v) - Math.log2(a.v)) * s); } } return keys[keys.length - 1].v; }
    function draw() {
      let d = ""; for (let i = 0; i <= 80; i++) { const t = i / 80; d += (i ? "L" : "M") + X(t).toFixed(1) + " " + Y(speedAt(t)).toFixed(1); }
      $("kfCurve").setAttribute("d", d);
      $("kfKeys").innerHTML = keys.map((k, i) => '<g data-i="' + i + '"><path d="M' + X(k.t) + " " + (Y(k.v) - 9) + "l9 9-9 9-9-9z\" fill=\"#f2c14e\"/><text x=\"" + (X(k.t) + (i === 2 ? -40 : 10)) + '" y="' + (Y(k.v) - 12) + '" fill="#f2c14e" font-family="JetBrains Mono,monospace" font-size="11">' + fmt(k.v) + "</text></g>").join("");
    }
    let drag = null;
    svg.addEventListener("pointerdown", e => { const g = e.target.closest("[data-i]"); if (!g) return; drag = +g.dataset.i; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener("pointermove", e => {
      if (drag === null) return; const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * 460 / r.width, y = (e.clientY - r.top) * 260 / r.height;
      keys[drag].v = Math.max(.25, Math.min(4, V(Math.max(40, Math.min(220, y)))));
      if (drag === 1) keys[1].t = Math.max(.15, Math.min(.85, (x - 40) / 400));
      draw(); $("kfInfo").textContent = "Key " + (drag + 1) + ": " + fmt(keys[drag].v);
    });
    addEventListener("pointerup", () => { drag = null; });
    let raf = 0;
    $("kfPlay").onclick = () => {
      cancelAnimationFrame(raf); let t = 0, pos = 0, last = performance.now(); const bar = $("kfBall").parentElement.clientWidth - 16;
      let total = 0; for (let i = 0; i < 200; i++) total += speedAt(i / 200) / 200;
      const step = now => { const dt = (now - last) / 1000; last = now; t = Math.min(1, t + dt / 3); pos += speedAt(t) * dt / 3 / total;
        $("kfBall").style.transform = "translateX(" + Math.min(1, pos) * bar + "px)"; $("kfHead").setAttribute("x", X(t)); $("kfInfo").textContent = "Tốc độ " + fmt(speedAt(t));
        if (t < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    };
    draw();
  }

  /* ---------- 4. chỉnh màu ---------- */
  if ($("cgPrev")) {
    const img = $("cgPrev").querySelector("svg"), on = { bal: true, skin: true, lut: false };
    function apply() {
      const lift = +$("cgLift").value, gam = +$("cgGam").value, gain = +$("cgGain").value, sat = +$("cgSat").value, temp = +$("cgTemp").value;
      let br = 100 + gain * .9 + gam * .5, ct = 100 + (gain - lift) * .8, sa = sat, sp = 0, hue = 0;
      if (on.bal) { br += 4; ct += 6; }
      if (on.skin) { sa += 8; sp += 6; }
      if (on.lut) { ct += 18; sa -= 15; sp += 22; hue -= 8; }
      if (temp > 0) sp += temp * 1.2; else hue += temp * .8;
      img.style.filter = "brightness(" + br + "%) contrast(" + ct + "%) saturate(" + Math.max(0, sa) + "%) sepia(" + Math.max(0, sp) + "%) hue-rotate(" + hue + "deg)";
    }
    ["cgLift", "cgGam", "cgGain", "cgSat", "cgTemp"].forEach(id => $(id).oninput = apply);
    document.querySelectorAll("#cgNodes button").forEach(b => b.onclick = () => { on[b.dataset.n] = !on[b.dataset.n]; b.setAttribute("aria-pressed", String(on[b.dataset.n])); apply(); });
    apply();
  }

  /* ---------- 5. mask ---------- */
  if ($("mk")) {
    const mk = $("mk"), fg = $("mkFg"), h = $("mkH"), sub = $("mkSub");
    let p = { x: .5, y: .45 }, shape = "ell", raf = 0;
    const SH = { ell: (cx, cy) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="80" ry="64"/>', rect: (cx, cy) => '<rect x="' + (cx - 80) + '" y="' + (cy - 60) + '" width="160" height="120" rx="6"/>',
      heart: (cx, cy) => '<path transform="translate(' + (cx - 60) + " " + (cy - 54) + ') scale(1.2)" d="M50 90L10 50C-10 30 10 0 35 10C45 14 50 22 50 22C50 22 55 14 65 10C90 0 110 30 90 50Z"/>',
      star: (cx, cy) => '<path transform="translate(' + (cx - 70) + " " + (cy - 66) + ')" d="M70 0L88 46L138 48L98 78L112 128L70 100L28 128L42 78L2 48L52 46Z"/>' };
    function draw() {
      const r = mk.getBoundingClientRect(), W = 400, H = 225, cx = p.x * W, cy = p.y * H, fea = +$("mkFea").value, inv = $("mkInv").checked;
      const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '"><defs><filter id="f"><feGaussianBlur stdDeviation="' + (fea / 2) + '"/></filter>' + (inv ? '<mask id="m"><rect width="100%" height="100%" fill="white"/><g filter="url(#f)" fill="black">' + SH[shape](cx, cy) + '</g></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#m)"/>' : '</defs><g filter="url(#f)" fill="white">' + SH[shape](cx, cy) + "</g>") + "</svg>";
      const url = 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
      fg.style.webkitMaskImage = url; fg.style.maskImage = url; fg.style.webkitMaskSize = "100% 100%"; fg.style.maskSize = "100% 100%";
      const sx = r.width / W, sy = r.height / H;
      h.style.left = (cx - 80) * sx + "px"; h.style.top = (cy - 64) * sy + "px"; h.style.width = 160 * sx + "px"; h.style.height = 128 * sy + "px"; h.style.borderRadius = shape === "ell" ? "50%" : "8px"; h.style.borderStyle = shape === "ell" || shape === "rect" ? "solid" : "dashed";
      sub.style.left = (p.x * 100 - 6) + "%"; sub.style.top = (p.y * 100 - 12) + "%";
    }
    let d = false;
    mk.addEventListener("pointerdown", e => { d = true; mk.setPointerCapture(e.pointerId); $("mkTr").checked = false; cancelAnimationFrame(raf); move(e); });
    mk.addEventListener("pointermove", e => d && move(e));
    addEventListener("pointerup", () => d = false);
    function move(e) { const r = mk.getBoundingClientRect(); p = { x: Math.max(.1, Math.min(.9, (e.clientX - r.left) / r.width)), y: Math.max(.15, Math.min(.85, (e.clientY - r.top) / r.height)) }; draw(); }
    document.querySelectorAll("#mkShape button").forEach(b => b.onclick = () => { shape = b.dataset.s; press($("mkShape"), b); draw(); });
    $("mkFea").oninput = draw; $("mkInv").onchange = draw;
    $("mkTr").onchange = () => { cancelAnimationFrame(raf); if (!$("mkTr").checked) return; const t0 = performance.now();
      const step = now => { const t = (now - t0) / 1000; p = { x: .5 + Math.sin(t * .9) * .3, y: .48 + Math.sin(t * 1.7) * .12 }; draw(); if ($("mkTr").checked) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };
    addEventListener("resize", draw); draw();
  }

  /* ---------- 6. hiệu ứng ---------- */
  if ($("fxPrev")) {
    const sc = $("fxScene"), ov = $("fxOv"), car = sc.querySelector(".fx-car");
    const NOISE = "repeating-radial-gradient(circle at 17% 32%, rgba(255,255,255,.14) 0 1px, transparent 1px 3px), repeating-radial-gradient(circle at 71% 63%, rgba(0,0,0,.18) 0 1px, transparent 1px 4px)";
    const FX = {
      glow: () => { sc.style.filter = "brightness(1.12) saturate(1.15)"; ov.style.background = "radial-gradient(circle at 79% 25%, rgba(255,240,200,.75), transparent 38%)"; },
      glint: () => { sc.style.filter = "none"; ov.style.background = "linear-gradient(45deg,transparent 48.5%,rgba(255,255,255,.85) 50%,transparent 51.5%) 72% 18%/24% 40% no-repeat,linear-gradient(-45deg,transparent 48.5%,rgba(255,255,255,.85) 50%,transparent 51.5%) 72% 18%/24% 40% no-repeat"; },
      rays: () => { sc.style.filter = "brightness(1.05)"; ov.style.background = "repeating-conic-gradient(from 0deg at 80% 24%, rgba(255,231,160,.35) 0 4deg, transparent 4deg 12deg)"; },
      prism: () => { sc.style.filter = "drop-shadow(3px 0 0 rgba(255,0,80,.6)) drop-shadow(-3px 0 0 rgba(0,180,255,.6)) saturate(1.3)"; ov.style.background = "linear-gradient(90deg,rgba(255,0,100,.12),rgba(0,255,150,.08),rgba(0,120,255,.12))"; },
      film: () => { sc.style.filter = "sepia(.45) contrast(1.15) saturate(.9)"; ov.style.background = NOISE + ", radial-gradient(transparent 55%, rgba(0,0,0,.55))"; },
      denoise: () => { sc.style.filter = "none"; ov.style.background = NOISE + "," + NOISE; ov.style.opacity = 1; setTimeout(() => { ov.style.opacity = 0; }, 900); },
      stab: () => { sc.style.filter = "none"; ov.style.background = "none"; sc.classList.add("shake"); setTimeout(() => sc.classList.remove("shake"), 1100); },
      slow: () => { sc.style.filter = "none"; ov.style.background = "none"; }
    };
    document.querySelectorAll("#fxTiles .tile").forEach(b => { b.setAttribute("aria-pressed", "false"); b.onclick = () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      document.querySelectorAll("#fxTiles .tile").forEach(x => x.setAttribute("aria-pressed", "false"));
      sc.classList.remove("shake"); ov.style.opacity = 1; car.style.animationDuration = "4s";
      if (!on) { sc.style.filter = "none"; ov.style.background = "none"; return; }
      b.setAttribute("aria-pressed", "true"); FX[b.dataset.fx](); if (b.dataset.fx === "slow") car.style.animationDuration = "16s";
    }; });
  }

  /* ---------- 7. âm thanh ---------- */
  if ($("wave")) {
    const cv = $("wave"), g = cv.getContext("2d"), W = cv.width, H = cv.height, S = { norm: false, duck: false, nr: false };
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const voice = [], music = [], noise = [];
    for (let x = 0; x < W; x += 3) { const speak = x > W * .25 && x < W * .48 || x > W * .58 && x < W * .82; voice.push(speak ? (0.3 + 0.7 * Math.abs(Math.sin(x / 23))) * (0.4 + rnd() * .6) : 0); music.push(0.35 + 0.25 * Math.abs(Math.sin(x / 70)) * (0.6 + rnd() * .4)); noise.push(0.04 + rnd() * .05); }
    let ph = -1;
    function draw() {
      g.clearRect(0, 0, W, H); const k = S.norm ? 1.55 : 1, vm = H * .22, mm = H * .74;
      g.font = "500 20px JetBrains Mono, monospace"; g.fillStyle = "#9a99a8"; g.fillText("Giọng", 10, 28); g.fillText("Nhạc", 10, H * .55);
      voice.forEach((v, i) => { const x = i * 3, a = (v + (S.nr ? 0 : noise[i])) * k * H * .17; g.fillStyle = "#6fd3a5"; g.fillRect(x, vm - a, 2, a * 2); });
      music.forEach((m, i) => { const x = i * 3, ducked = S.duck && voice[i] > 0, a = m * (ducked ? .45 : 1) * k * H * .17; g.fillStyle = ducked ? "#8b7cff" : "#5f8fd8"; g.fillRect(x, mm - a, 2, a * 2); });
      if (S.duck) { g.fillStyle = "#c9c3ff"; g.fillText("ducking −8 dB", W * .3, H * .52); }
      if (ph >= 0) { g.fillStyle = "#f2c14e"; g.fillRect(ph * W, 0, 3, H); }
      $("auV").textContent = S.norm ? "−14,0" : "−21,6";
    }
    [["auNorm", "norm"], ["auDuck", "duck"], ["auNr", "nr"]].forEach(([id, k]) => $(id).onclick = () => { S[k] = !S[k]; $(id).setAttribute("aria-pressed", String(S[k])); draw(); });
    let raf = 0;
    $("auPlay").onclick = () => { cancelAnimationFrame(raf); const t0 = performance.now(); const step = now => { ph = Math.min(1, (now - t0) / 4000); draw(); if (ph < 1) raf = requestAnimationFrame(step); else { ph = -1; draw(); } }; raf = requestAnimationFrame(step); };
    draw();
  }

  /* ---------- 8. phông chữ ---------- */
  if ($("flist")) {
    const F = [["Be Vietnam Pro", "Không chân", true], ["Unbounded", "Tiêu đề", true], ["JetBrains Mono", "Đơn cách", true], ["Playfair Display", "Có chân", false], ["Lobster", "Viết tay", false], ["Pacifico", "Viết tay", false], ["Bricolage Grotesque", "Tiêu đề", false], ["Anton", "Tiêu đề", false]];
    const list = $("flist"), prev = $("fsPrev");
    function row(name, kind, ok, custom) {
      const r = document.createElement("div"); r.className = "frow";
      r.innerHTML = '<div style="min-width:0"><div class="p" style="font-family:\'' + name + '\',system-ui">' + (prev.value || "Aa") + "</div><small>" + name + " · " + kind + "</small></div>" + (custom ? '<button type="button" class="ok">Đã nhập ✓</button>' : '<button type="button" class="' + (ok ? "ok" : "") + '">' + (ok ? "Đã cài ✓" : "Cài") + "</button>");
      const b = r.querySelector("button");
      if (!custom) b.onclick = () => {
        if (b.classList.contains("ok")) { b.classList.remove("ok"); b.textContent = "Cài"; return; }
        b.textContent = "Đang cài…";
        const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=" + name.replace(/ /g, "+") + ":wght@400;700&display=swap&subset=vietnamese";
        l.onload = () => { b.classList.add("ok"); b.textContent = "Đã cài ✓"; }; l.onerror = () => { b.textContent = "Không tải được"; };
        document.head.appendChild(l);
      };
      list.appendChild(r);
    }
    F.forEach(f => row(...f));
    prev.oninput = () => list.querySelectorAll(".p").forEach(p => p.textContent = prev.value || "Aa");
    const drop = $("fdrop"), file = $("ffile");
    async function load(f) {
      if (!f) return; try {
        const name = "Font của bạn " + (list.querySelectorAll(".frow").length + 1), face = new FontFace(name, await f.arrayBuffer()); await face.load(); document.fonts.add(face);
        row(name, f.name, true, true); list.lastChild.scrollIntoView({ block: "nearest" });
      } catch (e) { drop.textContent = "Không đọc được file phông này. Thử file .ttf, .otf, .woff, .woff2 khác."; }
    }
    file.onchange = () => load(file.files[0]);
    drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("over"); load(e.dataTransfer.files[0]); });
  }

  /* ---------- 9. tải từ link ---------- */
  if ($("lkIn")) {
    const inp = $("lkIn"), bar = $("lkBar"), msg = $("lkMsg"); let tm = 0;
    document.querySelectorAll("#lkEx button").forEach(b => b.onclick = () => { inp.value = b.dataset.u; });
    $("lkGo").onclick = () => {
      clearInterval(tm); bar.style.width = "0"; bar.style.background = "#6fd3a5";
      const u = inp.value.trim(), name = (u.split("/").pop() || "").split("?")[0];
      if (!/^https?:\/\//.test(u)) { msg.textContent = "Link hỏng: cần bắt đầu bằng http:// hoặc https://"; return; }
      if (/youtube\.com|youtu\.be|tiktok\.com|facebook\.com/.test(u)) { msg.textContent = "Trang này không cho tải trực tiếp bằng link. Chỉ nên tải nội dung của bạn hoặc được phép sử dụng."; bar.style.background = "#ef6a5a"; bar.style.width = "100%"; return; }
      if (!/\.(mp4|mov|webm|mp3|wav|m4a|jpg|jpeg|png|webp)$/i.test(name)) { msg.textContent = "Đang dò video nhúng trong trang… Không thấy file video, nhạc hay ảnh ở link này."; return; }
      const total = /\.(mp3|wav|m4a)$/i.test(name) ? 6.4 : /\.(jpg|jpeg|png|webp)$/i.test(name) ? 1.2 : 20.8; let p = 0;
      tm = setInterval(() => { p = Math.min(1, p + .06 + Math.random() * .05); bar.style.width = p * 100 + "%";
        msg.textContent = "Đang tải… " + (total * p).toFixed(1).replace(".", ",") + " MB / " + total.toFixed(1).replace(".", ",") + " MB (" + Math.round(p * 100) + "%)";
        if (p >= 1) { clearInterval(tm); msg.textContent = "✓ Đã lưu vào Thư viện: " + name; $("lkLib").insertAdjacentHTML("beforeend", '<span class="f">' + name + "</span>"); } }, 120);
    };
  }

  /* ---------- 10. trợ lý AI ---------- */
  if ($("aiTl")) {
    const A0 = [{ n: "Phụ đề", c: [] }, { n: "Video", c: [{ n: "Cảnh 1", l: 0, w: 24, k: "c1" }, { n: "Cảnh 2", l: 25, w: 20, k: "c2" }, { n: "Cảnh 3", l: 46, w: 30, k: "c1" }, { n: "Cảnh 4", l: 77, w: 22, k: "c2" }] }, { n: "Nhạc", c: [{ n: "Nhạc nền", l: 0, w: 100, k: "c3" }] }];
    let st = clone(A0); const box = $("aiTl"), chat = $("aiChat");
    const R = { sub: ["Thêm phụ đề vàng", "Đã tạo phụ đề từ giọng nói, chữ vàng, viền đen.", () => { st[0].c = [{ n: "“Chào mừng…”", l: 2, w: 30, k: "c5", cls: "new" }, { n: "“Hôm nay…”", l: 36, w: 34, k: "c5", cls: "new" }, { n: "“Cảm ơn!”", l: 74, w: 22, k: "c5", cls: "new" }]; }],
      swap: ["Thay cảnh ở giây 30", "Đã thay Cảnh 3 bằng clip mới trong Thư viện, giữ nguyên độ dài.", () => { st[1].c[2] = { n: "Cảnh mới ✦", l: 46, w: 30, k: "c4", cls: "new" }; }],
      vol: ["Nhạc nhỏ thêm 4 dB", "Đã giảm nhạc nền 4 dB.", () => { st[2].c[0] = { n: "Nhạc nền · −4 dB", l: 0, w: 100, k: "c3", cls: "dim" }; }],
      undo: ["Hoàn tác", "Đã hoàn tác mọi thay đổi.", () => { st = clone(A0); }] };
    document.querySelectorAll("#aiCmd button").forEach(b => b.onclick = () => {
      const [q, a, fn] = R[b.dataset.c]; chat.insertAdjacentHTML("beforeend", '<p class="u">' + q + "</p>"); chat.scrollTop = chat.scrollHeight;
      setTimeout(() => { fn(); drawLanes(box, st); chat.insertAdjacentHTML("beforeend", '<p class="a">' + a + "</p>"); chat.scrollTop = chat.scrollHeight; }, 500);
    });
    drawLanes(box, st);
  }

  /* ---------- 11. xuất video ---------- */
  if ($("xFr")) {
    const fr = $("xFr"), lbl = $("xLbl");
    const val = id => $(id).querySelector('[aria-pressed="true"]').textContent;
    function upd() { const a = $("xAsp").querySelector('[aria-pressed="true"]'); fr.style.aspectRatio = a.dataset.r; const [w, h] = a.dataset.r.split("/").map(Number); fr.style.height = w > h ? "auto" : "200px"; fr.style.width = w > h ? "94%" : "auto"; lbl.textContent = val("xRes") + " · " + val("xFps") + " fps · " + a.textContent; }
    ["xRes", "xAsp", "xFps"].forEach(id => $(id).querySelectorAll("button").forEach(b => b.onclick = () => { press($(id), b); upd(); }));
    let tm = 0;
    $("xGo").onclick = () => { clearInterval(tm); const fps = +val("xFps"), tot = fps * 30; let f = 0;
      tm = setInterval(() => { f = Math.min(tot, f + Math.ceil(tot / 40)); $("xBar").style.width = f / tot * 100 + "%"; $("xMsg").textContent = "Đang xuất khung " + f + " / " + tot + " · chuẩn độ to −14 LUFS";
        if (f >= tot) { clearInterval(tm); $("xMsg").textContent = "✓ Xong: video_" + val("xRes") + ".mp4 (H.264 + AAC)"; } }, 70); };
    upd();
  }
})();
