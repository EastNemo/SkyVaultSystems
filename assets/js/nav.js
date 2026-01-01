/* ============================
   SKYVAULT MOBILE NAV TOGGLE
============================ */

document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".nav-toggle");
  if (!toggles.length) return;

  const closeMenu = (header, btn) => {
    header.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
  };

  toggles.forEach((btn) => {
    const header = btn.closest("header");
    if (!header) return;

    btn.addEventListener("click", () => {
      const isOpen = header.classList.contains("menu-open");
      if (isOpen) closeMenu(header, btn);
      else {
        header.classList.add("menu-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    // Close menu after clicking a link (mobile UX)
    header.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (a.closest(".brand")) return;
      if (header.classList.contains("menu-open")) closeMenu(header, btn);
    });
  });

  // If resized to desktop, ensure menus are closed
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      document.querySelectorAll("header.menu-open").forEach((h) => {
        const btn = h.querySelector(".nav-toggle");
        h.classList.remove("menu-open");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }
  });
});
