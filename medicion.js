/*
 * Medición de visitas: Google Analytics 4 + Microsoft Clarity, con aviso de cookies.
 *
 * Cómo activarlo: pega tus dos códigos aquí abajo y sube los cambios.
 *  - GA4_ID:     analytics.google.com → Administrar → Flujos de datos → "ID de medición" (empieza con G-)
 *  - CLARITY_ID: clarity.microsoft.com → tu proyecto → Settings → Setup (el código de ~10 letras)
 * Si un código queda vacío, esa herramienta no se carga. Si ambos están vacíos, no aparece nada.
 *
 * Nada se carga hasta que el visitante pulsa "Aceptar". Si rechaza, no se mide.
 */
(function () {
  var GA4_ID = "G-KHXRFEN4BJ";
  var CLARITY_ID = "zkad55xnff";

  if (!GA4_ID && !CLARITY_ID) return;

  var KEY = "consentimiento-cookies";
  var loaded = false;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function lang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "es") return q;
    var h = (document.documentElement.lang || "").slice(0, 2);
    if (h === "en") return "en";
    return (navigator.language || "es").toLowerCase().indexOf("en") === 0 ? "en" : "es";
  }

  // ---------- Carga de herramientas ----------
  function loadTools() {
    if (loaded) return;
    loaded = true;

    if (GA4_ID) {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", GA4_ID);
    }

    if (CLARITY_ID) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", CLARITY_ID);
      window.clarity("consent");
    }
  }

  // ---------- Eventos: contactos por WhatsApp y correo ----------
  function track(name, params) {
    if (!loaded) return;
    params = params || {};
    params.pagina = location.pathname.split("/").pop() || "index.html";
    if (window.gtag) window.gtag("event", name, params);
    if (window.clarity) window.clarity("event", name);
  }

  function kindOf(url) {
    url = String(url || "");
    if (url.indexOf("wa.me/") !== -1 || url.indexOf("whatsapp.com") !== -1) return "clic_whatsapp";
    if (url.indexOf("mailto:") === 0) return "clic_correo";
    return null;
  }

  // Enlaces y botones normales
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var k = kindOf(a.getAttribute("href"));
    if (k) track(k, { boton: a.id || (a.textContent || "").trim().slice(0, 60) });
  }, true);

  // Formularios de cotización (abren WhatsApp o correo desde código)
  document.addEventListener("submit", function (e) {
    var f = e.target;
    track("cotizacion_enviada", { formulario: f.id || f.getAttribute("name") || "formulario" });
  }, true);

  // ---------- Aviso de cookies ----------
  var TXT = {
    es: {
      msg: "Uso cookies para medir las visitas y mejorar esta web. ¿Me das permiso?",
      ok: "Aceptar",
      no: "Rechazar"
    },
    en: {
      msg: "I use cookies to measure visits and improve this website. Is that OK?",
      ok: "Accept",
      no: "Decline"
    }
  };

  function showBanner() {
    if (document.getElementById("aviso-cookies")) return;
    var t = TXT[lang()];
    var css = document.createElement("style");
    css.textContent =
      "#aviso-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:560px;margin:0 auto;" +
      "background:#111;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.3);" +
      "font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;gap:12px;align-items:center;flex-wrap:wrap}" +
      "#aviso-cookies p{margin:0;flex:1 1 240px}" +
      "#aviso-cookies .ac-btns{display:flex;gap:8px}" +
      "#aviso-cookies button{font:inherit;font-weight:600;border-radius:999px;padding:8px 16px;cursor:pointer;border:1px solid #fff}" +
      "#aviso-cookies .ac-ok{background:#fff;color:#111}" +
      "#aviso-cookies .ac-no{background:transparent;color:#fff}";
    document.head.appendChild(css);

    var box = document.createElement("div");
    box.id = "aviso-cookies";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Cookies");
    box.innerHTML =
      "<p></p><div class='ac-btns'><button type='button' class='ac-no'></button>" +
      "<button type='button' class='ac-ok'></button></div>";
    box.querySelector("p").textContent = t.msg;
    box.querySelector(".ac-ok").textContent = t.ok;
    box.querySelector(".ac-no").textContent = t.no;
    box.querySelector(".ac-ok").onclick = function () { setChoice("si"); box.remove(); loadTools(); };
    box.querySelector(".ac-no").onclick = function () { setChoice("no"); box.remove(); };
    document.body.appendChild(box);
  }

  // Para reabrir el aviso desde un enlace: <a href="#" onclick="medicionPreferencias();return false">Cookies</a>
  window.medicionPreferencias = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    showBanner();
  };

  function start() {
    var c = getChoice();
    if (c === "si") loadTools();
    else if (c !== "no") showBanner();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
