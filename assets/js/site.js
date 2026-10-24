(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Collection index: search + category filters
     ------------------------------------------------------------------------ */

  function initCollection(root) {
    var input = root.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(root.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(root.querySelectorAll(".card"));
    var count = root.querySelector("[data-count]");
    var empty = root.querySelector("[data-empty]");
    var reset = root.querySelector("[data-reset]");
    var singular = root.getAttribute("data-singular") || "item";
    var total = cards.length;

    var params = new URLSearchParams(window.location.search);
    var state = {
      q: params.get("q") || "",
      category: params.get("category") || ""
    };

    if (!chips.some(function (c) { return c.getAttribute("data-filter") === state.category; })) {
      state.category = "";
    }
    if (input) input.value = state.q;

    function apply() {
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var matchesCategory = !state.category || card.getAttribute("data-category") === state.category;
        var matchesSearch = terms.every(function (t) { return haystack.indexOf(t) !== -1; });
        var visible = matchesCategory && matchesSearch;
        card.hidden = !visible;
        if (visible) shown++;
      });

      chips.forEach(function (chip) {
        chip.setAttribute("aria-pressed", String(chip.getAttribute("data-filter") === state.category));
      });

      if (count) {
        var noun = singular + (shown === 1 ? "" : "s");
        count.textContent = shown === total ? total + " " + noun : shown + " of " + total + " " + singular + "s";
      }
      if (empty) empty.hidden = shown !== 0;

      var next = new URLSearchParams();
      if (state.category) next.set("category", state.category);
      if (state.q) next.set("q", state.q);
      var qs = next.toString();
      history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
    }

    if (input) {
      input.addEventListener("input", function () {
        state.q = input.value.trim();
        apply();
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.category = chip.getAttribute("data-filter");
        apply();
      });
    });

    if (reset) {
      reset.addEventListener("click", function () {
        state.q = "";
        state.category = "";
        if (input) input.value = "";
        apply();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && input && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
      }
    });

    // Micrographs for the hover lens are only downloaded once a card is hovered.
    root.querySelectorAll(".card__lens").forEach(function (lens) {
      var img = lens.querySelector("img[data-lens-src]");
      var link = lens.closest(".card__link");
      if (!img || !link) return;
      function load() {
        if (img.getAttribute("src")) return;
        img.addEventListener("load", function () { lens.classList.add("is-loaded"); }, { once: true });
        img.src = img.getAttribute("data-lens-src");
      }
      link.addEventListener("pointerenter", load);
      link.addEventListener("focus", load);
    });

    apply();
  }

  /* ------------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------------ */

  function initLightbox(dialog) {
    var img = dialog.querySelector("[data-lightbox-img]");
    var caption = dialog.querySelector("[data-lightbox-caption]");
    var counter = dialog.querySelector("[data-lightbox-counter]");
    var prev = dialog.querySelector('[data-lightbox-step="-1"]');
    var next = dialog.querySelector('[data-lightbox-step="1"]');

    // Images placed directly in an item's Markdown text can be enlarged too.
    document.querySelectorAll("[data-lightbox-scope] img").forEach(function (el) {
      el.setAttribute("data-lightbox", "");
      el.setAttribute("data-src", el.currentSrc || el.src);
      el.setAttribute("data-caption", el.alt || "");
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", "Enlarge " + (el.alt || "image"));
    });

    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!triggers.length) return;

    var items = triggers.map(function (el) {
      return {
        src: el.getAttribute("data-src"),
        caption: el.getAttribute("data-caption") || "",
        rotate: el.hasAttribute("data-rotate")
      };
    });
    var current = 0;

    function show(index) {
      current = (index + items.length) % items.length;
      var item = items[current];
      img.classList.add("is-loading");
      img.classList.toggle("is-rotated", item.rotate);
      img.onload = function () { img.classList.remove("is-loading"); };
      img.src = item.src;
      img.alt = item.caption;
      caption.textContent = item.caption;
      counter.textContent = items.length > 1 ? (current + 1) + " / " + items.length : "";
      prev.hidden = next.hidden = items.length < 2;
    }

    function open(index) {
      show(index);
      if (!dialog.open) dialog.showModal();
    }

    triggers.forEach(function (el, i) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        open(i);
      });
      if (el.tagName === "IMG") {
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(i);
          }
        });
      }
    });

    prev.addEventListener("click", function () { show(current - 1); });
    next.addEventListener("click", function () { show(current + 1); });
    dialog.querySelector("[data-lightbox-close]").addEventListener("click", function () { dialog.close(); });

    // Clicking the dark area around the image closes the viewer.
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.classList.contains("lightbox__stage")) dialog.close();
    });

    document.addEventListener("keydown", function (e) {
      if (!dialog.open) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
    });

    var touchX = null;
    dialog.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ------------------------------------------------------------------------
     Item page: arrow keys move to the previous / next item
     ------------------------------------------------------------------------ */

  function initPager() {
    var prev = document.querySelector("[data-pager-prev]");
    var next = document.querySelector("[data-pager-next]");
    if (!prev && !next) return;

    document.addEventListener("keydown", function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (document.querySelector("dialog[open]")) return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft" && prev) window.location.href = prev.href;
      if (e.key === "ArrowRight" && next) window.location.href = next.href;
    });
  }

  document.querySelectorAll("[data-collection]").forEach(initCollection);
  document.querySelectorAll("[data-lightbox-dialog]").forEach(initLightbox);
  initPager();
})();
