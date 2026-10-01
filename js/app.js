(function initSpeedsFromConfig() {
                        function getSpeedsList() {
                            var raw = (window.siteConfig && window.siteConfig.speedOptions) || (window.hotspotConfig || {})["speeds"] || [];
                            return raw.map(function (s) {
                                return {
                                    name: s.label || s.name || '',
                                    value: s.value !== undefined ? s.value : '',
                                    isDefault: s.selected || s.isDefault || false,
                                    visible: s.visible !== undefined ? s.visible : true,
                                    badge: s.badge || ''
                                };
                            }).filter(function (s) { return s.visible && s.name; });
                        }

                        function run() {
                            var speeds = getSpeedsList();
                            if (!speeds.length) return;

                            // خريطة أسماء السرعات لضمان ظهور الاسم فقط في كل مكان
                            window.speedNameMap = window.speedNameMap || {};
                            speeds.forEach(function (sp) {
                                window.speedNameMap[sp.value] = sp.name;
                            });

                            // --- 1. أزرار السرعة الصغيرة في صفحة الدخول (#speedPillsRow) ---
                            var pillsRow   = document.getElementById("speedPillsRow");
                            var speedSel   = document.getElementById("speed");          // select الميكروتيك
                            var speedDisp  = document.getElementById("selectedSpeedDisplay");

                            if (pillsRow && speedSel) {
                                pillsRow.innerHTML = "";
                                speedSel.innerHTML = '<option value="" disabled hidden selected>أختيار سرعة الإنترنت</option>';

                                var defaultPill = null;
                                var defaultSp = speeds.find(function(s) { return s.isDefault; }) || speeds[0];

                                speeds.forEach(function (sp) {
                                    // زر الـ pill - يظهر الاسم فقط
                                    var btn = document.createElement("button");
                                    btn.type = "button";
                                    btn.className = "speed-pill-btn";
                                    btn.setAttribute("data-speed", sp.value);
                                    btn.setAttribute("data-speed-title", sp.name);
                                    btn.setAttribute("aria-label", sp.name);

                                    btn.innerHTML =
                                        '<span class="pill-dot"></span>' +
                                        '<span class="pill-text">' + sp.name + '</span>';

                                    if (sp === defaultSp || sp.isDefault) {
                                        btn.classList.add("active");
                                        defaultPill = btn;
                                    }

                                    pillsRow.appendChild(btn);

                                    // خيار في select الميكروتيك
                                    var opt = document.createElement("option");
                                    opt.value = sp.value;
                                    opt.textContent = sp.name;
                                    if (sp === defaultSp || sp.isDefault) opt.selected = true;
                                    speedSel.appendChild(opt);
                                });

                                if (defaultSp) {
                                    speedSel.value = defaultSp.value;
                                    if (speedDisp) speedDisp.textContent = defaultSp.name;
                                }

                                // Scroll to active pill automatically so the selected speed is visible and centered (without scrolling the window)
                                function scrollToActivePill() {
                                    var activePill = pillsRow.querySelector(".speed-pill-btn.active");
                                    if (activePill && pillsRow) {
                                        var scrollTarget = activePill.offsetLeft - (pillsRow.clientWidth / 2) + (activePill.clientWidth / 2);
                                        pillsRow.scrollTo({ left: scrollTarget, behavior: 'smooth' });
                                    }
                                }
                                setTimeout(scrollToActivePill, 100);
                                setTimeout(scrollToActivePill, 400);

                                // أحداث أزرار الـ pill
                                var allPills = pillsRow.querySelectorAll(".speed-pill-btn");
                                allPills.forEach(function (pill) {
                                    pill.addEventListener("click", function () {
                                        allPills.forEach(function (p) { p.classList.remove("active"); });
                                        pill.classList.add("active");
                                        var val = pill.getAttribute("data-speed");
                                        var title = pill.getAttribute("data-speed-title");
                                        if (speedSel) {
                                            speedSel.value = val;
                                            speedSel.dispatchEvent(new Event("change", { bubbles: true }));
                                        }
                                        if (speedDisp) speedDisp.textContent = title;
                                        try {
                                            localStorage.setItem("hotspot_speed", val);
                                            localStorage.setItem("hotspot_speed_name", title);
                                            document.cookie = "hotspot_speed=" + encodeURIComponent(val) + "; path=/; max-age=2592000";
                                            document.cookie = "speed=" + encodeURIComponent(val) + "; path=/; max-age=2592000";
                                        } catch (e) {}
                                        if (typeof window.syncStatusScreenInitialValues === "function") {
                                            window.syncStatusScreenInitialValues();
                                        }
                                        scrollToActivePill();
                                        // sync modal list too
                                        var modalCards = document.querySelectorAll("#speedModalList .speed-card-option");
                                        modalCards.forEach(function (c) {
                                            c.classList.toggle("active", c.getAttribute("data-speed") === val);
                                        });
                                    });
                                });
                            }

                            // --- 2. موداله صفحة الدخول (#speedModalList) ---
                            var loginModal = document.getElementById("speedModalList");
                            if (loginModal) {
                                loginModal.innerHTML = "";
                                var defaultSp = speeds.find(function(s) { return s.isDefault; }) || speeds[0];
                                speeds.forEach(function (sp) {
                                    var isDef = (sp === defaultSp || sp.isDefault);
                                    var div = document.createElement("div");
                                    div.className = "speed-card-option" + (isDef ? " active" : "");
                                    div.setAttribute("data-speed", sp.value);
                                    div.setAttribute("data-speed-title", sp.name);
                                    div.innerHTML =
                                        '<div class="speed-card-indicator"><div class="speed-radio-dot"></div></div>' +
                                        '<div class="speed-card-info"><span class="speed-card-name">' + sp.name + '</span></div>';
                                    loginModal.appendChild(div);
                                });

                                // أحداث موداله الدخول
                                var modalCards = loginModal.querySelectorAll(".speed-card-option");
                                modalCards.forEach(function (card) {
                                    card.addEventListener("click", function () {
                                        modalCards.forEach(function (c) { c.classList.remove("active"); });
                                        card.classList.add("active");
                                        var val = card.getAttribute("data-speed");
                                        var title = card.getAttribute("data-speed-title");
                                        if (speedSel) {
                                            speedSel.value = val;
                                            speedSel.dispatchEvent(new Event("change", { bubbles: true }));
                                        }
                                        if (speedDisp) speedDisp.textContent = title;
                                        try {
                                            localStorage.setItem("hotspot_speed", val);
                                            localStorage.setItem("hotspot_speed_name", title);
                                            document.cookie = "hotspot_speed=" + encodeURIComponent(val) + "; path=/; max-age=2592000";
                                            document.cookie = "speed=" + encodeURIComponent(val) + "; path=/; max-age=2592000";
                                        } catch (e) {}
                                        if (typeof window.syncStatusScreenInitialValues === "function") {
                                            window.syncStatusScreenInitialValues();
                                        }
                                        // sync pills too
                                        var pills = document.querySelectorAll("#speedPillsRow .speed-pill-btn");
                                        pills.forEach(function (p) {
                                            var isActive = p.getAttribute("data-speed") === val;
                                            p.classList.toggle("active", isActive);
                                            if (isActive && pillsRow) {
                                                var scrollTarget = p.offsetLeft - (pillsRow.clientWidth / 2) + (p.clientWidth / 2);
                                                pillsRow.scrollTo({ left: scrollTarget, behavior: 'smooth' });
                                            }
                                        });
                                        setTimeout(function () {
                                            if (typeof closeAppModal === "function") closeAppModal("speed-modal");
                                        }, 180);
                                    });
                                });
                            }

                            // --- 3. موداله صفحة الحالة (#statusSpeedModalList) ---
                            var statusModal = document.getElementById("statusSpeedModalList");
                            var speedchange = document.getElementById("speedchange");
                            var triggerText = document.getElementById("statusSpeedTriggerText");
                            if (statusModal) {
                                statusModal.innerHTML = "";
                                var defaultSp = speeds.find(function(s) { return s.isDefault; }) || speeds[0];
                                speeds.forEach(function (sp) {
                                    var isDef = (sp === defaultSp || sp.isDefault);
                                    var div = document.createElement("div");
                                    div.className = "speed-card-option" + (isDef ? " active" : "");
                                    div.setAttribute("data-status-speed", sp.value);
                                    div.setAttribute("data-speed-title", sp.name);
                                    div.innerHTML =
                                        '<div class="speed-card-indicator"><div class="speed-radio-dot"></div></div>' +
                                        '<div class="speed-card-info"><span class="speed-card-name">' + sp.name + '</span></div>';
                                    statusModal.appendChild(div);
                                });

                                if (triggerText && defaultSp) {
                                    triggerText.textContent = defaultSp.name;
                                }

                                if (speedchange) {
                                    speedchange.innerHTML = '<option value="ns" disabled hidden selected>أضغط هنا لتغيير سرعة الإنترنت</option>';
                                    speeds.forEach(function (sp) {
                                        var opt = document.createElement("option");
                                        opt.value = sp.value;
                                        opt.textContent = sp.name;
                                        speedchange.appendChild(opt);
                                    });
                                }

                                var statusCards = statusModal.querySelectorAll(".speed-card-option");
                                statusCards.forEach(function (card) {
                                    card.addEventListener("click", function (e) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        statusCards.forEach(function (c) { c.classList.remove("active"); });
                                        card.classList.add("active");
                                        var val = card.getAttribute("data-status-speed");
                                        var title = card.getAttribute("data-speed-title");
                                        if (triggerText) triggerText.textContent = title;
                                        if (speedchange) {
                                            speedchange.value = val;
                                            speedchange.dispatchEvent(new Event("change", { bubbles: true }));
                                        }
                                        setTimeout(function () {
                                            if (typeof closeAppModal === "function") closeAppModal("status-speed-modal");
                                        }, 180);
                                    });
                                });
                            }
                        }

                        // تشغيل بعد تحميل config.js
                        if (document.readyState === "loading") {
                            document.addEventListener("DOMContentLoaded", run);
                        } else {
                            run();
                        }
                        window.addEventListener("load", function () { setTimeout(run, 150); });
                    })();
;
document.addEventListener('DOMContentLoaded', function () {

            // 1. CAROUSEL SEAMLESS INFINITE LOOP, AUTOPLAY & RELIABLE ASYNC AUTO-DISCOVERY
            const track = document.getElementById('carouselTrack');
            const dotsContainer = document.getElementById('carouselDots');
            const prevBtn = document.getElementById('carouselPrev');
            const nextBtn = document.getElementById('carouselNext');
            const carouselContainer = document.getElementById('adCarousel');
            const carouselWrapper = document.querySelector('.ads-carousel-wrapper');

            if (track && carouselContainer) {
                const cfg = window.siteConfig || {};
                if (cfg.imageV === false) {
                    if (carouselWrapper) carouselWrapper.style.display = 'none';
                } else {
                    if (carouselWrapper) carouselWrapper.style.display = '';

                    let activeCarouselState = null;

                    function probeImage(src, timeoutMs) {
                        timeoutMs = timeoutMs || 3500;
                        return new Promise(resolve => {
                            const tempImg = new Image();
                            let done = false;
                            const finish = (val) => {
                                if (done) return;
                                done = true;
                                tempImg.onload = null;
                                tempImg.onerror = null;
                                resolve(val);
                            };
                            tempImg.onload = () => {
                                if (tempImg.naturalWidth > 0 && tempImg.naturalHeight > 0) {
                                    finish(src);
                                } else {
                                    finish(null);
                                }
                            };
                            tempImg.onerror = () => finish(null);
                            tempImg.src = src;

                            // If already complete in cache:
                            if (tempImg.complete) {
                                if (tempImg.naturalWidth > 0) {
                                    finish(src);
                                    return;
                                }
                            }
                            setTimeout(() => finish(null), timeoutMs);
                        });
                    }

                    async function discoverAdImages() {
                        const maxCount = Math.max(10, parseInt(cfg.imageCount, 10) || 10);
                        const checkPromises = [];

                        for (let i = 1; i <= maxCount; i++) {
                            checkPromises.push(
                                probeImage(`./adimg/${i}.jpg`).then(async res => {
                                    if (res) return res;
                                    return probeImage(`./adimg/${i}.png`, 2000);
                                })
                            );
                        }

                        try {
                            const results = await Promise.all(checkPromises);
                            const valid = results.filter(Boolean);
                            if (valid.length > 0) return valid;
                        } catch (e) {}

                        // Fallback: keep existing slides or default to 3.jpg & 4.jpg
                        return ['./adimg/3.jpg', './adimg/4.jpg'];
                    }

                    function buildAndStartCarousel(images) {
                        const currentCfg = window.siteConfig || {};
                        if (currentCfg.imageV === false) {
                            if (carouselWrapper) carouselWrapper.style.display = 'none';
                            return;
                        }

                        // Robust fallback: NEVER hide carousel if images array is empty or fails!
                        if (!images || images.length === 0) {
                            const existingImgs = Array.from(track.querySelectorAll('img')).map(img => img.getAttribute('src')).filter(Boolean);
                            images = existingImgs.length > 0 ? existingImgs : ['./adimg/3.jpg', './adimg/4.jpg'];
                        }

                        if (carouselWrapper) carouselWrapper.style.display = '';

                        // If previous carousel is running, clean it up cleanly
                        if (activeCarouselState && typeof activeCarouselState.destroy === 'function') {
                            activeCarouselState.destroy();
                        }

                        // Clear and build slides
                        track.innerHTML = '';
                        images.forEach((src, idx) => {
                            const slide = document.createElement('div');
                            slide.className = 'carousel-slide';
                            const img = document.createElement('img');
                            img.className = 'im' + (idx + 1);
                            img.src = src;
                            img.alt = 'إعلان ' + (idx + 1);
                            img.decoding = 'async';
                            img.loading = 'eager'; // Always load eager so carousel slides are never blank
                            if (idx === 0) {
                                img.setAttribute('fetchpriority', 'high');
                            }
                            img.onerror = function() {
                                // If image fails to load, gracefully fall back to default
                                if (this.src.indexOf('adimg/3.jpg') === -1 && this.src.indexOf('adimg/4.jpg') === -1) {
                                    this.src = './adimg/3.jpg';
                                }
                            };
                            slide.appendChild(img);
                            track.appendChild(slide);
                        });

                        // Build dots
                        if (dotsContainer) {
                            dotsContainer.innerHTML = '';
                            if (images.length > 1) {
                                dotsContainer.style.display = 'flex';
                                images.forEach((_, idx) => {
                                    const d = document.createElement('span');
                                    d.className = idx === 0 ? 'carousel-dot active' : 'carousel-dot';
                                    dotsContainer.appendChild(d);
                                });
                            } else {
                                dotsContainer.style.display = 'none';
                            }
                        }

                        const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
                        const totalSlides = originalSlides.length;

                        if (totalSlides <= 1) {
                            track.style.transition = 'none';
                            track.style.transform = 'translateX(0%)';
                            if (prevBtn) prevBtn.style.display = 'none';
                            if (nextBtn) nextBtn.style.display = 'none';
                            activeCarouselState = {
                                images: images.slice(),
                                destroy: function() {}
                            };
                            return;
                        }

                        if (prevBtn) prevBtn.style.display = '';
                        if (nextBtn) nextBtn.style.display = '';

                        const dots = Array.from(dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : []);
                        let currentIndex = 1;
                        let isTransitioning = false;
                        let autoplayInterval = null;
                        let transitionSafetyTimeout = null;

                        // Clones for infinite circular wrap
                        const firstClone = originalSlides[0].cloneNode(true);
                        const lastClone = originalSlides[totalSlides - 1].cloneNode(true);
                        firstClone.classList.add('carousel-clone');
                        lastClone.classList.add('carousel-clone');

                        track.insertBefore(lastClone, track.firstElementChild);
                        track.appendChild(firstClone);

                        track.style.transition = 'none';
                        track.style.transform = `translateX(-${currentIndex * 100}%)`;
                        track.offsetHeight;
                        track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

                        function updateDots() {
                            const realIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                            dots.forEach((dot, idx) => {
                                dot.classList.toggle('active', idx === realIndex);
                            });
                        }

                        function checkCloneReset() {
                            if (currentIndex === totalSlides + 1) {
                                track.style.transition = 'none';
                                currentIndex = 1;
                                track.style.transform = `translateX(-${currentIndex * 100}%)`;
                                track.offsetHeight;
                            } else if (currentIndex === 0) {
                                track.style.transition = 'none';
                                currentIndex = totalSlides;
                                track.style.transform = `translateX(-${currentIndex * 100}%)`;
                                track.offsetHeight;
                            }
                            isTransitioning = false;
                        }

                        function onTransitionEnd(e) {
                            if (e.target === track && e.propertyName === 'transform') {
                                checkCloneReset();
                            }
                        }

                        track.addEventListener('transitionend', onTransitionEnd);

                        function goToSlide(index, animated = true) {
                            currentIndex = index;
                            if (animated) {
                                track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
                            } else {
                                track.style.transition = 'none';
                            }
                            track.style.transform = `translateX(-${currentIndex * 100}%)`;
                            updateDots();

                            clearTimeout(transitionSafetyTimeout);
                            if (animated) {
                                isTransitioning = true;
                                transitionSafetyTimeout = setTimeout(() => {
                                    checkCloneReset();
                                    isTransitioning = false;
                                }, 500);
                            }
                        }

                        function nextSlide() {
                            if (isTransitioning) return;
                            goToSlide(currentIndex + 1);
                        }

                        function prevSlide() {
                            if (isTransitioning) return;
                            goToSlide(currentIndex - 1);
                        }

                        function startAutoplay() {
                            stopAutoplay();
                            autoplayInterval = setInterval(nextSlide, 4000);
                        }

                        function stopAutoplay() {
                            if (autoplayInterval) {
                                clearInterval(autoplayInterval);
                                autoplayInterval = null;
                            }
                        }

                        const onPrevClick = () => { prevSlide(); startAutoplay(); };
                        const onNextClick = () => { nextSlide(); startAutoplay(); };

                        if (prevBtn) prevBtn.onclick = onPrevClick;
                        if (nextBtn) nextBtn.onclick = onNextClick;

                        dots.forEach((dot, idx) => {
                            dot.onclick = () => {
                                if (isTransitioning) return;
                                goToSlide(idx + 1);
                                startAutoplay();
                            };
                        });

                        let touchStartX = 0;
                        carouselContainer.ontouchstart = (e) => {
                            touchStartX = e.changedTouches[0].screenX;
                            stopAutoplay();
                        };
                        carouselContainer.ontouchend = (e) => {
                            const touchEndX = e.changedTouches[0].screenX;
                            const diff = touchEndX - touchStartX;
                            if (Math.abs(diff) > 40) {
                                if (diff > 0) prevSlide();
                                else nextSlide();
                            }
                            startAutoplay();
                        };

                        startAutoplay();

                        activeCarouselState = {
                            images: images.slice(),
                            destroy: function() {
                                stopAutoplay();
                                clearTimeout(transitionSafetyTimeout);
                                track.removeEventListener('transitionend', onTransitionEnd);
                                if (prevBtn) prevBtn.onclick = null;
                                if (nextBtn) nextBtn.onclick = null;
                                carouselContainer.ontouchstart = null;
                                carouselContainer.ontouchend = null;
                            }
                        };
                    }

                    // 1. Start carousel IMMEDIATELY with initial/fallback images so user NEVER experiences missing banner or blank delay
                    const initialDOMImages = Array.from(track.querySelectorAll('img')).map(img => img.getAttribute('src')).filter(Boolean);
                    const startImages = initialDOMImages.length > 0 ? initialDOMImages : ['./adimg/3.jpg', './adimg/4.jpg'];
                    buildAndStartCarousel(startImages);

                    // 2. Run discovery in background with resilient timeout. If additional or different images found, update seamlessly!
                    discoverAdImages().then(validImgs => {
                        if (!validImgs || validImgs.length === 0) return;
                        const currentImgs = activeCarouselState ? activeCarouselState.images : [];
                        const isSame = currentImgs.length === validImgs.length && currentImgs.every((src, i) => src === validImgs[i]);
                        if (!isSame) {
                            buildAndStartCarousel(validImgs);
                        }
                    }).catch(() => {
                        // Keep current carousel running
                    });
                }
            }

            // 2. UNIVERSAL MODAL CONTROLLER & POPUP SCROLL LOCK MANAGER
            window.animating = false;

            window.ModalScrollLock = {
                lockCount: 0,
                savedScrollY: 0,

                isAnyModalOpen: function () {
                    var appModal = document.querySelector('.app.active:not(#status), .app.modal-closing:not(#status)');
                    var ntModal = document.querySelector('.nt-modal-overlay:not(.nt-modal-hide), .nt-card-overlay:not(.nt-card-hide)');
                    return !!(appModal || ntModal);
                },

                lock: function () {
                    if (this.lockCount === 0) {
                        this.savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                        document.body.classList.add('modal-scroll-locked');
                        document.body.style.overflow = 'hidden';
                        document.documentElement.classList.add('modal-scroll-locked');
                        document.documentElement.style.overflow = 'hidden';
                    }
                    this.lockCount++;
                },

                unlock: function (force) {
                    if (force) {
                        this.lockCount = 0;
                    } else {
                        this.lockCount = Math.max(0, this.lockCount - 1);
                    }

                    if (this.lockCount === 0 || !this.isAnyModalOpen()) {
                        this.lockCount = 0;
                        document.body.classList.remove('modal-scroll-locked');
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                        document.documentElement.classList.remove('modal-scroll-locked');
                    }
                },

                sync: function () {
                    if (this.isAnyModalOpen()) {
                        this.lock();
                    } else {
                        this.unlock(true);
                    }
                },

                init: function () {
                    var self = this;
                    // Prevent background scrolling on touch gestures outside scrollable modal containers
                    document.addEventListener('touchmove', function (e) {
                        if (document.body.classList.contains('modal-scroll-locked')) {
                            var scrollable = e.target.closest('.modal-sheet-card, .nt-modal, .nt-card, .price-div, .sell-point-div, .loan-body, .table-wrapper, .wrapper');
                            if (!scrollable) {
                                e.preventDefault();
                            }
                        }
                    }, { passive: false });

                    // Prevent wheel scroll bleed-through to underlying background
                    document.addEventListener('wheel', function (e) {
                        if (document.body.classList.contains('modal-scroll-locked')) {
                            var scrollable = e.target.closest('.modal-sheet-card, .nt-modal, .nt-card, .price-div, .sell-point-div, .loan-body, .table-wrapper, .wrapper');
                            if (!scrollable) {
                                e.preventDefault();
                            }
                        }
                    }, { passive: false });

                    // Auto-sync observer to maintain accurate state
                    try {
                        var observer = new MutationObserver(function () {
                            var anyOpen = self.isAnyModalOpen();
                            if (anyOpen && !document.body.classList.contains('modal-scroll-locked')) {
                                self.lock();
                            } else if (!anyOpen && document.body.classList.contains('modal-scroll-locked')) {
                                self.unlock(true);
                            }
                        });
                        if (document.body) {
                            observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'], childList: true });
                        }
                    } catch (err) {}
                }
            };
            window.ModalScrollLock.init();

            // Universal Modal History Stack for Phone Back Button
            var modalHistoryCount = 0;
            var isPoppingForClose = false;

            function pushModalHistory(modalId) {
                try {
                    window.history.pushState({ aloulaModal: modalId, timestamp: Date.now() }, '', window.location.href);
                    modalHistoryCount++;
                } catch (e) {}
            }

            function popModalHistory() {
                if (modalHistoryCount > 0) {
                    modalHistoryCount--;
                    isPoppingForClose = true;
                    try {
                        window.history.back();
                    } catch (e) {}
                    setTimeout(function () {
                        isPoppingForClose = false;
                    }, 350);
                }
            }

            window.pushModalHistory = pushModalHistory;
            window.popModalHistory = popModalHistory;

            function openAppModal(modalId) {
                window.animating = false;
                const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
                if (!modal) return;

                // If user is opening status-speed-modal but card has fixed speed, prevent opening
                if (modal.id === 'status-speed-modal') {
                    const loggedUser = (document.getElementById('user') ? document.getElementById('user').innerText : '') || localStorage.getItem('last_user_card') || '';
                    if (typeof window.checkCardHasFixedSpeed === 'function' && window.checkCardHasFixedSpeed(loggedUser)) {
                        return;
                    }
                }

                // If another modal was already active, replace state to avoid duplicate history stack
                const currentlyOpen = document.querySelector('.app.active:not(#status)');
                if (currentlyOpen && currentlyOpen !== modal) {
                    try {
                        window.history.replaceState({ aloulaModal: modal.id, timestamp: Date.now() }, '', window.location.href);
                    } catch (e) {}
                } else if (!currentlyOpen && modal.id !== 'status') {
                    pushModalHistory(modal.id);
                }

                // Close any other open modals immediately
                document.querySelectorAll('.app.active, .app.modal-closing').forEach(m => {
                    if (m !== modal && m.id !== 'status') {
                        m.classList.remove('active', 'modal-closing');
                        m.style.display = 'none';
                    }
                });

                const isStatusActive = document.getElementById('status')?.classList.contains('active');
                const loginEl = document.getElementById('login');
                if (!isStatusActive && loginEl) {
                    loginEl.classList.add('inactive');
                }

                modal.classList.remove('modal-closing');
                modal.style.display = 'flex';
                modal.scrollTop = 0;
                // Trigger reflow for CSS entry animation
                void modal.offsetWidth;
                modal.classList.add('active');

                if (modal.id === 'block') {
                    try {
                        document.documentElement.classList.add('is-blocked-mode');
                        document.body.classList.add('is-blocked-mode');
                        const bNav = document.getElementById('bottomNav');
                        if (bNav) bNav.style.setProperty('display', 'none', 'important');
                    } catch (e) {}
                }

                // Instant sync for dynamic modal contents (price table, sales points, status screen, etc.)
                if (modal.id === 'price' || modal.id === 'sell-point' || modal.id === 'offers-modal' || modal.id === 'status' || modal.id === 'status-speed-modal') {
                    if (typeof syncAllSiteConfigs === 'function') {
                        syncAllSiteConfigs();
                    }
                    if (modal.id === 'status-speed-modal' && typeof window.syncStatusScreenInitialValues === 'function') {
                        window.syncStatusScreenInitialValues();
                    }
                }

                // Lock background scroll
                if (window.ModalScrollLock) {
                    window.ModalScrollLock.lock();
                } else {
                    document.body.style.overflow = 'hidden';
                }
            }

            function closeAppModal(modalOrId, fromPopState) {
                window.animating = false;
                let targets = [];
                if (typeof modalOrId === 'string') {
                    const el = document.getElementById(modalOrId);
                    if (el) targets.push(el);
                } else if (modalOrId instanceof HTMLElement) {
                    targets.push(modalOrId);
                } else {
                    document.querySelectorAll('.app.active').forEach(m => {
                        if (m.id !== 'status') targets.push(m);
                    });
                }

                if (targets.length === 0) return;

                // Pop history if closed from user interaction (button click/backdrop) rather than phone back button
                if (!fromPopState) {
                    popModalHistory();
                }

                targets.forEach(target => {
                    if (target.id === 'status') return;
                    target.classList.remove('active');
                    target.classList.add('modal-closing');

                    setTimeout(() => {
                        if (target.classList.contains('modal-closing') && !target.classList.contains('active')) {
                            target.classList.remove('modal-closing');
                            target.style.display = 'none';
                        }
                    }, 240);

                    if (target.id === 'block') {
                        try {
                            document.documentElement.classList.remove('is-blocked-mode');
                            document.body.classList.remove('is-blocked-mode');
                            const bNav = document.getElementById('bottomNav');
                            if (bNav) bNav.style.removeProperty('display');
                        } catch (e) {}
                    }
                });

                const isStatusActive = document.getElementById('status')?.classList.contains('active');
                const loginEl = document.getElementById('login');
                if (!isStatusActive && loginEl) {
                    loginEl.style.display = 'block';
                    loginEl.style.visibility = 'visible';
                    loginEl.classList.remove('inactive');
                }

                // Unlock background scroll smoothly after animation
                setTimeout(() => {
                    if (window.ModalScrollLock) {
                        window.ModalScrollLock.unlock();
                    } else {
                        document.body.style.overflow = '';
                    }
                }, 240);
            }

            // Expose globally for legacy/inline scripts
            window.openAppModal = openAppModal;
            window.closeAppModal = closeAppModal;

            // Media & Entertainment Direct Redirection (Lounge & Live Broadcast)
            window.handleMediaRedirect = function (event, fallbackUrl, title) {
                var cfg = window.siteConfig || {};
                var targetUrl = '';
                if (title === 'البث المباشر') {
                    targetUrl = (cfg.moba && cfg.moba.trim()) || fallbackUrl || 'http://40.10.10.10/liveStream/';
                } else {
                    targetUrl = (cfg.estr && cfg.estr.trim()) || fallbackUrl || 'http://40.10.10.10';
                }

                if (!targetUrl || targetUrl === '#' || targetUrl === '') return;

                try {
                    window.location.href = targetUrl;
                } catch (err) {
                    try {
                        window.open(targetUrl, '_blank');
                    } catch (e2) {}
                }
            };

            // Phone Hardware / Gesture Back Button Listener (popstate)
            window.addEventListener('popstate', function (event) {
                if (isPoppingForClose) {
                    isPoppingForClose = false;
                    return;
                }

                // 1. Check for notification overlay
                const ntModal = document.querySelector('.nt-modal-overlay');
                if (ntModal) {
                    if (modalHistoryCount > 0) modalHistoryCount--;
                    const closeBtn = ntModal.querySelector('.nt-modal-close');
                    if (closeBtn) {
                        closeBtn.click();
                    } else if (typeof ntModal.remove === 'function') {
                        ntModal.remove();
                    } else if (ntModal.parentNode) {
                        ntModal.parentNode.removeChild(ntModal);
                    }
                    return;
                }

                

                // 3. Check for any active app modals (price, sell-point, loan, speed-modal, status-speed-modal, app-store, block)
                const activeModals = document.querySelectorAll('.app.active:not(#status)');
                if (activeModals.length > 0) {
                    if (modalHistoryCount > 0) modalHistoryCount--;
                    activeModals.forEach(m => {
                        closeAppModal(m, true);
                    });
                    return;
                }
            });

            // Desktop / Physical Keyboard Escape Key Handler
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    const activeModal = document.querySelector('.app.active:not(#status)');
                    if (activeModal) {
                        closeAppModal(activeModal);
                    }
                }
            });

            // Universal Click Handler for All Modal Close & Cancel Buttons
            document.addEventListener('click', function (e) {
                const closeTrigger = e.target.closest('.modal-close-btn, .modal-cancel-btn, .back, button[data-modal-close]');
                if (closeTrigger) {
                    const parentApp = closeTrigger.closest('.app');
                    if (parentApp && parentApp.id !== 'status') {
                        e.preventDefault();
                        e.stopPropagation();
                        closeAppModal(parentApp);
                        return;
                    }
                }

                // Clicking on dark backdrop outside modal card
                if (e.target.classList && e.target.classList.contains('app') && e.target.classList.contains('active') && e.target.id !== 'status') {
                    e.preventDefault();
                    closeAppModal(e.target);
                }
            }, true);

            // Modal Trigger Buttons (parent-id and dedicated IDs)
            document.querySelectorAll('button[parent-id], [data-open-modal]').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    const parentId = this.getAttribute('parent-id') || this.getAttribute('data-open-modal');
                    if (parentId && parentId !== 'status') {
                        e.preventDefault();
                        e.stopPropagation();
                        openAppModal(parentId);
                    }
                }, true);
            });

            // 3. SPEED SELECTOR & OVAL PILLS SYNC (LOGIN SCREEN)
            const speedSelect = document.getElementById('speed');
            const speedCards = document.querySelectorAll('#speed-modal .speed-card-option');
            const speedPills = document.querySelectorAll('.speed-pill-btn');
            const selectedSpeedDisplay = document.getElementById('selectedSpeedDisplay');

            // Apply Ultra Speed Option visibility from config.js ("enable-ultra-speed")
            try {
                if (typeof hotOption !== 'undefined') {
                    if (hotOption['enable-ultra-speed']) {
                        const optUltra = document.getElementById('opt-speed-ultra');
                        const cardUltra = document.getElementById('card-speed-ultra');
                        const pillUltra = document.getElementById('pill-speed-ultra');
                        const cardStatusUltra = document.getElementById('card-status-speed-ultra');
                        if (optUltra) optUltra.style.display = '';
                        if (cardUltra) cardUltra.style.display = '';
                        if (pillUltra) pillUltra.style.display = '';
                        if (cardStatusUltra) cardStatusUltra.style.display = '';
                    }

                    // Apply News and Offers configuration dynamically
                    if (hotOption['news-title']) {
                        const el = document.getElementById('loan-news-title');
                        if (el) el.textContent = hotOption['news-title'];
                    }
                    if (hotOption['news-content']) {
                        const el = document.getElementById('loan-news-content');
                        if (el) el.innerHTML = hotOption['news-content'];
                    }
                    if (hotOption['news-code']) {
                        const el = document.getElementById('loan-news-code');
                        if (el) el.textContent = hotOption['news-code'];
                    }
                    if (hotOption['news-extra-title']) {
                        const el = document.getElementById('loan-news-extra-title');
                        if (el) el.textContent = hotOption['news-extra-title'];
                    }
                    if (hotOption['news-extra-content']) {
                        const el = document.getElementById('loan-news-extra-content');
                        if (el) el.textContent = hotOption['news-extra-content'];
                    }
                    if (hotOption['news-extra-badge']) {
                        const el = document.getElementById('loan-news-extra-badge');
                        if (el) el.textContent = hotOption['news-extra-badge'];
                    }
                }
            } catch (err) {
                console.error(err);
            }

            const defaultSpeedMap = {
                '': 'سرعة أفتراضية',
                '128K/512K': 'سرعة منخفضة 512',
                '256K/1024K': 'سرعة عادية 1 ميجا',
                '512K/2048K': 'سرعة متوسطة 2 ميجا',
                '1024K/4096K': 'سرعة مفتوحة',
                '2M/4M': 'سرعة اقتصادية',
                '2M/5M': 'سرعة عادية',
                '2M/7M': 'سرعة متوسطة',
                '3M/7M': 'سرعة متوسطة',
                '2M/8M': 'سرعة عالية',
                '2M/16M': 'سرعة عالية جدا',
                '2M/20M': 'سرعة خارقة'
            };

            function getSpeedLabel(val) {
                if (!val || val === 'سرعة الكرت' || val === '$(domain)' || val === 's' || val === '$(domain)s') {
                    if (window.siteConfig && Array.isArray(window.siteConfig.speedOptions)) {
                        const def = window.siteConfig.speedOptions.find(s => s.selected || s.isDefault);
                        if (def) return def.label || def.name;
                    }
                    return 'سرعة أفتراضية';
                }

                // Check direct match
                if (window.speedNameMap && window.speedNameMap[val]) {
                    return window.speedNameMap[val];
                }
                if (defaultSpeedMap[val]) {
                    return defaultSpeedMap[val];
                }

                // Try clean speed
                const clean = (typeof extractMikrotikSpeed === 'function') ? extractMikrotikSpeed(val) : val.replace(/^@/, '').replace(/\|$/, '').split('_')[0];
                if (window.speedNameMap) {
                    if (window.speedNameMap[clean]) return window.speedNameMap[clean];
                    if (window.speedNameMap['@' + clean + '|']) return window.speedNameMap['@' + clean + '|'];
                    if (window.speedNameMap[clean + '|']) return window.speedNameMap[clean + '|'];
                }
                if (defaultSpeedMap[clean]) {
                    return defaultSpeedMap[clean];
                }

                // Check speedOptions in config
                if (window.siteConfig && Array.isArray(window.siteConfig.speedOptions)) {
                    const match = window.siteConfig.speedOptions.find(s => {
                        const optVal = s.value || '';
                        const optClean = (typeof extractMikrotikSpeed === 'function') ? extractMikrotikSpeed(optVal) : optVal.replace(/^@/, '').replace(/\|$/, '').split('_')[0];
                        return optVal === val || optClean.toLowerCase() === clean.toLowerCase();
                    });
                    if (match) return match.label || match.name;
                }

                return val;
            }

            function updateSpeedSelection(val) {
                if (speedSelect && speedSelect.value !== val) {
                    speedSelect.value = val;
                    const event = new Event('change', { bubbles: true });
                    speedSelect.dispatchEvent(event);
                }
                const label = getSpeedLabel(val);
                if (selectedSpeedDisplay) {
                    selectedSpeedDisplay.textContent = label;
                }
                speedCards.forEach(card => {
                    const cardSpeed = card.getAttribute('data-speed');
                    const cardTitle = card.getAttribute('data-speed-title');
                    card.classList.toggle('active', cardSpeed === val || cardTitle === label);
                });
                speedPills.forEach(pill => {
                    const pillSpeed = pill.getAttribute('data-speed');
                    const pillTitle = pill.getAttribute('data-speed-title');
                    const isActive = pillSpeed === val || pillTitle === label;
                    pill.classList.toggle('active', isActive);
                    if (isActive && speedPillsRow) {
                        const scrollTarget = pill.offsetLeft - (speedPillsRow.clientWidth / 2) + (pill.clientWidth / 2);
                        speedPillsRow.scrollTo({ left: scrollTarget, behavior: 'smooth' });
                    }
                });
                if (typeof window.syncStatusScreenInitialValues === 'function') {
                    window.syncStatusScreenInitialValues();
                }
            }

            // Speed Pill Buttons Event Listener
            if (speedPills.length > 0) {
                speedPills.forEach(pill => {
                    pill.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const val = this.getAttribute('data-speed');
                        const speedTitle = this.getAttribute('data-speed-title') || getSpeedLabel(val);
                        updateSpeedSelection(val);
                        if (selectedSpeedDisplay) {
                            selectedSpeedDisplay.textContent = speedTitle;
                        }
                    });
                });
            }

            // Speed Strip Carousel Scroll Arrows & Drag Support
            const speedPillsRow = document.getElementById('speedPillsRow');
            const speedNavPrev = document.getElementById('speedNavPrev');
            const speedNavNext = document.getElementById('speedNavNext');

            if (speedPillsRow) {
                if (speedNavPrev) {
                    speedNavPrev.addEventListener('click', function (e) {
                        e.preventDefault();
                        speedPillsRow.scrollBy({ left: -90, behavior: 'smooth' });
                    });
                }
                if (speedNavNext) {
                    speedNavNext.addEventListener('click', function (e) {
                        e.preventDefault();
                        speedPillsRow.scrollBy({ left: 90, behavior: 'smooth' });
                    });
                }

                // Mouse Drag to scroll
                let isDragging = false;
                let startX = 0;
                let scrollLeft = 0;

                speedPillsRow.addEventListener('mousedown', function (e) {
                    isDragging = true;
                    startX = e.pageX - speedPillsRow.offsetLeft;
                    scrollLeft = speedPillsRow.scrollLeft;
                });
                window.addEventListener('mouseup', function () {
                    isDragging = false;
                });
                speedPillsRow.addEventListener('mousemove', function (e) {
                    if (!isDragging) return;
                    e.preventDefault();
                    const x = e.pageX - speedPillsRow.offsetLeft;
                    const walk = (x - startX) * 1.5;
                    speedPillsRow.scrollLeft = scrollLeft - walk;
                });
            }

            if (speedCards.length > 0) {
                speedCards.forEach(card => {
                    card.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const val = this.getAttribute('data-speed');
                        const speedTitle = this.getAttribute('data-speed-title') || getSpeedLabel(val);

                        updateSpeedSelection(val);
                        if (selectedSpeedDisplay) {
                            selectedSpeedDisplay.textContent = speedTitle;
                        }

                        // Close speed modal and return smoothly to login view
                        setTimeout(() => {
                            closeAppModal('speed-modal');
                        }, 180);
                    });
                });
            }

            if (speedSelect) {
                speedSelect.addEventListener('change', function () {
                    const val = speedSelect.value;
                    const label = getSpeedLabel(val);
                    if (selectedSpeedDisplay && label) {
                        selectedSpeedDisplay.textContent = label;
                    }
                    speedCards.forEach(card => {
                        const cardSpeed = card.getAttribute('data-speed');
                        const cardTitle = card.getAttribute('data-speed-title');
                        card.classList.toggle('active', cardSpeed === val || cardTitle === label);
                    });
                    speedPills.forEach(pill => {
                        const pillSpeed = pill.getAttribute('data-speed');
                        const pillTitle = pill.getAttribute('data-speed-title');
                        pill.classList.toggle('active', pillSpeed === val || pillTitle === label);
                    });
                });
            }

            // 4. UPDATES BLOCKER TOGGLE STATUS TEXT (LOGIN SCREEN)
            const chUpdate = document.getElementById('chupdate');
            const updateStatusText = document.getElementById('updateStatusText');
            const updateNotice = document.getElementById('updateNotice');
            const updateNoticeClose = document.getElementById('updateNoticeClose');
            const updateNoticeOk = document.getElementById('updateNoticeOk');

            const closeUpdateNotice = () => {
                if (updateNotice) updateNotice.classList.remove('on');
            };
            if (updateNoticeClose) updateNoticeClose.addEventListener('click', closeUpdateNotice);
            if (updateNoticeOk) updateNoticeOk.addEventListener('click', closeUpdateNotice);
            if (updateNotice) {
                updateNotice.addEventListener('click', (e) => {
                    if (e.target === updateNotice) closeUpdateNotice();
                });
            }

            if (chUpdate && updateStatusText) {
                const updateToggleState = (userTriggered) => {
                    const cfg = window.siteConfig || {};
                    const isFeatureEnabled = cfg.updatesBlockerV === true || (cfg.updatesBlockerV !== false && cfg["enable-updates-blocker"] !== 0 && cfg["enable-updates-blocker"] !== false);
                    if (!isFeatureEnabled) {
                        chUpdate.checked = false;
                        updateStatusText.textContent = 'متوقف';
                        updateStatusText.classList.remove('active');
                        try { localStorage.setItem('hotspot_updates', '0'); } catch (e) {}
                        return;
                    }
                    const isChecked = chUpdate.checked;
                    if (isChecked) {
                        updateStatusText.textContent = 'مفعل';
                        updateStatusText.classList.add('active');
                        if (userTriggered && updateNotice) {
                            updateNotice.classList.add('on');
                        }
                    } else {
                        updateStatusText.textContent = 'متوقف';
                        updateStatusText.classList.remove('active');
                    }
                    try {
                        localStorage.setItem('hotspot_updates', isChecked ? '1' : '0');
                        const hiddenUpdate = document.getElementById('update');
                        if (hiddenUpdate) hiddenUpdate.value = isChecked ? 'choose-auto-update-off' : '';
                    } catch (err) {}
                    // Synchronize immediately to status screen toggle so it never flickers
                    const statusCh = document.getElementById('statusChupdate');
                    const statusLbl = document.getElementById('statusUpdateStatusText');
                    if (statusCh) statusCh.checked = isChecked;
                    if (statusLbl) {
                        statusLbl.textContent = isChecked ? 'مفعل' : 'متوقف';
                        if (isChecked) statusLbl.classList.add('active');
                        else statusLbl.classList.remove('active');
                    }
                };
                chUpdate.addEventListener('change', () => updateToggleState(true));
                updateToggleState(false);
            }

            // 5. STATUS SCREEN: SPEED MODAL HANDLER (LIVE CONNECTION SPEED CHANGE)
            const statusSpeedCards = document.querySelectorAll('#status-speed-modal .speed-card-option');
            const statusSpeedTriggerText = document.getElementById('statusSpeedTriggerText');
            const sspeedSpan = document.getElementById('sspeed');

            if (statusSpeedCards.length > 0) {
                statusSpeedCards.forEach(card => {
                    card.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const val = this.getAttribute('data-status-speed');
                        const speedTitle = this.getAttribute('data-speed-title') || getSpeedLabel(val);
                        const speedchange = document.getElementById('speedchange');

                        statusSpeedCards.forEach(c => c.classList.toggle('active', c === this));

                        if (statusSpeedTriggerText && speedTitle) {
                            statusSpeedTriggerText.textContent = speedTitle;
                        }
                        if (speedchange) {
                            speedchange.value = val;
                            const ev = new Event('change', { bubbles: true });
                            speedchange.dispatchEvent(ev);
                        }

                        setTimeout(() => {
                            closeAppModal('status-speed-modal');
                        }, 180);
                    });
                });

                // Synchronize trigger text and active speed card when sspeed updates from MikroTik
                if (sspeedSpan) {
                    const syncSpeedFromMikrotik = () => {
                        const txt = (sspeedSpan.innerText || sspeedSpan.textContent || '').trim();
                        if (txt && txt !== 'سرعة الكرت') {
                            const friendlyName = getSpeedLabel(txt);
                            if (friendlyName !== txt) {
                                sspeedSpan.textContent = friendlyName;
                            }
                            if (statusSpeedTriggerText) {
                                statusSpeedTriggerText.textContent = friendlyName;
                            }
                            const cleanTxt = (typeof extractMikrotikSpeed === 'function') ? extractMikrotikSpeed(txt) : txt.replace(/^@/, '').replace(/\|$/, '').split('_')[0];
                            statusSpeedCards.forEach(card => {
                                const cardTitle = card.getAttribute('data-speed-title') || '';
                                const cardVal = card.getAttribute('data-status-speed') || '';
                                const cleanCardVal = (typeof extractMikrotikSpeed === 'function') ? extractMikrotikSpeed(cardVal) : cardVal.replace(/^@/, '').replace(/\|$/, '').split('_')[0];
                                if (cardTitle === friendlyName || cardVal === txt || (cleanTxt && cleanCardVal && cleanCardVal.toLowerCase() === cleanTxt.toLowerCase())) {
                                    card.classList.add('active');
                                } else {
                                    card.classList.remove('active');
                                }
                            });
                        }
                    };
                    const speedObserver = new MutationObserver(syncSpeedFromMikrotik);
                    speedObserver.observe(sspeedSpan, { childList: true, characterData: true, subtree: true });
                    syncSpeedFromMikrotik();
                }
            }

            // 6. STATUS SCREEN: UPDATES BLOCKER TOGGLE (Identical to Login Screen)
            const statusChupdate = document.getElementById('statusChupdate');
            const statusUpdateStatusText = document.getElementById('statusUpdateStatusText');
            const updatechange = document.getElementById('updatechange');
            const updateSpan = document.getElementById('update');
            let _toggleLockTimer = null;

            if (statusChupdate && statusUpdateStatusText) {
                let isSyncing = false;
                const updateStatusToggleState = (triggerChange = false) => {
                    const cfg = window.siteConfig || {};
                    const isFeatureEnabled = cfg.updatesBlockerV === true || (cfg.updatesBlockerV !== false && cfg["enable-updates-blocker"] !== 0 && cfg["enable-updates-blocker"] !== false);
                    if (!isFeatureEnabled) {
                        statusChupdate.checked = false;
                        statusUpdateStatusText.textContent = 'متوقف';
                        statusUpdateStatusText.classList.remove('active');
                        return;
                    }
                    if (isSyncing) return;
                    const isChecked = statusChupdate.checked;

                    // Optimistic update without flicker
                    if (isChecked) {
                        statusUpdateStatusText.textContent = 'مفعل';
                        statusUpdateStatusText.classList.add('active');
                    } else {
                        statusUpdateStatusText.textContent = 'متوقف';
                        statusUpdateStatusText.classList.remove('active');
                    }

                    if (triggerChange) {
                        // Prevent background polling from overriding switch state during re-login
                        window._isTogglingUpdateBlocker = true;
                        if (_toggleLockTimer) clearTimeout(_toggleLockTimer);
                        _toggleLockTimer = setTimeout(() => {
                            window._isTogglingUpdateBlocker = false;
                        }, 2500);

                        if (updatechange) {
                            updatechange.value = isChecked ? '_Uoff' : '_Uon';
                            const ev = new Event('change', { bubbles: true });
                            updatechange.dispatchEvent(ev);
                        }
                    }
                };

                statusChupdate.addEventListener('change', () => updateStatusToggleState(true));

                // Live Sync with MikroTik status query updates
                if (updateSpan) {
                    const syncFromMikrotik = () => {
                        const cfg = window.siteConfig || {};
                        const isFeatureEnabled = cfg.updatesBlockerV === true || (cfg.updatesBlockerV !== false && cfg["enable-updates-blocker"] !== 0 && cfg["enable-updates-blocker"] !== false);
                        if (!isFeatureEnabled) {
                            statusChupdate.checked = false;
                            statusUpdateStatusText.textContent = 'متوقف';
                            statusUpdateStatusText.classList.remove('active');
                            return;
                        }
                        if (window._isTogglingUpdateBlocker) return;
                        const text = (updateSpan.innerText || updateSpan.textContent || '').trim();
                        isSyncing = true;
                        if (text.includes('أيقاف') || text.includes('ايقاف') || text.includes('Uoff')) {
                            statusChupdate.checked = true;
                            statusUpdateStatusText.textContent = 'مفعل';
                            statusUpdateStatusText.classList.add('active');
                        } else if (text.includes('تفعيل') || text.includes('Uon')) {
                            statusChupdate.checked = false;
                            statusUpdateStatusText.textContent = 'متوقف';
                            statusUpdateStatusText.classList.remove('active');
                        }
                        isSyncing = false;
                    };

                    const observer = new MutationObserver(syncFromMikrotik);
                    observer.observe(updateSpan, { childList: true, characterData: true, subtree: true });
                    syncFromMikrotik();
                }
            }

            // Instant synchronization of user options between Login screen and Status screen
            window.syncStatusScreenInitialValues = function () {
                // 1. Synchronize Speed
                let friendlySpeed = '';
                const sspeedSpan = document.getElementById('sspeed');
                const statusSpeedTriggerText = document.getElementById('statusSpeedTriggerText');
                
                // If sspeed already has a resolved speed value from MikroTik status query
                if (sspeedSpan) {
                    const currentTxt = (sspeedSpan.textContent || sspeedSpan.innerText || '').trim();
                    if (currentTxt && currentTxt !== 'سرعة الكرت' && currentTxt !== '$(domain)') {
                        friendlySpeed = getSpeedLabel(currentTxt);
                    }
                }

                if (!friendlySpeed) {
                    const selectedSpeedDisplay = document.getElementById('selectedSpeedDisplay');
                    if (selectedSpeedDisplay && selectedSpeedDisplay.textContent && selectedSpeedDisplay.textContent.trim()) {
                        const txt = selectedSpeedDisplay.textContent.trim();
                        if (!txt.includes('🔒') && txt !== 'أختر سرعة الإنترنت') {
                            friendlySpeed = txt;
                        }
                    }
                }
                if (!friendlySpeed) {
                    const speedSelect = document.getElementById('speed');
                    if (speedSelect && speedSelect.selectedIndex >= 0 && speedSelect.options[speedSelect.selectedIndex]) {
                        const opt = speedSelect.options[speedSelect.selectedIndex];
                        if (opt.value && opt.text) friendlySpeed = opt.text;
                    }
                }
                if (!friendlySpeed) {
                    try {
                        const savedName = localStorage.getItem('hotspot_speed_name');
                        if (savedName && savedName.trim()) friendlySpeed = savedName.trim();
                        else {
                            const savedSpeed = localStorage.getItem('hotspot_speed');
                            if (savedSpeed) {
                                friendlySpeed = getSpeedLabel(savedSpeed.split('_')[0]);
                            }
                        }
                    } catch (e) {}
                }
                if (!friendlySpeed && typeof getLoginCardCookie === 'function') {
                    const cObj = getLoginCardCookie();
                    if (cObj && cObj.speed) {
                        friendlySpeed = getSpeedLabel(cObj.speed.split('_')[0]);
                    }
                }
                if (!friendlySpeed && window.siteConfig && Array.isArray(window.siteConfig.speedOptions)) {
                    const def = window.siteConfig.speedOptions.find(s => s.selected || s.isDefault) || window.siteConfig.speedOptions[0];
                    if (def) friendlySpeed = def.label || def.name;
                }
                if (!friendlySpeed) friendlySpeed = 'سرعة أفتراضية';

                if (sspeedSpan) {
                    sspeedSpan.textContent = friendlySpeed;
                }
                if (statusSpeedTriggerText) {
                    statusSpeedTriggerText.textContent = friendlySpeed;
                }

                // Synchronize active status speed card
                const statusSpeedCards = document.querySelectorAll('#status-speed-modal .speed-card-option');
                statusSpeedCards.forEach(card => {
                    const cardTitle = card.getAttribute('data-speed-title') || '';
                    const cardVal = card.getAttribute('data-status-speed') || '';
                    const cleanCardVal = (typeof extractMikrotikSpeed === 'function') ? extractMikrotikSpeed(cardVal) : cardVal.replace(/^@/, '').replace(/\|$/, '').split('_')[0];
                    const cardLabel = getSpeedLabel(cardVal);
                    if (cardTitle === friendlySpeed || cardLabel === friendlySpeed || cardVal === friendlySpeed || (cardVal && friendlySpeed.includes(cardVal)) || (cleanCardVal && friendlySpeed.includes(cleanCardVal))) {
                        card.classList.add('active');
                    } else {
                        card.classList.remove('active');
                    }
                });

                // 2. Synchronize Updates Blocker Toggle
                const cfg = window.siteConfig || {};
                const isFeatureEnabled = cfg.updatesBlockerV === true || (cfg.updatesBlockerV !== false && cfg["enable-updates-blocker"] !== 0 && cfg["enable-updates-blocker"] !== false);
                const chupdate = document.getElementById('chupdate');
                let isBlocked = false;
                if (isFeatureEnabled) {
                    if (chupdate && chupdate.checked) {
                        isBlocked = true;
                    } else {
                        try {
                            const savedUp = localStorage.getItem('hotspot_updates');
                            if (savedUp === '1') {
                                isBlocked = true;
                            } else if (savedUp === '0') {
                                isBlocked = false;
                            } else {
                                const savedSpeed = localStorage.getItem('hotspot_speed') || '';
                                if (savedSpeed.includes('_Uoff') || savedSpeed.includes('Uoff') || savedSpeed.includes('*yes**')) {
                                    isBlocked = true;
                                }
                            }
                        } catch (e) {}
                        if (!isBlocked && typeof getLoginCardCookie === 'function') {
                            const cObj = getLoginCardCookie();
                            if (cObj && cObj.speed && (cObj.speed.includes('_Uoff') || cObj.speed.includes('*yes**'))) {
                                isBlocked = true;
                            }
                        }
                    }
                } else {
                    isBlocked = false;
                    if (chupdate) chupdate.checked = false;
                }

                const statusChupdate = document.getElementById('statusChupdate');
                const statusUpdateStatusText = document.getElementById('statusUpdateStatusText');
                if (statusChupdate) {
                    statusChupdate.checked = isBlocked;
                }
                if (statusUpdateStatusText) {
                    statusUpdateStatusText.textContent = isBlocked ? 'مفعل' : 'متوقف';
                    if (isBlocked) {
                        statusUpdateStatusText.classList.add('active');
                    } else {
                        statusUpdateStatusText.classList.remove('active');
                    }
                }
                if (typeof window.applyStatusScreenFixedSpeedLock === 'function') {
                    window.applyStatusScreenFixedSpeedLock();
                }
            };

            // Run initial sync right away on DOM ready
            window.syncStatusScreenInitialValues();

            // -------------------------------------------------------------
            // Comprehensive Global Sync with window.siteConfig
            // (Site Name, Customer Support Phones, WhatsApp Dynamic Text, Offers Modal & Entertainment)
            // -------------------------------------------------------------
            function syncAllSiteConfigs() {
                const config = window.siteConfig || {};
                const netName = config.siteName || 'BH-NET';
                const suppPhone = config.supportPhone || '770807056';
                const waPhone = config.whatsappPhone || '967' + suppPhone.replace(/^0+/, '');
                let rawWaMsg = config.whatsappMsg || 'مرحبا خدمة عملاء شبكة {network-name} اللاسلكية';
                const formattedWaMsg = rawWaMsg.replace(/\{network-name\}/g, netName);
                const encodedWaMsg = encodeURIComponent(formattedWaMsg);

                // 1. Sync Network Name everywhere
                const titleEl = document.querySelector('title[data-network-name]') || document.querySelector('title');
                if (titleEl) {
                    titleEl.innerText = `شبكة ${netName} اللاسلكية`;
                }

                document.querySelectorAll('[data-network-name]').forEach(el => {
                    if (el.tagName.toLowerCase() !== 'title') {
                        el.innerText = `شبكة ${netName} اللاسلكية`;
                    }
                });

                // Update Header Brand Logo Title (Logo and Gold Suffix)
                const parts = netName.trim().split(/\s+/);
                let brandPrefix = parts[0] || netName;
                let brandSuffix = parts.slice(1).join(' ');
                const logoEl = document.getElementById('networkHeaderLogo') || document.querySelector('[data-network-logo="true"]');
                const logoSrc = config.networkLogo || config.logo || config["network-logo"];
                if (logoEl && logoSrc) {
                    logoEl.src = logoSrc;
                }
                const prefixEl = document.querySelector('[data-network-name-prefix="true"]');
                const suffixEl = document.querySelector('.brand-net-gold');
                if (prefixEl && !logoEl) prefixEl.textContent = brandPrefix;
                if (suffixEl) {
                    suffixEl.textContent = brandSuffix || 'نت';
                    suffixEl.style.display = 'inline-block';
                }

                // Update Subtitle line text under brand title
                const subDecEl = document.querySelector('.sub-dec-text');
                if (subDecEl && config.subDecText) {
                    subDecEl.textContent = config.subDecText;
                }

                document.querySelectorAll('.network-logo-img, .brand-logo-img').forEach(img => {
                    img.alt = `شعار ${netName}`;
                });

                // 2. Sync Customer Support & Call Buttons
                document.querySelectorAll('.support-btn-call, .fab-support').forEach(link => {
                    link.href = `tel:${suppPhone}`;
                });

                document.querySelectorAll('[data-service-number]').forEach(span => {
                    span.innerText = `خدمة العملاء: ${suppPhone}`;
                });

                // Sync News / Ticker
                const rawSlides = [
                    config['news-line'],
                    config.textSlider1,
                    config.textSlider2,
                    config.textSlider3,
                    config.textSlider4
                ].filter(t => t && typeof t === 'string' && t.trim() !== '' && t.trim() !== '--');

                const validSlides = [];
                rawSlides.forEach(t => {
                    const clean = t.trim();
                    if (!validSlides.includes(clean)) validSlides.push(clean);
                });

                const newsText = validSlides.length > 0
                    ? validSlides.join('   ★   ')
                    : '⚡ باقات متنوعة وسرعات مناسبة للتصفح والألعاب والاستخدام اليومي ★ 📍 الكروت متوفرة عبر تطبيق برق وايفاي وجميع البقالات المجاورة للشبكة';

                document.querySelectorAll('[data-news-line]').forEach(p => {
                    p.innerText = newsText;
                });
                if (typeof setupMarquee === 'function') {
                    setupMarquee();
                }

                // 3. Sync WhatsApp links
                const waScheme = `whatsapp://send?phone=${waPhone}&text=${encodedWaMsg}`;
                const waWeb = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodedWaMsg}`;

                document.querySelectorAll('.support-btn-whatsapp').forEach(btn => {
                    btn.href = waScheme;
                    btn.setAttribute('data-wa-web', waWeb);
                    btn.setAttribute('data-wa-scheme', waScheme);
                });

                // 4. Sync Offers & What's New Modal (#loan)
                const loanTitle = document.getElementById('loan-news-title') || document.querySelector('[data-news-title]');
                if (loanTitle && config.offersTitle) {
                    loanTitle.innerHTML = `🔥 ${config.offersTitle} 🔥`;
                }

                const loanContent = document.getElementById('loan-news-content') || document.querySelector('[data-news-content]');
                if (loanContent && config.offers) {
                    loanContent.innerHTML = config.offers.replace(/\n/g, '<br>');
                }

                // Sync Free Offer Badge (عرض مجاني)
                const loanCode = document.getElementById('loan-news-code') || document.querySelector('[data-news-code]');
                const loanBr1 = document.getElementById('loan-news-break');
                const loanBr2 = document.getElementById('loan-news-break-2');
                if (loanCode) {
                    const isBadgeEnabled = config.offersBadgeV !== false && (config.offersBadge === undefined || (typeof config.offersBadge === 'string' && config.offersBadge.trim().length > 0));
                    if (isBadgeEnabled) {
                        loanCode.textContent = (config.offersBadge && config.offersBadge.trim()) || 'عرض مجاني';
                        loanCode.style.display = 'inline-block';
                        if (loanBr1) loanBr1.style.display = '';
                        if (loanBr2) loanBr2.style.display = '';
                    } else {
                        loanCode.style.display = 'none';
                        if (loanBr1) loanBr1.style.display = 'none';
                        if (loanBr2) loanBr2.style.display = 'none';
                    }
                }

                const loanBtn = document.getElementById('loan-news-extra-badge') || document.querySelector('[data-news-extra-badge]');
                const loanExtraHeader = document.getElementById('loan-news-extra-header');
                const loanExtraTitle = document.getElementById('loan-news-extra-title');
                const loanExtraContent = document.getElementById('loan-news-extra-content');

                if (loanBtn) {
                    const isOffersBtnEnabled = config.offersBtnV !== false && config.offersBtnUrl && config.offersBtnUrl.trim().length > 0;
                    if (isOffersBtnEnabled) {
                        loanBtn.href = config.offersBtnUrl.trim();
                        loanBtn.innerText = config.offersBtnText || '📺 مشاهدة البث المباشر';
                        loanBtn.style.display = 'inline-block';
                        if (loanExtraHeader) loanExtraHeader.style.display = 'flex';
                        if (loanExtraTitle) loanExtraTitle.innerText = config.offersBtnText || '📺 البث المباشر';
                    } else {
                        loanBtn.style.display = 'none';
                        if (loanExtraHeader) loanExtraHeader.style.display = 'none';
                        if (loanExtraTitle) loanExtraTitle.style.display = 'none';
                        if (loanExtraContent) loanExtraContent.style.display = 'none';
                    }
                }

                // 5. Sync Entertainment & Lounge Links with window.siteConfig (moba & estr & their toggles)
                const isMobaEnabled = config.mobaV !== false && typeof config.moba === 'string' && config.moba.trim().length > 0;
                const isEstrEnabled = (config.estrV === true || (config.estrV !== false && config.estr && config.estr.trim().length > 0)) && typeof config.estr === 'string' && config.estr.trim().length > 0 && config.estr.trim() !== '#' && config.estr.trim() !== '';

                document.querySelectorAll('[data-mobasher]').forEach(el => {
                    if (isMobaEnabled) {
                        el.href = config.moba.trim();
                        el.removeAttribute('target');
                        el.removeAttribute('rel');
                        const span = el.querySelector('span');
                        if (span) span.textContent = 'البث المباشر';
                        el.style.setProperty('display', 'flex', 'important');
                    } else {
                        el.style.setProperty('display', 'none', 'important');
                    }
                });

                document.querySelectorAll('[data-estr]').forEach(el => {
                    if (isEstrEnabled) {
                        el.href = config.estr.trim();
                        el.removeAttribute('target');
                        el.removeAttribute('rel');
                        const span = el.querySelector('span');
                        if (span) span.textContent = 'الإستراحة';
                        el.style.setProperty('display', 'flex', 'important');
                    } else {
                        el.style.setProperty('display', 'none', 'important');
                    }
                });

                document.querySelectorAll('.entertainment-links').forEach(container => {
                    if (isMobaEnabled || isEstrEnabled) {
                        container.style.setProperty('display', 'flex', 'important');
                    } else {
                        container.style.setProperty('display', 'none', 'important');
                    }
                });

                // 6. Sync Packages / Profiles table if provided in siteConfig
                const packagesList = (Array.isArray(config.packages) && config.packages.length > 0) ? config.packages :
                                     (Array.isArray(config.profiles) && config.profiles.length > 0) ? config.profiles : null;
                if (packagesList) {
                    const profilesTbody = document.getElementById('profiles');
                    if (profilesTbody) {
                        profilesTbody.innerHTML = packagesList.map(p => `
                            <tr>
                                <td>${p.price || ''}</td>
                                <td>${p.time || 'مفتوح'}</td>
                                <td>${p.size || p.transfer || ''}</td>
                                <td>${p.vl || p.validity || ''}</td>
                            </tr>
                        `).join('');
                    }
                }

                // 7. Sync Sales Points list if provided in siteConfig
                const salesList = (Array.isArray(config.salesPoints) && config.salesPoints.length > 0) ? config.salesPoints :
                                  (Array.isArray(config['sell-points']) && config['sell-points'].length > 0) ? config['sell-points'] : null;
                if (salesList) {
                    const salesTbody = document.getElementById('sell-points');
                    if (salesTbody) {
                        salesTbody.innerHTML = salesList.map(sp => `
                            <tr>
                                <td>${typeof sp === 'object' ? (sp.name || '') : sp}</td>
                            </tr>
                        `).join('');
                    }
                }

                // 9. Sync Security & Blocker Config (hotBlocker / hotCookie)
                if (typeof window.hotspotConfig !== 'object' || window.hotspotConfig === null) {
                    window.hotspotConfig = {};
                }
                window.hotspotConfig["enable-hot-blocker"] = (config["enable-hot-blocker"] !== undefined) ? parseInt(config["enable-hot-blocker"]) : 1;
                if (config["try-count"] !== undefined) window.hotspotConfig["try-count"] = parseInt(config["try-count"]) || 5;
                if (config["warn-when"] !== undefined) window.hotspotConfig["warn-when"] = parseInt(config["warn-when"]) || 3;
                if (config["block-time"] !== undefined) window.hotspotConfig["block-time"] = parseInt(config["block-time"]) || 5;
                if (config["warn-message"] !== undefined) window.hotspotConfig["warn-message"] = config["warn-message"];
                if (config.enableHotCookie === false) {
                    var rememberContainer = document.querySelector('[enable-hot-cookie]');
                    if (rememberContainer) rememberContainer.style.display = 'none';
                    var quickPrev = document.getElementById('quickPreviousCardBtn');
                    if (quickPrev) quickPrev.style.display = 'none';
                } else {
                    var quickPrev = document.getElementById('quickPreviousCardBtn');
                    if (quickPrev) quickPrev.style.display = '';
                }

                // 10. Sync Updates Blocker Strip Visibility & Logic with window.siteConfig (updatesBlockerV & enable-updates-blocker)
                const isUpdatesEnabled = config.updatesBlockerV === true || (config.updatesBlockerV !== false && config["enable-updates-blocker"] !== 0 && config["enable-updates-blocker"] !== false);
                const loginUpdatesCard = document.getElementById('updatesLoginCard');
                const statusUpdatesCard = document.getElementById('statusUpdatesCard');
                const allUpdatesStrips = document.querySelectorAll('#updatesLoginCard, #statusUpdatesCard, .updates-toggle-card, .status-updates-card, [data-updates-blocker]');

                if (isUpdatesEnabled) {
                    if (loginUpdatesCard) loginUpdatesCard.style.setProperty('display', 'block', 'important');
                    if (statusUpdatesCard) statusUpdatesCard.style.setProperty('display', 'flex', 'important');
                    allUpdatesStrips.forEach(s => {
                        if (s !== loginUpdatesCard && s !== statusUpdatesCard) {
                            s.style.setProperty('display', 'flex', 'important');
                        }
                    });
                } else {
                    allUpdatesStrips.forEach(s => {
                        s.style.setProperty('display', 'none', 'important');
                    });
                    const chUp = document.getElementById('chupdate');
                    const stChUp = document.getElementById('statusChupdate');
                    if (chUp) chUp.checked = false;
                    if (stChUp) stChUp.checked = false;
                    const upTxt = document.getElementById('updateStatusText');
                    const stUpTxt = document.getElementById('statusUpdateStatusText');
                    if (upTxt) { upTxt.textContent = 'متوقف'; upTxt.classList.remove('active'); }
                    if (stUpTxt) { stUpTxt.textContent = 'متوقف'; stUpTxt.classList.remove('active'); }
                }

                if (typeof checkIsBlocked === 'function') {
                    checkIsBlocked();
                }
            }

            syncAllSiteConfigs();
            setTimeout(syncAllSiteConfigs, 400);
            setTimeout(syncAllSiteConfigs, 1500);



            // 7. BOTTOM NAV - TAB SWITCHING & HOME BUTTON
            const navHome = document.getElementById('navHome');
            if (navHome) {
                navHome.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
                    navHome.classList.add('active');
                    closeAppModal();
                });
            }

            document.querySelectorAll('.nav-item-btn[parent-id]').forEach(navBtn => {
                navBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const pid = this.getAttribute('parent-id');
                    if (pid) {
                        openAppModal(pid);
                    }
                });
            });

            // 4. DIRECT FILL PREVIOUS CARD BUTTON (دخول بكرت سابق)
            const prevCardBtn = document.getElementById('quickPreviousCardBtn');
            let prevCardCycleIndex = 0;

            if (prevCardBtn) {
                prevCardBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Collect all previous cards stored in cookies, localStorage, or memory
                    let cardsList = [];

                    // From hotCookie stored values
                    if (typeof getStoredValuesFromCookie === 'function') {
                        const rawStored = getStoredValuesFromCookie();
                        if (Array.isArray(rawStored)) {
                            // Reverse to get most recent first
                            rawStored.slice().reverse().forEach(item => {
                                if (item) {
                                    const parts = item.toString().split(',');
                                    const cardNum = parts[0] ? parts[0].trim() : '';
                                    if (cardNum && !cardsList.includes(cardNum)) {
                                        cardsList.push(cardNum);
                                    }
                                }
                            });
                        }
                    }

                    // From single cookie username
                    if (typeof getLoginCardCookie === 'function') {
                        const loginCookie = getLoginCardCookie();
                        if (loginCookie && loginCookie.username) {
                            const u = loginCookie.username.trim();
                            if (u && !cardsList.includes(u)) {
                                cardsList.push(u);
                            }
                        }
                    }

                    // From localStorage backups
                    try {
                        const rawLocal = localStorage.getItem('storedValues');
                        if (rawLocal) {
                            const parsed = JSON.parse(rawLocal);
                            if (Array.isArray(parsed)) {
                                parsed.slice().reverse().forEach(item => {
                                    const card = item.toString().split(',')[0].trim();
                                    if (card && !cardsList.includes(card)) {
                                        cardsList.push(card);
                                    }
                                });
                            }
                        }
                        const singleLocal = localStorage.getItem('last_user_card') || localStorage.getItem('username');
                        if (singleLocal && !cardsList.includes(singleLocal.trim())) {
                            cardsList.push(singleLocal.trim());
                        }
                    } catch (err) { }

                    const usernameInput = document.querySelector('input[name="username"]') || document.querySelector('input[username-field]');

                    if (cardsList.length > 0) {
                        const currentInputVal = usernameInput ? usernameInput.value.trim() : '';
                        let targetIndex = prevCardCycleIndex % cardsList.length;
                        if (cardsList.length > 1 && cardsList[targetIndex] === currentInputVal) {
                            prevCardCycleIndex++;
                            targetIndex = prevCardCycleIndex % cardsList.length;
                        }
                        const selectedCard = cardsList[targetIndex];
                        prevCardCycleIndex = (targetIndex + 1) % cardsList.length;

                        if (usernameInput) {
                            usernameInput.value = selectedCard;
                            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                            usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        if (typeof window.applySpeedLockForCard === 'function') {
                            window.applySpeedLockForCard(selectedCard);
                        }

                        // Success button feedback
                        prevCardBtn.classList.add('flash-success');
                        setTimeout(() => {
                            prevCardBtn.classList.remove('flash-success');
                        }, 500);

                        if (navigator.vibrate) {
                            try { navigator.vibrate(50); } catch (err) { }
                        }
                    } else {
                        const errEl = document.getElementById('error');
                        if (errEl) {
                            errEl.innerText = 'لا يوجد كرت سابق محفوظ في هذا المتصفح';
                            if (typeof showErrorPopup === 'function') {
                                showErrorPopup();
                            }
                        }
                    }
                });
            }

            // =========================================================================
            // 5. SPEED SELECTOR - FIXED SPEED LOGIC FOR 777 AND SPECIAL CARDS
            // (تعتيم أزرار السرعة ومنع النقر/التحريك لكروت 777 وإخفاء خيار السرعة في شاشة الحالة)
            // =========================================================================
            window.checkCardHasFixedSpeed = function (cardNumber) {
                if (!cardNumber) return false;
                const str = String(cardNumber).trim();
                if (!str) return false;
                if (str.startsWith('777')) return true;
                const cfg = window.siteConfig || {};
                const prefixes = Array.isArray(cfg.fixedSpeedCardPrefixes) ? cfg.fixedSpeedCardPrefixes : ['777'];
                for (let i = 0; i < prefixes.length; i++) {
                    const p = String(prefixes[i]).trim();
                    if (p && str.startsWith(p)) return true;
                }
                return false;
            };

            window.applySpeedLockForCard = function (cardNumber) {
                const popdownContainer = document.getElementById('speedSelectionPopdown');
                const speedCard = document.querySelector('.speed-selection-card');
                const speedOuterHeader = document.querySelector('.speed-selection-outer-header');
                const speedPillsRow = document.getElementById('speedPillsRow');
                const speedSel = document.getElementById('speed');
                const speedDisp = document.getElementById('selectedSpeedDisplay');
                const pills = document.querySelectorAll('#speedPillsRow .speed-pill-btn');

                // حاوية السرعات في شاشة تسجيل الدخول تكون ظاهرة دائماً
                if (popdownContainer) {
                    popdownContainer.style.setProperty('display', 'block', 'important');
                    popdownContainer.style.setProperty('visibility', 'visible', 'important');
                    popdownContainer.classList.add('speed-popdown-visible');
                    popdownContainer.classList.remove('speed-locked-fixed');
                }
                if (speedCard) speedCard.classList.remove('speed-locked-fixed');
                if (speedOuterHeader) speedOuterHeader.classList.remove('speed-locked-fixed');

                const isFixed = window.checkCardHasFixedSpeed(cardNumber);

                if (isFixed) {
                    // تصبح أزرار السرعة معتمة تماماً ومقفلة عن النقر أو التحريك
                    if (speedPillsRow) speedPillsRow.classList.add('speed-locked-fixed');
                    // تنطفئ الشارة تماماً ولا تعرض أي نص
                    if (speedDisp) {
                        speedDisp.classList.add('speed-badge-dimmed-off');
                        speedDisp.style.setProperty('display', 'none', 'important');
                        speedDisp.innerHTML = '';
                    }
                    if (speedSel) speedSel.value = '';
                } else {
                    // إرجاع أزرار السرعة والشارة إلى حالتها الطبيعية المضيئة والتفاعلية للكروت العادية
                    if (speedPillsRow) speedPillsRow.classList.remove('speed-locked-fixed');
                    if (speedDisp) {
                        speedDisp.classList.remove('speed-badge-dimmed-off');
                        speedDisp.style.removeProperty('display');
                    }

                    const activePill = document.querySelector('#speedPillsRow .speed-pill-btn.active');
                    if (!activePill && pills.length > 0) {
                        const speeds = (window.siteConfig && window.siteConfig.speedOptions) || [];
                        const def = speeds.find(s => s.selected || s.isDefault) || speeds[0];
                        if (def) {
                            const matchPill = document.querySelector(`#speedPillsRow .speed-pill-btn[data-speed="${def.value}"]`) || pills[0];
                            if (matchPill) matchPill.classList.add('active');
                            if (speedSel) speedSel.value = def.value;
                            if (speedDisp) {
                                speedDisp.innerHTML = '<svg viewBox="0 0 24 24" class="thunder-mini-spark" aria-hidden="true"><path d="M11 2L5 13h5l-1 7 8-9h-5l1-7z"/></svg><span>' + (def.label || def.name) + '</span>';
                            }
                        }
                    } else if (activePill) {
                        const val = activePill.getAttribute('data-speed');
                        const title = activePill.getAttribute('data-speed-title');
                        if (speedSel) speedSel.value = val;
                        if (speedDisp) {
                            speedDisp.innerHTML = '<svg viewBox="0 0 24 24" class="thunder-mini-spark" aria-hidden="true"><path d="M11 2L5 13h5l-1 7 8-9h-5l1-7z"/></svg><span>' + (title || 'سرعة افتراضية') + '</span>';
                        }
                    }
                }
            };

            window.applyStatusScreenFixedSpeedLock = function (userStr) {
                var statusSpeedContainer = document.getElementById('statusSpeedChangeContainer') || document.querySelector('#status .statusdiv');
                var statusTrigger = document.getElementById('statusSpeedTrigger');

                var currentCard = (userStr || '').trim();
                if (!currentCard) {
                    try {
                        currentCard = localStorage.getItem('last_user_card') ||
                                      localStorage.getItem('hotspot_username') ||
                                      localStorage.getItem('hot_last_username') || '';
                    } catch(e) {}
                }
                if (!currentCard) {
                    try {
                        var m = document.cookie.match(/(?:^|;\s*)username=([^;]+)/);
                        if (m && m[1]) currentCard = decodeURIComponent(m[1]).trim();
                    } catch(e) {}
                }
                if (!currentCard) {
                    var uEl = document.querySelector('input[username-field], input[name="username"]');
                    if (uEl && uEl.value) currentCard = uEl.value.trim();
                }
                if (!currentCard) {
                    var statusUserSpan = document.getElementById('username') || document.getElementById('user') || document.querySelector('#status [data-username]');
                    if (statusUserSpan && statusUserSpan.textContent) currentCard = statusUserSpan.textContent.trim();
                }

                var isFixed = window.checkCardHasFixedSpeed(currentCard);

                if (isFixed) {
                    try {
                        document.documentElement.classList.add('is-fixed-speed-user');
                        document.body.classList.add('is-fixed-speed-user');
                    } catch(e) {}
                    if (statusSpeedContainer) {
                        statusSpeedContainer.style.setProperty('display', 'none', 'important');
                        statusSpeedContainer.classList.add('speed-hidden-for-fixed');
                    }
                    if (statusTrigger) {
                        statusTrigger.style.setProperty('display', 'none', 'important');
                        statusTrigger.setAttribute('disabled', 'disabled');
                        statusTrigger.style.pointerEvents = 'none';
                    }
                } else {
                    try {
                        document.documentElement.classList.remove('is-fixed-speed-user');
                        document.body.classList.remove('is-fixed-speed-user');
                    } catch(e) {}
                    if (statusSpeedContainer) {
                        statusSpeedContainer.style.removeProperty('display');
                        statusSpeedContainer.classList.remove('speed-hidden-for-fixed');
                    }
                    if (statusTrigger) {
                        statusTrigger.style.removeProperty('display');
                        statusTrigger.removeAttribute('disabled');
                        statusTrigger.style.pointerEvents = 'auto';
                    }
                }
            };

            // Save entered username to stored history and localStorage & Live Speed Lock
            const usernameInputField = document.querySelector('input[name="username"]') || document.querySelector('input[username-field]');
            if (usernameInputField) {
                const handleCardInput = function () {
                    const val = usernameInputField.value ? usernameInputField.value.trim() : '';
                    window.applySpeedLockForCard(val);
                    window.applyStatusScreenFixedSpeedLock(val);
                };

                usernameInputField.addEventListener('input', handleCardInput);
                usernameInputField.addEventListener('keyup', handleCardInput);
                usernameInputField.addEventListener('change', handleCardInput);
                usernameInputField.addEventListener('paste', function () {
                    setTimeout(handleCardInput, 50);
                });

                // Check initial value
                handleCardInput();

                const persistCard = function () {
                    const val = usernameInputField.value ? usernameInputField.value.trim() : '';
                    if (val.length > 1) {
                        try {
                            localStorage.setItem('last_user_card', val);
                            if (typeof saveValueToCookie === 'function') {
                                saveValueToCookie(val, '');
                            }
                        } catch (err) { }
                    }
                    window.applyStatusScreenFixedSpeedLock(val);
                };
                usernameInputField.addEventListener('blur', persistCard);
            }

            // Form submission handling
            if (document.login && document.login.addEventListener) {
                document.login.addEventListener('submit', function () {
                    const uInput = (document.login && document.login.querySelector) ? document.login.querySelector('input[username-field]') : document.querySelector('input[username-field], input[name="username"]');
                    if (uInput && uInput.value && uInput.value.trim().length > 0) {
                        const val = uInput.value.trim();
                        try {
                            localStorage.setItem('last_user_card', val);
                            if (typeof saveValueToCookie === 'function') {
                                saveValueToCookie(val, '');
                            }
                        } catch (err) { }
                    }
                });
            }

            // Observe status screen user change
            const userElement = document.getElementById('user');
            if (userElement) {
                const userObserver = new MutationObserver(function () {
                    window.applyStatusScreenFixedSpeedLock();
                });
                userObserver.observe(userElement, { childList: true, characterData: true, subtree: true });
                window.applyStatusScreenFixedSpeedLock();
            }
            window.addEventListener('load', function () {
                window.applyStatusScreenFixedSpeedLock();
            });

            // 6. UNIVERSAL WHATSAPP INTENT DISPATCHER (WHATSAPP & WHATSAPP BUSINESS)
            const waButtons = document.querySelectorAll('.support-btn-whatsapp');

            waButtons.forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();

                    const config = window.siteConfig || {};
                    const netName = config.siteName || 'BH-NET';
                    const suppPhone = config.supportPhone || '770807056';
                    const waPhone = config.whatsappPhone || '967' + suppPhone.replace(/^0+/, '');
                    let rawWaMsg = config.whatsappMsg || 'مرحبا خدمة عملاء شبكة {network-name} اللاسلكية';
                    const formattedWaMsg = rawWaMsg.replace(/\{network-name\}/g, netName);
                    const encodedWaMsg = encodeURIComponent(formattedWaMsg);

                    const currentScheme = btn.getAttribute('data-wa-scheme') || `whatsapp://send?phone=${waPhone}&text=${encodedWaMsg}`;
                    const currentWeb = btn.getAttribute('data-wa-web') || `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodedWaMsg}`;

                    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    if (isMobile) {
                        // Trigger universal mobile URI scheme (Prompts Android "Complete action using" if both are installed)
                        const start = Date.now();
                        window.location.href = currentScheme;

                        // Fallback to web link if neither app is installed
                        setTimeout(function () {
                            const elapsed = Date.now() - start;
                            if (elapsed < 2000 && !document.hidden && !document.webkitHidden) {
                                window.location.href = currentWeb;
                            }
                        }, 1400);
                    } else {
                        // Desktop browser -> Open WhatsApp Web directly
                        window.open(currentWeb, '_blank', 'noopener,noreferrer');
                    }
                });
            });

            // 7. AUTO-HIDE TOAST ON POPUP
            const toastContainer = document.querySelector('.error-container');
            if (toastContainer) {
                const observer = new MutationObserver(() => {
                    if (toastContainer.classList.contains('active')) {
                        setTimeout(() => {
                            if (typeof hideErrorPopup === 'function') {
                                hideErrorPopup();
                            }
                        }, 4000);
                    }
                });
                observer.observe(toastContainer, { attributes: true, attributeFilter: ['class'] });
            }

            // 8. MOBILE KEYBOARD DETECTION: PREVENT BOTTOM BAR FROM RISING ABOVE KEYBOARD (TEXT INPUTS ONLY)
            const bNav = document.getElementById('bottomNav');
            let keyboardTimer = null;

            function isTextualKeyboardInput(el) {
                if (!el || !el.tagName) return false;
                const tag = el.tagName.toUpperCase();
                if (tag === 'TEXTAREA') return true;
                if (el.isContentEditable) return true;
                if (tag === 'INPUT') {
                    const type = (el.type || 'text').toLowerCase();
                    return ['text', 'password', 'number', 'tel', 'email', 'search', 'url'].includes(type);
                }
                return false;
            }

            function hideBottomNavOnKeyboard() {
                clearTimeout(keyboardTimer);
                document.body.classList.add('keyboard-open');
                if (bNav) {
                    bNav.classList.add('hidden-keyboard');
                }
            }

            function restoreBottomNavOnBlur() {
                clearTimeout(keyboardTimer);
                keyboardTimer = setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (!isTextualKeyboardInput(activeElement)) {
                        document.body.classList.remove('keyboard-open');
                        if (bNav) {
                            bNav.classList.remove('hidden-keyboard');
                        }
                    }
                }, 100);
            }

            // Listen to focus / blur globally only for text-entry fields (avoids hiding on checkboxes/toggles/switches)
            document.addEventListener('focusin', function (e) {
                if (isTextualKeyboardInput(e.target)) {
                    hideBottomNavOnKeyboard();
                }
            });

            document.addEventListener('focusout', function (e) {
                if (isTextualKeyboardInput(e.target)) {
                    restoreBottomNavOnBlur();
                }
            });

            // Handle visual viewport shrink (Android & iOS virtual keyboard open/close)
            if (window.visualViewport) {
                const originalVpHeight = window.visualViewport.height;
                window.visualViewport.addEventListener('resize', function () {
                    const currentHeight = window.visualViewport.height;
                    // If viewport height drops significantly AND active element is a text input, virtual keyboard is active
                    if (isTextualKeyboardInput(document.activeElement) && (currentHeight < originalVpHeight - 120 || currentHeight < window.innerHeight * 0.78)) {
                        hideBottomNavOnKeyboard();
                    } else if (!isTextualKeyboardInput(document.activeElement)) {
                        restoreBottomNavOnBlur();
                    }
                });
            }
            // 9. AUTOMATIC SCROLL-TO-TOP ON PAGE TRANSITIONS & SUCCESSFUL LOGIN
            function resetWindowScrollToTop() {
                try {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                } catch (e) {
                    window.scrollTo(0, 0);
                }
                if (document.documentElement) document.documentElement.scrollTop = 0;
                if (document.body) document.body.scrollTop = 0;
                if (document.scrollingElement) document.scrollingElement.scrollTop = 0;

                const scrollNodes = document.querySelectorAll('.app, .app-container, .main, #container, .container, body, html');
                scrollNodes.forEach(el => {
                    if (el && el.scrollTop > 0) el.scrollTop = 0;
                });
            }
            window.resetWindowScrollToTop = resetWindowScrollToTop;

            // Ensure window starts at the very top on load and prevent unwanted browser scroll restoration
            if ('scrollRestoration' in history) {
                try { history.scrollRestoration = 'manual'; } catch (e) {}
            }
            resetWindowScrollToTop();
            setTimeout(resetWindowScrollToTop, 50);
            setTimeout(resetWindowScrollToTop, 200);
            setTimeout(resetWindowScrollToTop, 450);

            // Watch status section for activation
            const statusSection = document.getElementById('status');
            if (statusSection) {
                const statusObserver = new MutationObserver(mutations => {
                    mutations.forEach(m => {
                        if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'style')) {
                            if (statusSection.classList.contains('active') || statusSection.style.display === 'block') {
                                resetWindowScrollToTop();
                                setTimeout(resetWindowScrollToTop, 50);
                                setTimeout(resetWindowScrollToTop, 200);
                                setTimeout(resetWindowScrollToTop, 400);
                            }
                        }
                    });
                });
                statusObserver.observe(statusSection, { attributes: true, attributeFilter: ['class', 'style'] });
            }

            // Hook on login form submission & keyboard "Go" / "Enter" key
            if (document.login && document.login.querySelector) {
                const usernameInput = document.login.querySelector("input[name='username'], input[username-field]");
                if (usernameInput) {
                    usernameInput.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter' || e.keyCode === 13) {
                            e.preventDefault();
                            const mainBtn = document.getElementById('mainLoginBtn') || document.querySelector('.login-submit');
                            if (mainBtn) {
                                mainBtn.click();
                            } else if (typeof onLoginSubmitted === 'function') {
                                onLoginSubmitted();
                            }
                        }
                    });
                }

                if (document.login.addEventListener) {
                    document.login.addEventListener('submit', function (e) {
                        e.preventDefault();
                        const mainBtn = document.getElementById('mainLoginBtn') || document.querySelector('.login-submit');
                        if (mainBtn) {
                            mainBtn.click();
                        } else if (typeof onLoginSubmitted === 'function') {
                            onLoginSubmitted();
                        }
                        setTimeout(resetWindowScrollToTop, 100);
                        setTimeout(resetWindowScrollToTop, 350);
                    });
                }
            }

            // Reset on page show or hashchange
            window.addEventListener('pageshow', resetWindowScrollToTop);
            window.addEventListener('hashchange', resetWindowScrollToTop);
        });

        // Friday Greeting Check
        var e, m = new Date().toDateString();
        if (m.includes('Fri')) {
            e = document.getElementById('error');
            if (e) {
                e.innerText = "جمعة مباركة";
                if (typeof showErrorPopup === 'function') {
                    showErrorPopup();
                }
            }
        }

        // =========================================================================
        // AUTOMATIC DYNAMIC MARQUEE SPEED & EXACT BOUNDARIES ENGINE (FLICKER-FREE)
        // =========================================================================
        (function initAutoDynamicMarquee() {
            let lastAppliedKey = '';
            let isCalculating = false;

            function setupMarquee() {
                if (isCalculating) return;
                const track = document.querySelector('.ticker-content-track');
                const marquee = document.querySelector('.marquee');
                if (!track || !marquee) return;

                const text = (marquee.textContent || marquee.innerText || '').trim();
                if (!text || text.includes('{{news-line}}')) return;

                isCalculating = true;

                // Measure track and text width without resetting animation
                const trackWidth = track.clientWidth || track.offsetWidth || 380;
                const textWidth = marquee.scrollWidth || marquee.offsetWidth || 1000;

                // Exact pixel coordinates:
                // Start: Right edge aligns with track left boundary (first letter enters immediately)
                const startX = -(trackWidth + 6);
                // End: Left edge fully clears track right boundary (last letter exits completely)
                const endX = textWidth + 16;
                const totalDistance = endX - startX;

                // Constant readable velocity (52px per second regardless of text length)
                const PIXELS_PER_SECOND = 52;
                const duration = Math.max(6, (totalDistance / PIXELS_PER_SECOND)).toFixed(2);

                const cacheKey = `${startX}_${endX}_${duration}_${text.length}`;
                if (lastAppliedKey === cacheKey) {
                    isCalculating = false;
                    return; // No layout change -> Do NOT disturb running animation
                }

                lastAppliedKey = cacheKey;

                let dynamicStyle = document.getElementById('dynamic-marquee-engine-style');
                if (!dynamicStyle) {
                    dynamicStyle = document.createElement('style');
                    dynamicStyle.id = 'dynamic-marquee-engine-style';
                    document.head.appendChild(dynamicStyle);
                }

                dynamicStyle.textContent = `
                    @keyframes marqueeDynamic {
                        0% { transform: translate3d(${startX}px, 0, 0); }
                        100% { transform: translate3d(${endX}px, 0, 0); }
                    }
                    .marquee {
                        animation: marqueeDynamic ${duration}s linear infinite !important;
                    }
                `;

                isCalculating = false;
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setupMarquee);
            } else {
                setupMarquee();
            }

            window.addEventListener('load', setupMarquee, { passive: true });

            let resizeDebounce = null;
            window.addEventListener('resize', function () {
                clearTimeout(resizeDebounce);
                resizeDebounce = setTimeout(setupMarquee, 150);
            }, { passive: true });

            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(setupMarquee);
            }

            const marqueeEl = document.querySelector('.marquee');
            if (marqueeEl) {
                let mutationDebounce = null;
                const observer = new MutationObserver(function () {
                    clearTimeout(mutationDebounce);
                    mutationDebounce = setTimeout(setupMarquee, 60);
                });
                observer.observe(marqueeEl, { childList: true, characterData: true, subtree: true });
            }
        })();
;
(function() {
            function parseBytesToNumber(str) {
                if (!str || typeof str !== 'string') return 0;
                var s = str.trim();
                var match = s.match(/([0-9.]+)\s*(جيجابايت|ميجابايت|كيلوبايت|بايت|gb|mb|kb|b)/i);
                if (!match) {
                    var raw = parseFloat(s);
                    return isNaN(raw) ? 0 : raw;
                }
                var val = parseFloat(match[1]);
                var unit = match[2].toLowerCase();
                if (unit.indexOf('جيجا') !== -1 || unit === 'gb') return val * 1024 * 1024 * 1024;
                if (unit.indexOf('ميجا') !== -1 || unit === 'mb') return val * 1024 * 1024;
                if (unit.indexOf('كيلو') !== -1 || unit === 'kb') return val * 1024;
                return val;
            }

            function updateGaugeAndMeters() {
                var remainEl = document.getElementById('remain_bytes_total');
                var bytesOutEl = document.getElementById('bytes_out');
                var bytesInEl = document.getElementById('bytes_in');
                var arc = document.getElementById('gaugeProgressArc');
                var statusText = document.getElementById('gaugeStatusText');
                var barOut = document.getElementById('trafficBarOut');
                var barIn = document.getElementById('trafficBarIn');

                if (!remainEl || !arc) return;

                var remainText = (remainEl.textContent || remainEl.innerText || '').trim();
                var isUnlimited = !remainText || remainText === 'مفتوح' || remainText === '-' || remainText.indexOf('غير محدود') !== -1;

                var maxDash = 235.6;

                if (isUnlimited) {
                    arc.style.strokeDasharray = maxDash;
                    arc.style.strokeDashoffset = '0';
                    if (statusText) statusText.textContent = 'رصيد غير محدود ∞';
                } else {
                    var remainNum = parseBytesToNumber(remainText);
                    var outNum = bytesOutEl ? parseBytesToNumber(bytesOutEl.textContent || bytesOutEl.innerText) : 0;
                    var totalEst = remainNum + outNum;
                    var ratio = totalEst > 0 ? (remainNum / totalEst) : 0.85;
                    ratio = Math.max(0.05, Math.min(1, ratio));
                    var offset = maxDash * (1 - ratio);
                    arc.style.strokeDasharray = maxDash;
                    arc.style.strokeDashoffset = String(offset.toFixed(1));
                    if (statusText) {
                        var percent = Math.round(ratio * 100);
                        statusText.textContent = 'المتبقي ' + percent + '% من الرصيد';
                    }
                }

                if (barOut && bytesOutEl) {
                    var outText = (bytesOutEl.textContent || bytesOutEl.innerText || '').trim();
                    if (outText && outText !== '-') {
                        barOut.style.width = '75%';
                    }
                }
                if (barIn && bytesInEl) {
                    var inText = (bytesInEl.textContent || bytesInEl.innerText || '').trim();
                    if (inText && inText !== '-') {
                        barIn.style.width = '55%';
                    }
                }
            }

            window.addEventListener('load', function() {
                updateGaugeAndMeters();
                var targetIds = ['remain_bytes_total', 'bytes_out', 'bytes_in'];
                targetIds.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && window.MutationObserver) {
                        var obs = new MutationObserver(function() {
                            updateGaugeAndMeters();
                        });
                        obs.observe(el, { childList: true, characterData: true, subtree: true });
                    }
                });
            });

            // نظام الإشعار العلوي المنبثق الأنيق
            window.showTopNotification = function(msg, type) {
                var toast = document.getElementById('globalTopToast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'globalTopToast';
                    toast.className = 'top-notification-toast';
                    document.body.appendChild(toast);
                }
                var iconSvg = '<svg class="toast-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                toast.innerHTML = iconSvg + '<span>' + msg + '</span>';
                toast.className = 'top-notification-toast show ' + (type || 'success');

                if (window._topToastTimer) clearTimeout(window._topToastTimer);
                window._topToastTimer = setTimeout(function() {
                    if (toast) toast.classList.remove('show');
                }, 3000);
            };
        })();