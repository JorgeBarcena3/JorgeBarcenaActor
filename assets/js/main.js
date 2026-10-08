'use strict';

// ============================================================
// Jorge Bárcena — Minimalist Portfolio
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ========================
  // COPYRIGHT YEAR
  // ========================
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ========================
  // NAV SCROLL BEHAVIOR
  // ========================
  const nav = document.getElementById('nav');

  const updateNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ========================
  // SMOOTH SCROLL
  // ========================
  const smoothScroll = (targetSelector) => {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  document.querySelectorAll('a[href^="#"], button[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      smoothScroll(href);
      closeMobileNav();
    });
  });

  // ========================
  // MOBILE NAV
  // ========================
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');
  const navOverlay = document.getElementById('nav-overlay');

  const openMobileNav = () => {
    navMobile.classList.add('open');
    navOverlay.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navMobile.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileNav = () => {
    navMobile.classList.remove('open');
    navOverlay.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navMobile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (navToggle) navToggle.addEventListener('click', openMobileNav);
  if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobile.classList.contains('open')) closeMobileNav();
  });

  // Mobile nav links close panel on click
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // ========================
  // SCROLL SPY
  // ========================
  const spySections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#nav-links a[href^="#"]');

  const runScrollSpy = () => {
    const scrollY = window.scrollY;
    const offset = nav.offsetHeight + 80;

    spySections.forEach(section => {
      const sectionTop = section.offsetTop - offset;
      const sectionBottom = sectionTop + section.offsetHeight;
      const id = `#${section.getAttribute('id')}`;

      navLinks.forEach(link => {
        if (link.getAttribute('href') === id) {
          link.classList.toggle('active', scrollY >= sectionTop && scrollY < sectionBottom);
        }
      });
    });
  };

  window.addEventListener('scroll', runScrollSpy, { passive: true });

  // ========================
  // FADE-UP ON SCROLL
  // ========================
  const fadeEls = document.querySelectorAll('.fade-up');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ========================
  // GALLERY — Horizontal Scroll
  // ========================
  const track = document.getElementById('gallery-track');
  const prevBtn = document.getElementById('gal-prev');
  const nextBtn = document.getElementById('gal-next');

  if (track && prevBtn && nextBtn) {
    const scrollAmt = () => track.clientWidth * 0.52;

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmt(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmt(), behavior: 'smooth' });
    });

    const updateGalleryBtns = () => {
      const tol = 8;
      const atStart = track.scrollLeft <= tol;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - tol;
      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
    };

    track.addEventListener('scroll', updateGalleryBtns, { passive: true });
    // Check after images load
    window.addEventListener('load', updateGalleryBtns);
    updateGalleryBtns();
  }

  // ========================
  // MODAL
  // ========================
  const modalOverlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  const openModal = (content) => {
    modalBody.innerHTML = content;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  };

  const closeModal = () => {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modalBody.innerHTML = ''; }, 300);
  };

  document.querySelectorAll('.open-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-modal');
      const dataEl = document.getElementById(id);
      if (dataEl) openModal(dataEl.innerHTML);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
  });

  // ========================
  // TOAST
  // ========================
  const toast = document.getElementById('toast-notification');
  let toastTimer;

  const showToast = (message, type = 'success') => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast ${type}`;
    void toast.offsetHeight; // force reflow for transition
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  };

  // ========================
  // CONTACT FORM
  // ========================
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('form-submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const privacyCheck = document.getElementById('privacy-policy');
      if (privacyCheck && !privacyCheck.checked) {
        showToast('Debes aceptar la Política de Privacidad para enviar el mensaje.', 'error');
        privacyCheck.focus();
        return;
      }

      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      const data = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim(),
        date: new Date().toISOString(),
      };

      try {
        const res = await fetch('/contacto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          showToast('Mensaje enviado correctamente ✓', 'success');
          form.reset();
        } else {
          showToast('Error al enviar el mensaje', 'error');
        }
      } catch {
        showToast('No se pudo conectar con el servidor', 'error');
      } finally {
        submitBtn.textContent = 'Enviar Mensaje';
        submitBtn.disabled = false;
      }
    });
  }

  // ========================
  // GESTIÓN DE COOKIES (RGPD / AEPD)
  // ========================
  const COOKIE_STORAGE_KEY = 'jb_cookie_consent';
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieModal = document.getElementById('cookie-modal');
  const btnCookieAccept = document.getElementById('btn-cookie-accept');
  const btnCookieReject = document.getElementById('btn-cookie-reject');
  const btnCookieSettings = document.getElementById('btn-cookie-settings');
  const btnCookieModalClose = document.getElementById('btn-cookie-modal-close');
  const btnCookieSavePref = document.getElementById('btn-cookie-save-pref');
  const btnCookieSaveReject = document.getElementById('btn-cookie-save-reject');
  const cookiePrefMedia = document.getElementById('cookie-pref-media');
  const footerCookieSettings = document.getElementById('footer-cookie-settings');
  const btnReopenCookies = document.getElementById('btn-reopen-cookies');

  const getCookieConsent = () => {
    try {
      const data = localStorage.getItem(COOKIE_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const setCookieConsent = (pref) => {
    try {
      const value = {
        necessary: true,
        media: Boolean(pref.media),
        timestamp: new Date().toISOString(),
        version: 1,
      };
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(value));
      return value;
    } catch {
      return null;
    }
  };

  const openCookieModal = () => {
    if (!cookieModal) return;
    const consent = getCookieConsent();
    if (cookiePrefMedia) {
      cookiePrefMedia.checked = consent ? Boolean(consent.media) : false;
    }
    cookieModal.style.display = 'flex';
    void cookieModal.offsetHeight;
    cookieModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeCookieModal = () => {
    if (!cookieModal) return;
    cookieModal.classList.add('hidden');
    setTimeout(() => {
      if (cookieModal.classList.contains('hidden')) {
        cookieModal.style.display = 'none';
      }
    }, 300);
    document.body.style.overflow = '';
  };

  const hideCookieBanner = () => {
    if (cookieBanner) {
      cookieBanner.classList.add('hidden');
      setTimeout(() => {
        if (cookieBanner.classList.contains('hidden')) {
          cookieBanner.style.display = 'none';
        }
      }, 350);
    }
  };

  // Comprobar consentimiento previo al cargar la página
  const currentConsent = getCookieConsent();
  if (!currentConsent && cookieBanner) {
    // Retardo sutil para mostrar el banner suavemente
    setTimeout(() => {
      cookieBanner.style.display = 'block';
      void cookieBanner.offsetHeight;
      cookieBanner.classList.remove('hidden');
    }, 500);
  }

  // Aceptar todas
  if (btnCookieAccept) {
    btnCookieAccept.addEventListener('click', () => {
      setCookieConsent({ media: true });
      hideCookieBanner();
      closeCookieModal();
      showToast('Cookies aceptadas ✓', 'success');
    });
  }

  // Solo necesarias / Rechazar opcionales
  if (btnCookieReject) {
    btnCookieReject.addEventListener('click', () => {
      setCookieConsent({ media: false });
      hideCookieBanner();
      closeCookieModal();
      showToast('Solo cookies técnicas necesarias activadas', 'success');
    });
  }

  // Abrir configuración desde banner
  if (btnCookieSettings) {
    btnCookieSettings.addEventListener('click', () => {
      openCookieModal();
    });
  }

  // Abrir configuración desde enlace de pie de página
  if (footerCookieSettings) {
    footerCookieSettings.addEventListener('click', (e) => {
      e.preventDefault();
      openCookieModal();
    });
  }

  // Abrir configuración desde botón en política de cookies
  if (btnReopenCookies) {
    btnReopenCookies.addEventListener('click', (e) => {
      e.preventDefault();
      openCookieModal();
    });
  }

  // Cerrar modal
  if (btnCookieModalClose) {
    btnCookieModalClose.addEventListener('click', closeCookieModal);
  }

  if (cookieModal) {
    cookieModal.addEventListener('click', (e) => {
      if (e.target === cookieModal) closeCookieModal();
    });
  }

  // Guardar preferencias personalizadas en modal
  if (btnCookieSavePref) {
    btnCookieSavePref.addEventListener('click', () => {
      const mediaAllowed = cookiePrefMedia ? cookiePrefMedia.checked : false;
      setCookieConsent({ media: mediaAllowed });
      closeCookieModal();
      hideCookieBanner();
      showToast('Preferencias de cookies guardadas ✓', 'success');
    });
  }

  // Rechazar opcionales desde modal
  if (btnCookieSaveReject) {
    btnCookieSaveReject.addEventListener('click', () => {
      setCookieConsent({ media: false });
      if (cookiePrefMedia) cookiePrefMedia.checked = false;
      closeCookieModal();
      hideCookieBanner();
      showToast('Cookies opcionales desactivadas', 'success');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cookieModal && !cookieModal.classList.contains('hidden')) {
      closeCookieModal();
    }
  });

  // ========================
  // LOAD TRABAJOS JSON
  // ========================
  const trabajosGrid = document.getElementById('trabajos-grid');
  if (trabajosGrid) {
    fetch('assets/data/trabajos.json')
      .then(res => res.json())
      .then(data => {
        let html = '';
        data.forEach(work => {
          let modalHtml = '';
          let modalBtnHtml = '';

          if (work.hasModal) {
            modalBtnHtml = `
              <button class="card-btn open-modal-btn" data-modal="modal-${work.id}">
                Leer más
              </button>
            `;
            let imagesHtml = '';
            if (work.modalImages && work.modalImages.length > 0) {
              imagesHtml = '<div class="modal-img-grid">';
              work.modalImages.forEach(img => {
                imagesHtml += `<img src="${img}" alt="" />`;
              });
              imagesHtml += '</div>';
            }
            modalHtml = `
              <div id="modal-${work.id}" hidden>
                <h3 class="modal-title">${work.title}</h3>
                ${imagesHtml}
                <p class="modal-text">${work.modalText}</p>
              </div>
            `;
          }

          html += `
            <article class="work-card fade-up">
              <div class="card-img">
                <img src="${work.imgSrc}" alt="${work.imgAlt}" loading="lazy" />
              </div>
              <div class="card-body">
                <div class="card-status ${work.statusClass}">
                  <span class="dot"></span>
                  <span>${work.status}</span>
                </div>
                <h3 class="card-title">${work.title}</h3>
                <p class="card-desc">${work.desc}</p>
                ${modalBtnHtml}
              </div>
              ${modalHtml}
            </article>
          `;
        });
        
        trabajosGrid.innerHTML = html;

        // Re-bind modal events for newly created buttons
        document.querySelectorAll('.open-modal-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-modal');
            const dataEl = document.getElementById(id);
            if (dataEl) openModal(dataEl.innerHTML);
          });
        });

        // Re-bind intersection observer for new fade-up elements
        if ('IntersectionObserver' in window) {
          const newFadeEls = trabajosGrid.querySelectorAll('.fade-up');
          const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
              }
            });
          }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
          newFadeEls.forEach(el => io.observe(el));
        } else {
          trabajosGrid.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
        }
      })
      .catch(err => console.error('Error loading trabajos.json:', err));
  }

});
