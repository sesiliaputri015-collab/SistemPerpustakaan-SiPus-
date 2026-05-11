/* SIPUS shared client script
 * - localStorage dark-mode persistence
 * - active bottom-nav highlighting
 * - smooth page transitions
 * - search filter for the catalog (buku.html)
 */
(function () {
  "use strict";

  // ---------- Theme ----------
  const THEME_KEY = "sipus-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }

  function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!stored) {
      stored = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark" : "light";
    }
    applyTheme(stored);
    return stored;
  }

  function toggleTheme() {
    const next = root.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  initTheme();

  // ---------- DOM Ready ----------
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.body && document.body.classList.add("fade-in");

    // Dark mode toggle button (#btn-toggle-dark) — present on most pages
    document.querySelectorAll("#btn-toggle-dark, [data-action='toggle-dark']").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });

    // ---------- Active bottom nav ----------
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const navMap = {
      beranda: ["beranda.html"],
      buku:    ["buku.html", "pinjambuku.html"],
      pinjam:  ["koleksi.html", "konfirmasi_pinjam.html", "berhasilpinja.html",
                "pembayaran_denda.html", "konfirmasi_denda.html"],
      akun:    ["account.html"],
    };
    let activeKey = null;
    Object.keys(navMap).forEach(function (k) {
      if (navMap[k].indexOf(path) !== -1) activeKey = k;
    });
    if (activeKey) {
      document.querySelectorAll("#bottom-nav [data-nav]").forEach(function (link) {
        if (link.getAttribute("data-nav") === activeKey) link.classList.add("active");
        else link.classList.remove("active");
      });
    }

    // ---------- Smooth navigation ----------
    document.querySelectorAll("a[href]").forEach(function (a) {
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || a.target === "_blank") return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        document.body.style.transition = "opacity 150ms ease";
        document.body.style.opacity = "0";
        setTimeout(function () { window.location.href = href; }, 140);
      });
    });

    // ---------- Logout ----------
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        try { localStorage.removeItem("sipus-user"); } catch (err) {}
        window.location.href = "/";
      });
    }

    // ---------- Catalog search (buku.html) ----------
    const search = document.getElementById("search-input");
    const grid = document.getElementById("book-grid");
    if (search && grid) {
      const cards = Array.from(grid.querySelectorAll("[data-title]"));
      const empty = document.getElementById("search-empty");

      function runFilter() {
        const q = search.value.trim().toLowerCase();
        let visible = 0;
        cards.forEach(function (c) {
          const title  = (c.dataset.title  || "").toLowerCase();
          const author = (c.dataset.author || "").toLowerCase();
          const cat    = (c.dataset.category || "").toLowerCase();
          const match = !q || title.indexOf(q) !== -1 || author.indexOf(q) !== -1 || cat.indexOf(q) !== -1;
          c.style.display = match ? "" : "none";
          if (match) visible++;
        });
        if (empty) empty.style.display = visible === 0 ? "" : "none";
      }
      search.addEventListener("input", runFilter);

      // Category chips
      document.querySelectorAll("[data-filter-category]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          const cat = chip.getAttribute("data-filter-category");
          document.querySelectorAll("[data-filter-category]").forEach(function (c) {
            c.classList.remove("bg-primary", "text-white");
            c.classList.add("bg-surface-container", "dark:bg-slate-800", "text-on-surface", "dark:text-slate-300");
          });
          chip.classList.add("bg-primary", "text-white");
          chip.classList.remove("bg-surface-container", "dark:bg-slate-800", "text-on-surface", "dark:text-slate-300");
          search.value = cat === "Semua" ? "" : cat;
          runFilter();
        });
      });
    }

    // ---------- Login form ----------
    const loginForm = document.getElementById("form-login");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        if (!email) return;
        try { localStorage.setItem("sipus-user", email); } catch (err) {}
        document.body.style.transition = "opacity 150ms ease";
        document.body.style.opacity = "0";
        setTimeout(function () { window.location.href = "/beranda.html"; }, 140);
      });
    }

    // ---------- Register form ----------
    const regForm = document.getElementById("form-register");
    if (regForm) {
      regForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("reg-email").value.trim();
        if (!email) return;
        try { localStorage.setItem("sipus-user", email); } catch (err) {}
        window.location.href = "/beranda.html";
      });
    }
  });
})();
