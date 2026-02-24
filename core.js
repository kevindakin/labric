// GLOBAL VARIABLES
const durationBase = 0.8;
const durationSlow = 1.2;
const durationFast = 0.4;
const easeBase = "power4.inOut";

// GENERAL

function lenisScroll() {
  const lenis = new Lenis({
    lerp: 0.12,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

function isMenuOpen() {
  const menu = document.querySelector(".nav_menu");
  return menu && menu.getAttribute("aria-hidden") === "false";
}

function navScroll() {
  const navComponent = document.querySelector('[data-menu="nav"]');

  if (!navComponent) return;

  let navHidden = false;
  let activeTween = null;

  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      if (isMenuOpen()) {
        if (activeTween) activeTween.kill();
        gsap.set(navComponent, { y: "0%" });
        navHidden = false;
        return;
      }

      const scrollDistance = self.scroll();
      const navRect = navComponent.getBoundingClientRect();
      const threshold = navRect.height;
      const scrollingUp = self.direction === -1;

      if (scrollDistance === 0) {
        navComponent.classList.remove("is-scrolled");
      }

      if (!scrollingUp && !navHidden && scrollDistance > threshold) {
        if (activeTween) activeTween.kill();
        navHidden = true;

        activeTween = gsap.to(navComponent, {
          y: "-100%",
          duration: durationBase,
          ease: easeBase,
          onComplete: () => {
            navComponent.classList.add("is-scrolled");
            activeTween = null;
          },
        });
      } else if (scrollingUp && navHidden) {
        if (activeTween) activeTween.kill();
        navHidden = false;

        activeTween = gsap.to(navComponent, {
          y: "0%",
          duration: durationBase,
          ease: easeBase,
          onComplete: () => {
            activeTween = null;
          },
        });
      }
    },
  });
}

function navDropdown() {
  const nav = document.querySelector('[data-menu="nav"]');
  if (!nav) return;

  const items = nav.querySelectorAll('[data-dropdown="wrap"]');
  const isWide = window.matchMedia("(min-width: 992px)").matches;

  items.forEach((item) => {
    const link = item.querySelector('[data-dropdown="trigger"]');
    const menu = item.querySelector('[data-dropdown="menu"]');

    if (!link || !menu) return;

    const arrow = link.querySelector(".nav_dropdown_arrow");
    if (!arrow) return;

    const dropdownItems = menu.querySelectorAll('[data-dropdown="item"]');

    let timeout;

    const menuOpen = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.6,
        ease: "power4.out",
      },
    });

    menuOpen.to(menu, {
      autoAlpha: 1,
      y: "0rem",
    });

    menuOpen.fromTo(
      dropdownItems,
      {
        opacity: 0,
        y: "1rem",
      },
      {
        opacity: 1,
        y: "0rem",
        stagger: 0.1,
      },
      "<0.1"
    );

    let isOpen = false;

    const openMenu = () => {
      if (isOpen) return;
      clearTimeout(timeout);
      isOpen = true;
      menu.style.display = "block";
      arrow.classList.add("is-open");
      menuOpen.play();
    };

    const closeMenu = () => {
      isOpen = false;
      menuOpen.reverse();
      arrow.classList.remove("is-open");
      menu.style.display = "none";
    };

    if (isWide) {
      item.addEventListener("mouseenter", openMenu);
      menu.addEventListener("mouseenter", openMenu);

      item.addEventListener("mouseleave", () => {
        timeout = setTimeout(closeMenu, 50);
      });
    } else {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        menu.style.display === "block" ? closeMenu() : openMenu();
      });
    }
  });
}
function copyright() {
  const copyrightDate = document.querySelector(
    '[data-element="copyright-date"]'
  );

  if (copyrightDate) {
    const currentYear = new Date().getFullYear();
    copyrightDate.textContent = currentYear;
  }
}

function lazyVideos() {
  const wraps = document.querySelectorAll(".visual_media_video");
  if (!wraps.length) return;

  const loadObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const video = entry.target.querySelector("video");
          if (!video) return;

          video.querySelectorAll("source").forEach((source) => {
            source.src = source.dataset.src;
          });
          video.load();
          loadObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "400px" }
  );

  const playObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const video = entry.target.querySelector("video");
          if (!video || video.dataset.tabManaged) return;
          video.play();
          playObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px" }
  );

  wraps.forEach((container) => {
    loadObserver.observe(container);
    playObserver.observe(container);
  });
}

// MOBILE MENU

function mobileMenu() {
  const nav = document.querySelector('[data-menu="nav"]');
  const menu = nav.querySelector(".nav_content");
  const button = nav.querySelector(".nav_hamburger");
  const buttonInner = button.querySelector(".nav_hamburger_inner");
  const links = menu.querySelectorAll('[data-menu="item"]');

  const lineTop = buttonInner.children[0];
  const lineMiddle = buttonInner.children[1];
  const lineBottom = buttonInner.children[2];

  gsap.set(links, { y: "4rem", opacity: 0 });

  let isAnimating = false;
  let isMenuOpen = false;

  let menuOpen = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.7,
      ease: "power4.out",
    },
    onStart: () => {
      isAnimating = true;
      gsap.set(menu, { display: "flex" });
      nav.classList.add("is-open");
    },
    onComplete: () => {
      isAnimating = false;
    },
  });

  let menuClose = gsap.timeline({
    paused: true,
    defaults: {
      duration: 0.7,
      ease: "power4.out",
    },
    onStart: () => {
      isAnimating = true;
    },
    onComplete: () => {
      gsap.set(menu, { display: "none" });
      nav.classList.remove("is-open");
      isAnimating = false;
    },
  });

  menuOpen
    .to(
      lineTop,
      {
        y: 7.5,
        rotate: -45,
        duration: 0.4,
      },
      0
    )
    .to(
      lineMiddle,
      {
        x: 8,
        opacity: 0,
        duration: 0.4,
      },
      0
    )
    .to(
      lineBottom,
      {
        width: "100%",
        y: -7.5,
        rotate: 45,
        duration: 0.4,
      },
      0
    )
    .to(menu, { opacity: 1 }, 0)
    .to(links, { y: "0rem", opacity: 1, stagger: 0.06 }, 0.05);

  menuClose
    .to(links, { y: "0rem", opacity: 0 }, 0)
    .to(menu, { opacity: 0 }, 0)
    .to(
      lineTop,
      {
        y: 0,
        rotate: 0,
        duration: 0.4,
      },
      0
    )
    .to(
      lineMiddle,
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
      },
      0
    )
    .to(
      lineBottom,
      {
        width: "75%",
        y: 0,
        rotate: 0,
        duration: 0.4,
      },
      0
    );

  button.addEventListener("click", () => {
    if (isAnimating) return;

    if (!isMenuOpen) {
      menuOpen.restart();
      isMenuOpen = true;
    } else {
      menuClose.restart();
      isMenuOpen = false;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen && !isAnimating) {
      menuClose.restart();
      isMenuOpen = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  lenisScroll();
  navScroll();
  copyright();
  lazyVideos();

  gsap.matchMedia().add("(min-width: 992px)", () => {
    navDropdown();
  });

  gsap.matchMedia().add("(max-width: 991px)", () => {
    mobileMenu();
  });
});
