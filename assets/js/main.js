/*
    Massively by HTML5 UP
    html5up.net | @ajlkn
    Free for personal and commercial use under the CCA 3.0 license
*/

// TIEMPO DE SCROLL AUTOMÁTICO (Global)
var scrollTimeMS = 10000; // 5 segundos (Ajusta a tu gusto)

(function ($) {
    var $window = $(window),
        $body = $("body"),
        $wrapper = $("#wrapper"),
        $header = $("#header"),
        $nav = $("#nav"),
        $navSticky = $("#nav_sticky"),
        $main = $("#main"),
        $navPanelToggle,
        $navPanel,
        $navPanelInner;

    // Breakpoints.
    breakpoints({
        default: ["1681px", null],
        xlarge: ["1281px", "1680px"],
        large: ["981px", "1280px"],
        medium: ["737px", "980px"],
        small: ["481px", "880px"],
        xsmall: ["361px", "480px"],
        xxsmall: [null, "360px"],
    });

    // Parallax
    $.fn._parallax = function (intensity) {
        var $window = $(window),
            $this = $(this);

        if (this.length == 0 || intensity === 0) return $this;
        if (!intensity) intensity = 0.25;

        $this.each(function () {
            var $t = $(this),
                $bg = $('<div class="bg"></div>').appendTo($t);

            function on() {
                $bg.removeClass("fixed").css("transform", "matrix(1,0,0,1,0,0)");
                $window.on("scroll._parallax", function () {
                    var pos = $window.scrollTop() - $t.position().top;
                    $bg.css("transform", "matrix(1,0,0,1,0," + pos * intensity + ")");
                });
            }

            function off() {
                $bg.addClass("fixed").css("transform", "none");
                $window.off("scroll._parallax");
            }

            if (
                browser.name == "ie" ||
                browser.name == "edge" ||
                window.devicePixelRatio > 1 ||
                browser.mobile
            )
                off();
            else {
                breakpoints.on(">large", on);
                breakpoints.on("<=large", off);
            }
        });

        return $(this);
    };

    // Page load
    $window.on("load", function () {
        setTimeout(function () {
            $body.removeClass("is-preload");
        }, 100);
    });

    $(".scrolly").scrolly();
    $wrapper._parallax(0.925);

    // Nav panel
    $navPanelToggle = $('<a href="#navPanel" id="navPanelToggle"></a>').appendTo(
        $wrapper
    );

    $header.scrollex({
        mode: "top",
        top: 0,
        enter: function () {
            $navPanelToggle.removeClass("alt");
        },
        leave: function () {
            $navPanelToggle.addClass("alt");
        },
    });

    $navPanel = $(
        '<div id="navPanel"><nav></nav><a href="#navPanel" class="close"></a></div>'
    )
        .appendTo($body)
        .panel({
            delay: 500,
            hideOnClick: true,
            hideOnSwipe: true,
            resetScroll: true,
            resetForms: true,
            side: "right",
            target: $body,
            visibleClass: "is-navPanel-visible",
        });

    $navPanelInner = $navPanel.children("nav");

    var $navContent = $nav.children();

    breakpoints.on(">small", function () {
        $navContent.appendTo($nav);
        $nav.find(".icons, .icon").removeClass("alt");
    });

    let navOnPhone = false;

    breakpoints.on("<=small", function () {
        $navContent.appendTo($navPanelInner);
        $navPanelInner.find(".icons, .icon").addClass("alt");
        $nav.hide();
        $navSticky.hide();
        navOnPhone = true;
    });

    if (browser.os == "wp" && browser.osVersion < 10)
        $navPanel.css("transition", "none");

    // Intro scroll logic
    var $intro = $("#intro");
    let headerFixed = false;


    // ==========================================
    // UTILS: TOAST NOTIFICATION FUNCTION
    // ==========================================
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast-notification');
        
        // Si no existe el HTML del toast, no hacemos nada
        if(!toast) {
            alert(message); // Fallback a alert normal
            return;
        }

        const msgContainer = toast.querySelector('.toast-message');
        
        // 1. Configurar mensaje y tipo
        msgContainer.textContent = message;
        
        // Resetear clases
        toast.className = 'toast'; 
        toast.classList.add(type); // 'success' o 'error'
        
        // 2. Mostrar
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3. Ocultar automáticamente
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }


    // ========================
    // 1. CLICK NAVIGATION
    // ========================
    function scrollToTarget(e) {
        e.preventDefault();
        var targetId = $(this).attr("href");
        var $target = $(targetId);

        if ($target.length === 0) return;

        // Buscamos la etiqueta <nav> más cercana hacia arriba
        var parentId = $(this).closest("nav").attr("id");
        var navHeightToUse = 0;

        // Determinar altura del nav
        if (navOnPhone) {
            navHeightToUse = $header.outerHeight(); // En móvil solemos querer ir directo
        } else if (parentId == "nav") {
            navHeightToUse = $header.outerHeight() * 1.5;
        } else {
            // Usamos la altura del sticky si existe
            navHeightToUse = $header.outerHeight();
        }

        var offsetTop = $target.offset().top - navHeightToUse;
        var buffer = 0;

        $("html, body")
            .stop()
            .animate({ scrollTop: offsetTop - buffer }, 600, "linear");

        // Feedback visual inmediato
        updateActiveLink(targetId);
        $navPanel.removeClass("is-navPanel-visible");
    }

    // Función auxiliar para actualizar TODOS los menús a la vez
    function updateActiveLink(targetId) {
        $("#nav, #nav_sticky, #navPanel").find("li").removeClass("active");
        var selector = 'a[href="' + targetId + '"]';
        $("#nav, #nav_sticky, #navPanel")
            .find(selector)
            .parent("li")
            .addClass("active");
    }

    $(
        "#nav a[href^='#'], #nav_sticky a[href^='#'], #navPanel a[href^='#'], .scrolly"
    ).on("click", scrollToTarget);


    // ========================
    // 2. SCROLL SPY & STICKY
    // ========================
    if ($intro.length && $header.length) {
        $window.on("scroll", function () {
            let currentScroll = $window.scrollTop();
            let introHeight = $intro.outerHeight() / 1.5;

            // Offset dinámico para el Spy
            let spyOffset = ($navSticky.outerHeight() || 60) + 150;

            // --- Logic Sticky Header ---
            if (currentScroll > introHeight && !headerFixed) {
                $header.addClass("fixed");
                $intro.addClass("hidden");
                if (!navOnPhone) {
                    $nav.hide();
                    $navSticky.fadeIn(200);
                }
                headerFixed = true;
            } else if (currentScroll <= introHeight && headerFixed) {
                $header.removeClass("fixed");
                $intro.removeClass("hidden");
                if (!navOnPhone) {
                    $navSticky.hide();
                    $nav.fadeIn(200);
                }
                headerFixed = false;
            }

            // --- Logic ScrollSpy ---
            $("#nav ul.links li a[href^='#']").each(function () {
                var $link = $(this);
                var targetId = $link.attr("href");
                var $targetSection = $(targetId);

                if ($targetSection.length) {
                    var sectionTop = $targetSection.offset().top;
                    var sectionBottom = sectionTop + $targetSection.outerHeight();

                    if (
                        currentScroll >= sectionTop - spyOffset &&
                        currentScroll < sectionBottom - spyOffset
                    ) {
                        if (!$link.parent().hasClass("active")) {
                            updateActiveLink(targetId);
                        }
                    }
                }
            });
        });
    }


// ========================
    // 3. AUTO SCROLL GALERÍAS (MULTIPLE - Para Tarjetas)
    // ========================
    var $galleries = $(".gallery");

    if ($galleries.length) {
        function initAutoScroll(element) {
            // --- CORRECCIÓN IMPORTANTE ---
            // Si esta galería es la "Grande" (la del ID big-gallery-container),
            // NO activamos este scroll genérico, porque ya tiene el suyo propio en el paso 5.
            if (element.id === 'big-gallery-container') return; 
            // -----------------------------

            let interval;
            const galleryEl = element;

            const startScroll = () => {
                clearInterval(interval);
                interval = setInterval(() => {
                    // Solo en móvil (< 880px)
                    if (window.innerWidth < 880) {
                        const itemWidth = galleryEl.clientWidth;
                        const maxScroll = galleryEl.scrollWidth - galleryEl.clientWidth;

                        if (galleryEl.scrollLeft >= maxScroll - 10) {
                            galleryEl.scrollTo({ left: 0, behavior: "smooth" });
                        } else {
                            galleryEl.scrollBy({ left: itemWidth, behavior: "smooth" });
                        }
                    }
                }, scrollTimeMS);
            };

            const stopScroll = () => {
                clearInterval(interval);
            };

            // Iniciar
            startScroll();

            // Detener si el usuario interactúa
            //  galleryEl.addEventListener("touchstart", stopScroll, { passive: true });
            //  galleryEl.addEventListener("mousedown", stopScroll);
        }

        $galleries.each(function () {
            initAutoScroll(this);
        });
    }

    // ========================
    // 4. LÓGICA DEL POPUP (MODAL)
    // ========================
    var $modal = $("#modal-overlay");
    var $modalBody = $("#modal-body");
    var $closeBtn = $(".close-modal");

    // Al hacer click en "Más info"
    $(".open-popup").on("click", function (e) {
        e.preventDefault();

        // Buscamos el contenido oculto
        var content = $(this).parent().find(".popup-data").html();

        // Metemos ese contenido en el popup
        $modalBody.html(content);

        // Mostramos el popup
        $modal.css("display", "flex").hide().fadeIn(200);
        $("body").css("overflow", "hidden");
    });

    // Función para cerrar
    function closeModal() {
        $modal.fadeOut(200, function () {
            $("body").css("overflow", "auto");
            $modalBody.empty();
        });
    }

    $closeBtn.on("click", closeModal);

    $modal.on("click", function (e) {
        if ($(e.target).is("#modal-overlay")) {
            closeModal();
        }
    });

    $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $modal.is(":visible")) {
            closeModal();
        }
    });

// ========================
    // 5. CARGADOR DE GALERÍA DINÁMICA (CON LEYENDAS Y FLECHAS)
    // ========================
    const galleryContainer = document.getElementById("big-gallery-container");
    const prevBtn = document.getElementById("gal-prev");
    const nextBtn = document.getElementById("gal-next");

    if (galleryContainer) {
        const folderPath = "images/Luz/optimized/";

        // --- CONFIGURACIÓN DE FOTOS ---
        const photoList = [
            { file: "_DSC6184.jpg", title: "Festival de Teatro 2024" },
            { file: "_DSC6517.jpg", title: "Taller de Impro" },
            { file: "_DSC6503.jpg", title: "Evento Corporativo" },
            { file: "_DSC6378.jpg", title: "Rodaje Cortometraje" },
            { file: "_DSC7763.jpg", title: "Sesión de Estudio" },
        ];
        // ----------------------------------

        // 1. Generar HTML con estilo Premium
        let htmlContent = "";
        photoList.forEach((item) => {
            htmlContent += `
                <a href="${folderPath}${item.file}" target="_blank">
                    <img src="${folderPath}${item.file}" alt="${item.title}" loading="lazy" />
                    <div class="gallery-caption">${item.title}</div>
                </a>
            `;
        });
        galleryContainer.innerHTML = htmlContent;

        // ==========================================
        // LÓGICA DE FLECHAS Y SCROLL
        // ==========================================
        let autoScrollInterval;

        const stopAutoScroll = () => {
            if (autoScrollInterval) clearInterval(autoScrollInterval);
        };

        // A. Visibilidad de flechas
        const checkArrowsVisibility = () => {
            const tolerance = 10; // Un poco más de margen
            const scrollLeft = galleryContainer.scrollLeft;
            const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;

            if (scrollLeft <= tolerance) {
                prevBtn.classList.add("hidden");
            } else {
                prevBtn.classList.remove("hidden");
            }

            if (scrollLeft >= maxScroll - tolerance) {
                nextBtn.classList.add("hidden");
            } else {
                nextBtn.classList.remove("hidden");
            }
        };

        // B. Clic en flechas
        const scrollAmount = () => galleryContainer.clientWidth / 2;

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                stopAutoScroll();
                galleryContainer.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                stopAutoScroll();
                galleryContainer.scrollBy({ left: scrollAmount(), behavior: "smooth" });
            });
        }

        // C. Escuchar scroll
        let isScrolling;
        galleryContainer.addEventListener("scroll", () => {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                checkArrowsVisibility();
            }, 50);
        }, { passive: true });

        // D. Inicialización
        setTimeout(() => {
            checkArrowsVisibility();

            // Auto-Scroll (Solo móvil)
            if (window.innerWidth < 880) {
                const runAutoScroll = () => {
                    // Verificamos que existan hijos antes de calcular
                    if (galleryContainer.children.length === 0) return;

                    const item = galleryContainer.children[0];
                    const w = item.offsetWidth; // Ancho de una foto
                    
                    // Cálculo del máximo scroll posible
                    const max = galleryContainer.scrollWidth - galleryContainer.clientWidth;
                    
                    // --- CORRECCIÓN AQUÍ ---
                    // Usamos una tolerancia mayor (la mitad de una foto)
                    // Si ya estamos mostrando la última foto (o cerca del final), volvemos a 0
                    if (Math.ceil(galleryContainer.scrollLeft) >= max - (w / 2)) {
                        galleryContainer.scrollTo({ left: 0, behavior: "smooth" });
                    } else {
                        // Si no, avanzamos una foto
                        galleryContainer.scrollBy({ left: w, behavior: "smooth" });
                    }
                };
                autoScrollInterval = setInterval(runAutoScroll, scrollTimeMS);
            }

            // Listeners para parar
            // galleryContainer.addEventListener("touchstart", stopAutoScroll, { passive: true });
            // galleryContainer.addEventListener("mousedown", stopAutoScroll);
        }, 300);
    }


    // ========================
    // 6. FORMULARIO DE CONTACTO (CON TOAST)
    // ========================
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const data = {
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                message: document.getElementById("message").value.trim(),
                date: new Date().toISOString(),
            };

            try {
                // NOTA: Asegúrate de que tu Nginx apunta /contacto a tu backend Node
                const response = await fetch("/contacto", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    showToast("Mensaje enviado correctamente", "success");
                    contactForm.reset();
                } else {
                    showToast("Error al enviar el mensaje", "error");
                }
            } catch (err) {
                showToast("No se pudo conectar con el servidor", "error");
                console.error(err);
            }
        });
    }

})(jQuery);