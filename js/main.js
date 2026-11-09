/* =====================================================================
   きのくに焙煎所  表示用プログラム
   商品情報は js/products.js にあります。通常、このファイルは編集不要です。
   ===================================================================== */
(function () {
  "use strict";

  /* 別のページに移動したとき、前のページのスクロール位置が残らず、
     ページの一番上から表示されるようにする（#付きのリンクはその場所へ） */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  function showTop() {
    if (location.hash) return;
    window.scrollTo(0, 0);
    try { document.documentElement.scrollIntoView({ block: "start" }); } catch (e) {}
  }
  showTop();
  window.addEventListener("load", function () {
    showTop();
    setTimeout(showTop, 60);
    setTimeout(showTop, 300);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) showTop(); });

  /* 今いるページと同じページへのリンクは、読み込み直さずに一番上へ戻る */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank" || a.hash) return;
    var here = location.pathname.split("/").pop() || "index.html";
    var there = a.pathname.split("/").pop() || "index.html";
    if (a.host === location.host && here === there) {
      e.preventDefault();
      var top = document.querySelector("main") || document.body;
      window.scrollTo({ top: 0, behavior: "smooth" });
      try { document.documentElement.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (err) {}
      if (document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        var mb = document.getElementById("menu-btn");
        if (mb) mb.setAttribute("aria-expanded", "false");
      }
    }
  });

  var ROAST_NAMES = ["", "ミディアム", "ハイ", "シティ", "フルシティ", "フレンチ"];
  var MIX_COLORS = ["#2F4A36", "#A9805A", "#C9A45C", "#7D9572"];

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function priceKari() {
    return (typeof SHOP !== "undefined" && SHOP.pricesConfirmed === false)
      ? '<p class="price-kari">価格<span class="kari" title="確認中の仮の価格です">仮</span></p>' : "";
  }
  function yen(n) { return "¥" + Number(n).toLocaleString("ja-JP"); }

  /* 未確定の情報に付ける「仮」の印（products.js の tasteConfirmed が false のとき） */
  function kari(item) {
    return item && item.tasteConfirmed === false ? '<span class="kari" title="確認中の仮の内容です">仮</span>' : "";
  }
  function roastMeter(level, item) {
    var n = Math.max(1, Math.min(5, Number(level) || 1));
    var dots = "";
    for (var i = 1; i <= 5; i++) dots += '<i class="' + (i <= n ? "on" : "") + '"></i>';
    return '<div class="roast-meter"><span class="dots" aria-hidden="true">' + dots +
      '</span><span>焙煎度：' + ROAST_NAMES[n] + "</span>" + kari(item) + "</div>";
  }
  function flavorTags(list, item) {
    if (!list || !list.length) return "";
    return '<div class="flavor-wrap"><p class="flavor-label">味わいのイメージ' + kari(item) + '</p><ul class="flavor">' +
      list.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>";
  }
  function priceBlock(item) {
    var link = item.shopLink || SHOP.storesUrl;
    var prices = (item.prices || []).map(function (p) {
      return '<div class="price"><span>' + esc(p.size) + "</span><strong>" + yen(p.yen) + "</strong></div>";
    }).join("");
    return '<div class="card-foot"><div class="prices">' + prices + '</div>' +
      '<a class="buy-link" href="' + esc(link) + '" target="_blank" rel="noopener">ショップで見る</a></div>';
  }
  function blendBar(blend) {
    blend = blend || [];
    var hasPct = blend.every(function (b) { return b[1] != null; });
    var bar = blend.map(function (b, i) {
      var w = hasPct ? Number(b[1]) : 100 / blend.length;
      return '<span style="width:' + w + "%;background:" + MIX_COLORS[i % MIX_COLORS.length] + '"></span>';
    }).join("");
    var legend = blend.map(function (b, i) {
      return '<li><i style="background:' + MIX_COLORS[i % MIX_COLORS.length] + '"></i>' + esc(b[0]) +
        (hasPct ? " <strong>" + Number(b[1]) + "%</strong>" : "") + "</li>";
    }).join("");
    var label = blend.map(function (b) { return b[0] + (hasPct ? " " + b[1] + "%" : ""); }).join("、");
    return '<div class="blend"><p class="blend-label">配合</p>' +
      (hasPct ? '<div class="blend-bar" role="img" aria-label="配合 ' + esc(label) + '">' + bar + "</div>" : "") +
      '<ul class="blend-legend">' + legend + "</ul></div>";
  }

  function cardImage(item) {
    if (!item.image) return "";
    var img = '<img class="card-image" src="' + esc(item.image) + '" alt="' + esc(item.imageAlt || "") +
      '" width="400" height="220" decoding="async">';
    if (!item.specialty) return img;
    return '<div class="card-figure">' + img +
      '<span class="specialty-mark"><span class="specialty-en">SPECIALTY</span>スペシャルティコーヒー</span></div>';
  }
  function badge(item) { return item.badge ? '<span class="badge">' + esc(item.badge) + "</span>" : ""; }

  function specList(item) {
    var rows = [["産地", item.region], ["標高", item.altitude], ["精製方法", item.process], ["品種", item.variety]]
      .filter(function (r) { return r[1]; })
      .map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
    return rows ? '<details class="spec-details"><summary>産地の情報</summary><dl class="specs">' + rows + "</dl></details>" : "";
  }
  function singleCard(item, i) {
    return '<article class="card card-origin" id="origin-' + (i + 1) + '">' + cardImage(item) +
      '<div class="card-top"><span class="card-kicker">' + esc(item.country) + "</span>" + badge(item) + "</div>" +
      '<h3 class="card-title">' + esc(item.name) + "</h3>" +
      roastMeter(item.roast, item) +
      '<p class="card-text">' + esc(item.comment) + "</p>" +
      specList(item) +
      flavorTags(item.flavor, item) + priceBlock(item) + "</article>";
  }
  function blendCard(item, kicker) {
    return '<article class="card">' + cardImage(item) +
      '<div class="card-top"><span class="card-kicker">' + esc(kicker) + "</span>" + badge(item) + "</div>" +
      '<h3 class="card-title">' + esc(item.name) + "</h3>" +
      roastMeter(item.roast, item) +
      '<p class="card-text">' + esc(item.comment) + "</p>" +
      blendBar(item.blend) + flavorTags(item.flavor, item) + priceBlock(item) + "</article>";
  }

  function render(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
  render("single-list", SINGLE_ORIGINS.map(singleCard).join(""));
  render("origin-jump", SINGLE_ORIGINS.map(function (item, i) {
    return '<li><a href="#origin-' + (i + 1) + '">' + esc(item.country) + "</a></li>";
  }).join(""));
  /* 産地の情報：パソコンでは最初から開き、スマートフォンでは閉じておく */
  (function () {
    var wide = window.matchMedia("(min-width: 801px)");
    function sync() {
      Array.prototype.forEach.call(document.querySelectorAll(".spec-details"), function (d) { d.open = wide.matches; });
    }
    sync();
    if (wide.addEventListener) wide.addEventListener("change", sync);
  })();
  render("standard-list", STANDARD_BLENDS.map(function (b) { return blendCard(b, b.scene); }).join(""));
  render("milk-list", MILK_BLENDS.map(function (b) { return blendCard(b, "おすすめ：" + b.howto); }).join(""));

  /* 「シングルオリジン」ページ（single.html） */
  var TASTES = ["すっきり", "まろやか", "甘み", "コク"];
  function soCard(item, i) {
    var link = item.shopLink || SHOP.storesUrl;
    var pf = item.profile || {};
    function cell(label, v, wide) {
      return '<div' + (wide ? ' class="wide"' : "") + '><dt>' + label + "</dt><dd>" +
        (v ? '<span class="so-val">' + esc(v) + "</span>" + kari(item) : '<span class="kari">仮</span>') + "</dd></div>";
    }
    function roastCell(it) {
      var n = Math.max(1, Math.min(5, Number(it.roast) || 0));
      if (!it.roast) return cell("焙煎度", "", true);
      var dots = "";
      for (var k = 1; k <= 5; k++) dots += '<i class="' + (k <= n ? "on" : "") + '"></i>';
      return '<div class="wide"><dt>焙煎度</dt><dd><span class="dots so-dots" role="img" aria-label="5段階中' + n + '">' + dots +
        '</span><span class="so-val">' + ROAST_NAMES[n] + "</span>" + kari(it) + "</dd></div>";
    }
    var dict = (typeof TERMS !== "undefined") ? TERMS : {};
    var terms = (item.terms || []).filter(function (t) { return dict[t]; }).map(function (t) {
      return '<details class="so-term"><summary>' + esc(t) + "ってなに？</summary>" +
        '<div class="so-term-body"><img src="images/squirrel.png" alt="" width="84" height="61" loading="lazy">' +
        '<p class="so-term-bubble"><span class="so-term-name">きの子</span>' + esc(dict[t]) + "</p></div></details>";
    }).join("");
    return '<article class="so-card" id="so-' + (i + 1) + '" data-taste="' + esc((item.taste || []).join(" ")) + '">' +
      '<div class="so-photo">' + cardImage(item).replace("card-figure", "card-figure so-figure") + "</div>" +
      '<div class="so-body">' +
        (item.specialty ? '<p class="so-sp"><span class="specialty-mark"><span class="specialty-en">SPECIALTY</span>スペシャルティコーヒー</span></p>' : "") +
        '<h3 class="so-name">' + esc(item.name) + "</h3>" +
        (item.comment ? '<p class="so-desc">' + esc(item.comment) + (item.commentConfirmed === false ? kari(item) : "") + "</p>" : "") +
        ((item.recommend || []).length ? '<div class="bp-rec bp-rec-kino so-rec"><img src="images/squirrel.png" alt="" width="96" height="70" loading="lazy">' +
          '<div class="bp-rec-bubble"><p class="bp-rec-name">きの子</p><h4>こんな方におすすめだよ</h4><ul>' +
          item.recommend.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul></div></div>" : "") +
        '<dl class="so-profile">' + roastCell(item) + "</dl>" +
        (terms ? '<div class="so-terms">' + terms + "</div>" : "") +
        '<div class="so-foot">' +
          priceKari() + '<div class="so-prices">' + (item.prices || []).map(function (p) {
            return '<div class="so-price"><span>' + esc(p.size) + "</span><strong>" + Number(p.yen).toLocaleString("ja-JP") + "<small>円</small></strong></div>";
          }).join("") + "</div>" +
          '<a class="btn btn-primary so-btn" href="' + esc(link) + '" target="_blank" rel="noopener">商品を見る</a>' +
        "</div>" +
      "</div></article>";
  }
  var soList = document.getElementById("so-list");
  if (soList && typeof SINGLE_ORIGINS !== "undefined") {
    soList.innerHTML = SINGLE_ORIGINS.map(soCard).join("");
    var jump = document.getElementById("so-jump-list");
    if (jump) {
      jump.innerHTML = SINGLE_ORIGINS.map(function (item, i) {
        return '<li><a href="#so-' + (i + 1) + '">' + esc(item.country) + '<span aria-hidden="true">↓</span></a></li>';
      }).join("");
    }
    var count = document.getElementById("so-count");
    var empty = document.getElementById("so-empty");
    var buttons = document.querySelectorAll(".taste-btn, .taste-all");
    function applyTaste(taste) {
      var shown = 0;
      Array.prototype.forEach.call(soList.children, function (card) {
        var tags = (card.getAttribute("data-taste") || "").split(" ");
        var ok = !taste || tags.indexOf(taste) !== -1;
        card.hidden = !ok;
        if (ok) shown++;
      });
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute("aria-pressed", String((b.getAttribute("data-taste") || "") === (taste || "")));
      });
      if (count) count.textContent = (taste ? "「" + taste + "」の豆：" : "すべての豆：") + shown + "種類";
      if (empty) empty.hidden = shown !== 0;
    }
    Array.prototype.forEach.call(buttons, function (b) {
      var taste = b.getAttribute("data-taste");
      if (taste) {
        var n = SINGLE_ORIGINS.filter(function (x) { return (x.taste || []).indexOf(taste) !== -1; }).length;
        var num = b.querySelector(".taste-num");
        if (num) num.textContent = n ? n + "種類" : "準備中";
      }
      b.addEventListener("click", function () { applyTaste(taste); });
    });
    applyTaste("");
  }

  /* 「ブレンドコーヒー」ページ（blend.html）の商品紹介 */
  function blendPageCard(item, i) {
    var lines = (item.description || []).map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("");
    var rec = (item.recommend || []).map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("");
    var prices = (item.prices || []).map(function (p) {
      return '<div class="price"><span>' + esc(p.size) + "</span><strong>" + yen(p.yen) + "</strong></div>";
    }).join("");
    var link = item.shopLink || SHOP.storesUrl;
    return '<article class="bp-card" id="blend-' + (i + 1) + '">' +
      '<div class="bp-image"><img src="' + esc(item.image) + '" alt="' + esc(item.imageAlt || item.name) +
        '" width="800" height="560" decoding="async">' +
        (item.label ? '<span class="bp-label">' + esc(item.label) + "</span>" : "") + "</div>" +
      '<div class="bp-body">' +
        (item.kicker ? '<p class="bp-kicker">' + esc(item.kicker) + "</p>" : "") +
        '<h2 class="bp-name">' + esc(item.name) + "</h2>" +
        (item.catchcopy ? '<p class="bp-catch">' + esc(item.catchcopy) + "</p>" : "") +
        (item.point ? '<p class="bp-point">' + item.point.split("\n").map(function (l, k) {
          return k === 0 ? '<span class="bp-point-head" style="--n:' + l.length + '">' + esc(l) + "</span>" : esc(l);
        }).join("\n") + "</p>" : "") +
        '<div class="bp-desc">' + lines + "</div>" +
        (item.blendOf ? '<p class="bp-blendof"><span>配合</span>' + esc(item.blendOf) + "</p>" : "") +
        '<div class="bp-rec bp-rec-kino"><img src="images/squirrel.png" alt="" width="96" height="70" loading="lazy">' +
          '<div class="bp-rec-bubble"><p class="bp-rec-name">きの子</p><h3>こんな方におすすめだよ</h3><ul>' + rec + "</ul></div></div>" +
        '<div class="bp-foot">' + priceKari() + '<div class="prices">' + prices + "</div>" +
        '<a class="btn btn-primary bp-btn" href="' + esc(link) + '" target="_blank" rel="noopener">商品を見る</a></div>' +
      "</div></article>";
  }
  if (typeof BLEND_PAGE !== "undefined") {
    render("blend-page-list", BLEND_PAGE.map(blendPageCard).join(""));
  }

  /* お店の情報とショップURLを反映 */
  Array.prototype.forEach.call(document.querySelectorAll("[data-shop]"), function (el) {
    el.textContent = SHOP[el.getAttribute("data-shop")] || "";
  });
  Array.prototype.forEach.call(document.querySelectorAll(".js-stores"), function (a) {
    a.setAttribute("href", SHOP.storesUrl);
  });
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* スマートフォン用メニューの開閉 */
  var menuBtn = document.getElementById("menu-btn");
  var nav = document.getElementById("global-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    };
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    Array.prototype.forEach.call(nav.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* メニューの「ブレンド」：タップすると中の項目を開閉する */
  var subToggles = document.querySelectorAll(".sub-toggle");
  function closeSubs(except) {
    Array.prototype.forEach.call(subToggles, function (b) {
      if (b !== except) b.setAttribute("aria-expanded", "false");
    });
  }
  Array.prototype.forEach.call(subToggles, function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = b.getAttribute("aria-expanded") !== "true";
      closeSubs(b);
      b.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".has-sub")) closeSubs(null);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSubs(null); });
  Array.prototype.forEach.call(document.querySelectorAll(".sub-menu a"), function (a) {
    a.addEventListener("click", function () { closeSubs(null); });
  });

  /* お問い合わせフォーム */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  function show(msg, ok) {
    status.hidden = false;
    status.textContent = msg;
    status.className = "form-status " + (ok ? "is-ok" : "is-error");
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("f-name").value.trim();
      var email = document.getElementById("f-email").value.trim();
      var message = document.getElementById("f-message").value.trim();
      var missing = [];
      if (!name) missing.push("お名前");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) missing.push("メールアドレス");
      if (!message) missing.push("お問い合わせ内容");
      if (missing.length) { show(missing.join("、") + "を正しく入力してください。", false); return; }

      if (!SHOP.formEndpoint) {
        show("送信先がまだ設定されていません。お手数ですが、メール（" + SHOP.email + "）でお問い合わせください。", false);
        return;
      }
      var button = form.querySelector("button[type=submit]");
      button.disabled = true;
      fetch(SHOP.formEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (res) {
        if (!res.ok) throw new Error();
        form.reset();
        show(name + " 様、お問い合わせを受け付けました。ありがとうございます。", true);
      }).catch(function () {
        show("送信できませんでした。時間をおいて再度お試しいただくか、メールでお問い合わせください。", false);
      }).then(function () { button.disabled = false; });
    });
  }
})();

/* =====================================================================
   販売開始前の表示（js/products.js の SHOP.preLaunch が true のとき）
   ===================================================================== */
(function () {
  if (typeof SHOP === "undefined" || !SHOP.preLaunch) return;
  document.body.classList.add("is-prelaunch");

  // 1. 全ページの上に「準備中」の帯
  var bar = document.createElement("div");
  bar.className = "prelaunch-bar";
  bar.setAttribute("role", "status");
  bar.innerHTML = '<span class="prelaunch-dot" aria-hidden="true"></span><span>' + SHOP.preLaunchText.split("。").filter(Boolean).map(function (t) {
    return '<span class="nobr">' + t + "。</span>";
  }).join("") + "</span>";
  document.body.insertBefore(bar, document.body.firstChild);

  // 2. ショップ・購入ボタンを「近日販売予定」に
  var sel = ".js-stores, .so-btn, .bp-btn, .buy-link";
  Array.prototype.forEach.call(document.querySelectorAll(sel), function (a) {
    var span = document.createElement("span");
    span.className = a.className + " is-soon";
    span.setAttribute("aria-disabled", "true");
    span.textContent = a.classList.contains("header-shop") ? "準備中" : "近日販売予定";
    a.parentNode.replaceChild(span, a);
  });

  // 3. トップページにお知らせ
  var heroText = document.querySelector(".hero-text");
  if (heroText) {
    var note = document.createElement("p");
    note.className = "prelaunch-note";
    note.innerHTML = '<span class="prelaunch-label">OPEN準備中</span><span class="nobr">当店はオンラインショップのみの販売です。</span><span class="nobr">ただいまオープンに向けて準備をしています。</span>';
    heroText.insertBefore(note, heroText.firstChild);
  }
})();
