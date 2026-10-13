const header = document.querySelector(".header");
const burgerBtn = document.querySelector(".header__burger-btn");
const menu = document.querySelector(".header__menu");

const links = document.querySelectorAll(".menu__list li a");
const sections = document.querySelectorAll("section[id]");

let isScrollingProgrammatically = false;
let scrollAnimationId = null;

function getHeaderHeight() {
  return header.offsetHeight;
}

// Smooth scroll
function stopSmoothScroll() {
  cancelAnimationFrame(scrollAnimationId);
  scrollAnimationId = null;
  isScrollingProgrammatically = false;
  window.removeEventListener("wheel", stopSmoothScroll);
  window.removeEventListener("touchstart", stopSmoothScroll);
  window.removeEventListener("keydown", stopSmoothScroll);
}

function smoothScrollTo(targetY, duration = 600) {
  stopSmoothScroll();

  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  targetY = Math.max(0, Math.min(targetY, maxY));

  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime = null;

  isScrollingProgrammatically = true;

  window.addEventListener("wheel", stopSmoothScroll, { passive: true });
  window.addEventListener("touchstart", stopSmoothScroll, { passive: true });
  window.addEventListener("keydown", stopSmoothScroll);

  function step(timestamp) {
    if (startTime === null) startTime = timestamp;

    const time = timestamp - startTime;
    const percent = Math.min(time / duration, 1);

    const ease = percent < 0.5
      ? 4 * percent * percent * percent
      : 1 - Math.pow(-2 * percent + 2, 3) / 2;

    window.scrollTo({ top: startY + diff * ease, behavior: "instant" });

    if (percent < 1) {
      scrollAnimationId = requestAnimationFrame(step);
    } else {
      stopSmoothScroll();
      updateActiveLink();
    }
  }

  scrollAnimationId = requestAnimationFrame(step);
}

// Navigation links
links.forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#") || href.length < 2) return;

    const targetSection = document.getElementById(href.slice(1));
    if (!targetSection) return;

    e.preventDefault();

    links.forEach(l => l.classList.remove("menu-active"));
    link.classList.add("menu-active");

    header.classList.remove("open");
    document.body.classList.remove("lock");
    burgerBtn.setAttribute("aria-expanded", "false");

    const targetY = targetSection.getBoundingClientRect().top
      + window.scrollY
      - getHeaderHeight();

    smoothScrollTo(targetY);
  });
});

// Burger menu
burgerBtn.setAttribute("aria-expanded", "false");

burgerBtn.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");

  document.body.classList.toggle("lock", isOpen);
  burgerBtn.setAttribute("aria-expanded", String(isOpen));
});

// Close menu with Escape
window.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    header.classList.remove("open");
    document.body.classList.remove("lock");
    burgerBtn.setAttribute("aria-expanded", "false");
  }
});

// Header scroll effect
function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 50);
}

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("load", updateHeader);
window.addEventListener("pageshow", updateHeader);
updateHeader();

// Photography tabs
const tabButtons = document.querySelectorAll(".tab_menu-btn");
const tabContents = document.querySelectorAll(".photography__list");

tabButtons.forEach(button => {
  button.classList.remove("active");
});

tabContents.forEach(content => {
  content.classList.remove("active");
});

if (tabButtons[0] && tabContents[0]) {
  tabButtons[0].classList.add("active");
  tabContents[0].classList.add("active");
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-button");
    const targetContent = document.getElementById(targetId);

    if (!targetContent) return;

    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    button.classList.add("active");
    targetContent.classList.add("active");
  });
});

// Active navigation on scroll
function setActiveLink(id) {
  links.forEach(link => {
    link.classList.toggle(
      "menu-active",
      link.getAttribute("href") === `#${id}`
    );
  });
}

function updateActiveLink() {
  if (isScrollingProgrammatically) return;

  const scrollPos = getHeaderHeight() + 5;
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;

  let currentSection = "";

  if (atBottom && sections.length) {
    currentSection = sections[sections.length - 1].id;
  } else {
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].getBoundingClientRect().top <= scrollPos) {
        currentSection = sections[i].id;
        break;
      }
    }
  }

  if (currentSection) {
    setActiveLink(currentSection);
  } else {
    links.forEach(link => link.classList.remove("menu-active"));
  }
}

let ticking = false;

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;

  requestAnimationFrame(() => {
    updateActiveLink();
    ticking = false;
  });
}, { passive: true });

window.addEventListener("resize", updateActiveLink);
window.addEventListener("load", updateActiveLink);
window.addEventListener("pageshow", updateActiveLink);
updateActiveLink();