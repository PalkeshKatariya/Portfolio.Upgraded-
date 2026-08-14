// Prevent browser from restoring previous scroll position on refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════ CUSTOM CURSOR ═══════════════════════
    const cursor = document.getElementById('cursor');

    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let cursorX = 0, cursorY = 0;
        let targetX = 0, targetY = 0;
        const lerp = 0.15; // Smooth interpolation factor

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!cursor.classList.contains('visible')) {
                cursor.classList.add('visible');
            }
        }, { passive: true });

        // Hide cursor when mouse leaves viewport
        document.addEventListener('mouseleave', () => {
            cursor.classList.remove('visible');
        }, { passive: true });

        // Smooth cursor animation loop
        const animateCursor = () => {
            cursorX += (targetX - cursorX) * lerp;
            cursorY += (targetY - cursorY) * lerp;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        };
        requestAnimationFrame(animateCursor);

        // Hover detection on interactive elements
        const hoverTargets = 'a, button, input, select, textarea, .magnetic, .nav-pill, .service-item, .p-item, .back-to-top, .footer-cta-btn, .form-submit, .reel-play-btn, .services-tag';

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursor.classList.add('hover');
            }
        }, { passive: true });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursor.classList.remove('hover');
            }
        }, { passive: true });

        // Custom cursor effect for About (#tagline-text)
        const taglineTextNode = document.getElementById('tagline-text');
        if (taglineTextNode) {
            taglineTextNode.addEventListener('mouseenter', () => cursor.classList.add('about-hover'));
            taglineTextNode.addEventListener('mouseleave', () => cursor.classList.remove('about-hover'));
        }

        const reelWrap = document.querySelector('.reel-wrap');
        const reelVideo = document.querySelector('.reel-video');
        const cursorText = document.querySelector('.cursor-text');

        if (reelWrap && reelVideo && cursorText) {
            reelWrap.addEventListener('mouseenter', () => {
                cursor.classList.add('reel-hover');
                cursorText.innerText = reelVideo.muted ? "UNMUTE" : "MUTE";
            });
            reelWrap.addEventListener('mouseleave', () => {
                cursor.classList.remove('reel-hover');
                cursorText.innerText = "";
            });
            reelWrap.addEventListener('click', () => {
                reelVideo.muted = !reelVideo.muted;
                cursorText.innerText = reelVideo.muted ? "UNMUTE" : "MUTE";
            });
        }
    }

    // 1. Cinematic Premium Preloader
    const preloader = document.getElementById('premium-preloader');

    if (preloader) {
        if (sessionStorage.getItem('shutterTransition')) {
            preloader.style.display = 'none';
        } else {
            document.body.classList.add('no-scroll');

            const initPreloader = () => {
                if (typeof gsap === 'undefined') {
                    preloader.style.display = 'none';
                    document.body.classList.remove('no-scroll');
                    return;
                }

                const tl = gsap.timeline();

                const outline = preloader.querySelector('.preloader-text-outline');
                const maskRect = preloader.querySelector('.fill-clip-rect');

                // 500px dash is enough to cover the stroke length of a single character at 100px font size
                gsap.set(outline, { strokeDasharray: 500, strokeDashoffset: 500, opacity: 1 });

                // Step 1: Trace the outline of the logo smoothly
                tl.to(outline, {
                    strokeDashoffset: 0,
                    duration: 2.0,
                    ease: 'power2.inOut'
                });

                // Step 2: Hold for 200ms, then liquid fill from left to right
                tl.to(maskRect, {
                    attr: { width: 1200 },
                    duration: 1.0,
                    ease: 'power3.inOut'
                }, "+=0.2"); // Hold for 200ms before fill

                // Step 3: Outline subtly disappears to leave the solid fill perfectly clean
                tl.to(outline, {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                }, "-=0.2");

                // Step 4: Preloader exits (Solid plane shutter effect: container slides up with logo)
                tl.to(preloader, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power4.inOut',
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.classList.remove('no-scroll');
                    }
                }, "+=0.5"); // Final hold 0.5s before sliding up
            };

            if (document.readyState === 'complete') {
                setTimeout(initPreloader, 100);
            } else {
                window.addEventListener('load', initPreloader);
            }
        }
    }

    // 1b. Shutter Transition for Navigation Links
    const shutter = document.getElementById('shutter');
    const shutterStrips = shutter ? shutter.querySelectorAll('.shutter-strip') : [];

    if (shutter && shutterStrips.length > 0) {
        // Initially hide shutter (it sits at -100% above the screen)
        gsap.set(shutterStrips, { yPercent: -100 });
        shutter.style.display = 'none';

        // Check if we just arrived via shutter transition
        if (sessionStorage.getItem('shutterTransition')) {
            sessionStorage.removeItem('shutterTransition');
            shutter.style.display = 'flex';
            gsap.set(shutterStrips, { yPercent: 0 }); // start closed

            // Remove CSS class so GSAP can override transforms
            document.documentElement.classList.remove('shutter-loading');

            const transitionTl = gsap.timeline();
            transitionTl.to(shutterStrips, {
                yPercent: 100,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power4.inOut',
                delay: 0.3,
                onComplete: () => {
                    shutter.style.display = 'none';
                    gsap.set(shutterStrips, { yPercent: -100 });
                }
            });
        }

        const navLinks = document.querySelectorAll('a[href^="#"], a[href="work.html"], a.pjax-back, a[href^="index.html"]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                // If it's a same-page anchor
                if (href.startsWith('#')) {
                    const targetSection = document.querySelector(href);
                    if (!targetSection) return;

                    e.preventDefault();
                    shutter.style.display = 'flex';

                    const transitionTl = gsap.timeline();

                    // 1. Close shutter
                    transitionTl.fromTo(shutterStrips,
                        { yPercent: -100 },
                        {
                            yPercent: 0,
                            duration: 0.5,
                            stagger: 0.05,
                            ease: 'power4.inOut',
                            onComplete: () => {
                                document.documentElement.style.scrollBehavior = 'auto';
                                const headerOffset = 0;
                                const elementPosition = targetSection.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                                window.scrollTo({ top: offsetPosition, behavior: "auto" });
                                document.documentElement.style.scrollBehavior = '';
                            }
                        }
                    );

                    // 2. Open shutter
                    transitionTl.to(shutterStrips, {
                        yPercent: 100,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: 'power4.inOut',
                        onComplete: () => {
                            shutter.style.display = 'none';
                            gsap.set(shutterStrips, { yPercent: -100 });
                        }
                    }, "+=0.1");
                }
                // If it's a cross-page link
                else {
                    const currentPath = window.location.pathname.split('/').pop();
                    const targetPath = href.split('#')[0];

                    // Don't transition if we're already on that page
                    if (currentPath === targetPath || (currentPath === '' && targetPath === 'index.html')) {
                        return;
                    }

                    e.preventDefault();
                    shutter.style.display = 'flex';

                    const transitionTl = gsap.timeline();

                    // Close shutter only, then navigate
                    transitionTl.fromTo(shutterStrips,
                        { yPercent: -100 },
                        {
                            yPercent: 0,
                            duration: 0.5,
                            stagger: 0.05,
                            ease: 'power4.inOut',
                            onComplete: () => {
                                sessionStorage.setItem('shutterTransition', 'true');
                                window.location.href = href;
                            }
                        }
                    );
                }
            });
        });
    }

    // 1b. Showreel Scroll Scale-Up (Scroll-Driven)
    const reelWrap = document.querySelector('.reel-wrap');
    if (reelWrap) {
        let ticking = false;

        const updateReelScale = () => {
            const rect = reelWrap.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Start scaling when the top of the reel enters the viewport
            // Fully scaled (1.0) when the center of the reel is near the center of the viewport
            // Let's map rect.top from windowHeight (bottom of screen) to windowHeight * 0.3 (upper part)
            let progress = 1 - (rect.top - windowHeight * 0.3) / (windowHeight * 0.7);

            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));

            // Easing for smoother feel (ease-out cubic)
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);

            // Interpolate scale from 0.72 (CSS default) to 1.0
            const minScale = 0.72;
            const currentScale = minScale + (1 - minScale) * easeOutProgress;

            reelWrap.style.transform = `scale(${currentScale})`;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateReelScale);
                ticking = true;
            }
        }, { passive: true });

        // Initial setup
        updateReelScale();
    }

    // 2. Navigation State Transitions
    const mainNav = document.getElementById('main-nav');
    let ticking = false;

    const handleScroll = () => {
        const threshold = window.innerHeight * 0.8;
        if (window.scrollY > threshold) {
            mainNav?.classList.add('scrolled');
        } else {
            mainNav?.classList.remove('scrolled');
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    handleScroll();

    // 3. BeNorth-Style Hero 3D Physics, Sticker Parallax & Dragging
    const hero = document.getElementById('hero');
    const stickers = document.querySelectorAll('.hsticker');

    if (hero && stickers.length > 0) {
        let mouseX = 0;
        let mouseY = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;

        // Track mouse / cursor relative to center of hero stage
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            mouseX = (e.clientX - rect.left - centerX) / centerX;
            mouseY = (e.clientY - rect.top - centerY) / centerY;
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            mouseX = 0;
            mouseY = 0;
        }, { passive: true });

        // Store drag offsets and position per sticker
        const stickerStates = Array.from(stickers).map(sticker => ({
            element: sticker,
            dragX: 0,
            dragY: 0,
            isDragging: false,
            startX: 0,
            startY: 0
        }));

        // Attach Pointer Drag & Drop Listeners
        stickerStates.forEach(state => {
            const el = state.element;

            const onPointerDown = (e) => {
                // Prevent drag initiation on inner links unless clicking sticker body
                if (e.target.closest('a') && e.type === 'pointerdown') {
                    // Let link click function normally if not moving
                }

                state.isDragging = true;
                el.classList.add('is-dragging');

                state.startX = e.clientX - state.dragX;
                state.startY = e.clientY - state.dragY;

                // Capture pointer
                if (e.pointerId !== undefined) {
                    try { el.setPointerCapture(e.pointerId); } catch (_) { }
                }

                e.stopPropagation();
            };

            const onPointerMove = (e) => {
                if (!state.isDragging) return;
                state.dragX = e.clientX - state.startX;
                state.dragY = e.clientY - state.startY;
            };

            const onPointerUp = (e) => {
                if (!state.isDragging) return;
                state.isDragging = false;
                el.classList.remove('is-dragging');

                if (e.pointerId !== undefined) {
                    try { el.releasePointerCapture(e.pointerId); } catch (_) { }
                }
            };

            el.addEventListener('pointerdown', onPointerDown);
            el.addEventListener('pointermove', onPointerMove);
            el.addEventListener('pointerup', onPointerUp);
            el.addEventListener('pointercancel', onPointerUp);
        });

        // Continuous 60fps 3D Physics Animation Loop
        const updateStickers = (timestamp) => {
            // Lerp spring physics for smooth mouse lag
            currentMouseX += (mouseX - currentMouseX) * 0.06;
            currentMouseY += (mouseY - currentMouseY) * 0.06;

            const scrollY = window.scrollY;
            const time = (timestamp || performance.now()) * 0.001; // seconds

            stickerStates.forEach((state, index) => {
                const sticker = state.element;
                const speed = parseFloat(sticker.getAttribute('data-speed')) || 0.2;
                const baseRotateStr = sticker.style.getPropertyValue('--r') || '0deg';
                const baseRotate = parseFloat(baseRotateStr) || 0;

                // 1. Mouse 3D Translation & Spatial Rotational Tilt (BeNorth style)
                const moveX = currentMouseX * speed * 200;
                const moveY = currentMouseY * speed * 200;
                const tiltX = -currentMouseY * 14 * speed;
                const tiltY = currentMouseX * 16 * speed;
                const tiltZ = (currentMouseX * 8 + currentMouseY * 5) * speed;

                // 2. Scroll Parallax
                const scrollMoveY = scrollY * speed * 0.5;

                // 3. Subtle Continuous Idle Float (reduced wobble)
                const phase = index * 1.6;
                const idleX = Math.sin(time * 1.4 + phase) * (3 + index * 0.5);
                const idleY = Math.cos(time * 1.1 + phase) * (4 + index * 0.5);
                const idleRotZ = Math.sin(time * 1.6 + phase) * 2;

                // Final combined position
                const totalX = moveX + idleX + state.dragX;
                const totalY = moveY + scrollMoveY + idleY + state.dragY;
                const totalRotZ = baseRotate + idleRotZ + tiltZ;

                sticker.style.transform = `translate3d(${totalX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateZ(${totalRotZ.toFixed(2)}deg)`;
            });

            requestAnimationFrame(updateStickers);
        };

        requestAnimationFrame(updateStickers);
    }

    // 3b. Magnetic Element Physics (Nav Pills & CTAs)
    const magneticElements = document.querySelectorAll('.magnetic');
    if (magneticElements.length > 0) {
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const deltaX = (e.clientX - centerX) * 0.35;
                const deltaY = (e.clientY - centerY) * 0.35;

                el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate3d(0, 0, 0)';
                el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                setTimeout(() => {
                    el.style.transition = '';
                }, 400);
            });
        });
    }

    // 4. Scroll-Triggered Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // One-time animation
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 5. Tagline Particle Distortion Effect
    const taglineSection = document.getElementById('tagline');
    const taglineText = document.getElementById('tagline-text');
    const canvas = document.getElementById('tagline-canvas');

    if (taglineSection && taglineText && canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let particles = [];
        const dpr = window.devicePixelRatio || 1;
        let mouse = { x: -1000, y: -1000, radius: (window.innerWidth < 768 ? 70 : 90) * dpr };
        let animationFrameId;
        let isInitialized = false;

        const resizeCanvas = () => {
            const rect = taglineSection.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        };

        const initParticles = () => {
            particles = [];
            resizeCanvas();
            const rect = taglineSection.getBoundingClientRect();
            
            const originalHTML = taglineText.innerHTML;
            
            const splitIntoLetters = (node) => {
                const fragment = document.createDocumentFragment();
                Array.from(node.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        const chars = child.textContent.split('');
                        chars.forEach(char => {
                            if (char.trim() === '') {
                                fragment.appendChild(document.createTextNode(char));
                            } else {
                                const span = document.createElement('span');
                                span.className = 'canvas-char';
                                span.textContent = char;
                                fragment.appendChild(span);
                            }
                        });
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        const newElement = child.cloneNode(false);
                        newElement.appendChild(splitIntoLetters(child));
                        fragment.appendChild(newElement);
                    }
                });
                return fragment;
            };

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalHTML;
            const newContent = splitIntoLetters(tempDiv);
            taglineText.innerHTML = '';
            taglineText.appendChild(newContent);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);
            
            const chars = taglineText.querySelectorAll('.canvas-char');
            chars.forEach(span => {
                const charRect = span.getBoundingClientRect();
                const style = window.getComputedStyle(span);
                
                const x = charRect.left - rect.left;
                const y = charRect.top - rect.top;

                ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                ctx.fillStyle = style.color;
                ctx.textBaseline = 'top';
                
                // Fine-tune baseline alignment for a near-perfect match
                ctx.fillText(span.textContent, x, y + (parseFloat(style.fontSize) * 0.12)); 
            });

            ctx.restore();
            taglineText.innerHTML = originalHTML;
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const step = window.innerWidth < 768 ? 2 : 1;
            // On a 2x retina display, step=1 means creating particles for every physical screen pixel!
            // If it's too slow on retina screens, we could increase step, but since the physics loop 
            // is highly optimized, it should run smoothly.
            
            for (let y = 0; y < canvas.height; y += step) {
                for (let x = 0; x < canvas.width; x += step) {
                    const index = (y * canvas.width + x) * 4;
                    const alpha = data[index + 3];

                    if (alpha > 100) {
                        const r = data[index];
                        const g = data[index + 1];
                        const b = data[index + 2];

                        particles.push({
                            x: x,
                            y: y,
                            originX: x,
                            originY: y,
                            vx: 0,
                            vy: 0,
                            color: `rgb(${r},${g},${b})`,
                            size: step, 
                            ease: 0.05 + Math.random() * 0.08 
                        });
                    }
                }
            }

            isInitialized = true;
            animate();
        };

        const animate = () => {
            if (!isInitialized) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    
                    // Push away
                    p.vx -= forceDirectionX * force * 4;
                    p.vy -= forceDirectionY * force * 4;
                    
                    // Orbit slightly
                    p.vx += forceDirectionY * force * 1.5;
                    p.vy -= forceDirectionX * force * 1.5;
                }

                // Spring back only if displaced or moving
                if (p.vx !== 0 || p.vy !== 0 || p.x !== p.originX || p.y !== p.originY) {
                    p.vx += (p.originX - p.x) * p.ease;
                    p.vy += (p.originY - p.y) * p.ease;

                    // Friction
                    p.vx *= 0.82;
                    p.vy *= 0.82;

                    p.x += p.vx;
                    p.y += p.vy;

                    // Snap to exact origin if close enough to stop microscopic jitter and math
                    if (Math.abs(p.vx) < 0.05 && Math.abs(p.vy) < 0.05 && Math.abs(p.x - p.originX) < 0.5 && Math.abs(p.y - p.originY) < 0.5) {
                        p.x = p.originX;
                        p.y = p.originY;
                        p.vx = 0;
                        p.vy = 0;
                    }
                }

                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', () => {
            cancelAnimationFrame(animationFrameId);
            isInitialized = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clearTimeout(window.resizeTimer);
            mouse.radius = (window.innerWidth < 768 ? 70 : 90) * dpr;
            window.resizeTimer = setTimeout(initParticles, 300);
        });

        taglineSection.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * dpr;
            mouse.y = (e.clientY - rect.top) * dpr;
        });

        taglineSection.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        taglineSection.addEventListener('touchmove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.touches[0].clientX - rect.left) * dpr;
            mouse.y = (e.touches[0].clientY - rect.top) * dpr;
        }, { passive: true });
        
        taglineSection.addEventListener('touchend', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        const taglineObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Ensure fonts are loaded before initializing particles
                if (document.fonts) {
                    document.fonts.ready.then(() => {
                        if (!isInitialized) initParticles();
                    });
                } else {
                    if (!isInitialized) setTimeout(initParticles, 500);
                }
                taglineObserver.disconnect();
            }
        }, { threshold: 0.2 });
        taglineObserver.observe(taglineSection);
    }

    // 6. Services — Cursor Image Follow + Right Panel Word-Rise Animation
    const serviceItems = document.querySelectorAll('.service-item');
    const servicesImageBox = document.getElementById('services-image');
    const servicesPreviewImg = document.getElementById('services-preview-img');
    const sdpSubtitle = document.getElementById('sdp-subtitle');
    const sdpDesc = document.getElementById('sdp-desc');
    const sdpTags = document.getElementById('sdp-tags');
    const sdpContent = document.querySelector('.sdp-content');

    if (serviceItems.length && servicesImageBox && sdpDesc) {

        // ── Cursor-follow image logic ──
        let mouseX = 0, mouseY = 0;
        let imgX = 0, imgY = 0;
        let imgAnimFrame = null;
        const OFFSET_X = 32, OFFSET_Y = -80;

        const animateImg = () => {
            imgX += (mouseX - imgX) * 0.12;
            imgY += (mouseY - imgY) * 0.12;
            servicesImageBox.style.transform = `translate(${imgX + OFFSET_X}px, ${imgY + OFFSET_Y}px) scale(1) rotate(0deg)`;
            imgAnimFrame = requestAnimationFrame(animateImg);
        };

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        // ── Word-rise animation engine ──
        // Splits text into word <span>s and staggers their rise-up transition
        const riseWords = (containerEl, text, baseDelay = 0, wordDelay = 40) => {
            containerEl.innerHTML = '';
            const words = text.split(' ');
            words.forEach((word, i) => {
                const span = document.createElement('span');
                span.className = 'sdp-word';
                span.textContent = word;
                span.style.transitionDelay = `${baseDelay + i * wordDelay}ms`;
                // Add a regular space after each word (except last)
                if (i < words.length - 1) {
                    span.textContent = word + '\u00A0'; // non-breaking space keeps inline layout
                }
                containerEl.appendChild(span);
            });
            // Force reflow so initial state registers before we add .risen
            containerEl.offsetHeight; // eslint-disable-line
            containerEl.querySelectorAll('.sdp-word').forEach(w => w.classList.add('risen'));
        };

        let activeItem = null;
        const servicesSection = document.getElementById('services');
        const servicesListWrap = document.querySelector('.services-list-wrap');

        // ── Show service ──
        const showService = (item, isInitialLoad = false) => {
            if (item === activeItem) return;
            activeItem = item;

            const imgSrc = item.dataset.image || '';
            const subtitle = item.dataset.subtitle || '';
            const desc = item.dataset.desc || '';
            const tagList = (item.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);

            // Active state on left headings
            serviceItems.forEach(i => {
                i.classList.remove('active');
                i.setAttribute('aria-expanded', 'false');
            });
            item.classList.add('active');
            item.setAttribute('aria-expanded', 'true');

            // Show & follow cursor image (only on real hover, not initial load)
            if (!isInitialLoad) {
                if (imgSrc && servicesPreviewImg) {
                    if (servicesPreviewImg.getAttribute('src') !== imgSrc) {
                        servicesPreviewImg.src = imgSrc;
                        servicesPreviewImg.alt = (item.querySelector('h3')?.textContent || '') + ' preview';
                    }
                }
                servicesImageBox.classList.add('visible');
                if (!imgAnimFrame) animateImg();
            }

            sdpContent.classList.add('active');

            // ── Rise subtitle words (fast, short delay) ──
            riseWords(sdpSubtitle, subtitle, 0, 35);

            // ── Rise description words (after a tiny stagger head-start) ──
            riseWords(sdpDesc, desc, 80, 22);

            // ── Rise tags individually ──
            sdpTags.innerHTML = '';
            tagList.forEach((tag, i) => {
                const wrapper = document.createElement('span');
                wrapper.className = 'sdp-tag-item';
                wrapper.style.transitionDelay = `${220 + i * 60}ms`;

                const inner = document.createElement('span');
                inner.className = 'services-tag';
                inner.textContent = tag;
                wrapper.appendChild(inner);
                sdpTags.appendChild(wrapper);
            });
            // Force reflow then add risen
            sdpTags.offsetHeight; // eslint-disable-line
            sdpTags.querySelectorAll('.sdp-tag-item').forEach(t => t.classList.add('risen'));
        };

        // ── Hide cursor image only (when leaving heading list) ──
        const hideImage = () => {
            servicesImageBox.classList.remove('visible');
            cancelAnimationFrame(imgAnimFrame);
            imgAnimFrame = null;
        };

        // ── Full reset (when leaving the whole section) ──
        const resetToFirst = () => {
            hideImage();
            if (serviceItems[0]) {
                showService(serviceItems[0], true);
            }
        };

        // Desktop hover
        serviceItems.forEach(item => {
            item.addEventListener('mouseenter', () => showService(item));
            item.addEventListener('focus', () => showService(item));
        });

        // Cursor image hides the moment mouse leaves the heading list column
        if (servicesListWrap) {
            servicesListWrap.addEventListener('mouseleave', hideImage);
        }

        // Full text reset when mouse leaves the whole section
        if (servicesSection) {
            servicesSection.addEventListener('mouseleave', resetToFirst);
        }

        // Initialize the first item on load
        if (serviceItems.length > 0) {
            resetToFirst();
        }

        // Keyboard blur
        serviceItems.forEach(item => {
            item.addEventListener('blur', (e) => {
                if (!e.relatedTarget || !e.relatedTarget.closest('#services')) {
                    hideAll();
                }
            });
        });

        // Mobile tap toggle
        serviceItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.classList.contains('active')) {
                    hideAll();
                } else {
                    showService(item);
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.service-item')) {
                hideAll();
            }
        });
    }



    // 7. Infinite Drag Slider with Physics
    let infiniteSliderInitialized = false;
    let infiniteSliderRaf;

    window.initInfiniteSlider = () => {
        const projectsWrap = document.querySelector('.projects-pin-wrap');
        const track = document.getElementById('dynamic-projects-track');
        const dragCursor = document.getElementById('drag-cursor');
        const globalCursor = document.getElementById('cursor');

        if (!projectsWrap || !track) return;

        // Ensure no GSAP ScrollTrigger conflicts if re-initializing
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(st => {
                if (st.trigger === document.getElementById('projects')) {
                    st.kill();
                }
            });
        }

        if (infiniteSliderRaf) cancelAnimationFrame(infiniteSliderRaf);

        const images = track.querySelectorAll('img');
        let loadedCount = 0;

        const setupSlider = () => {
            if (infiniteSliderInitialized) return;

            const originalCards = Array.from(track.children);
            if (originalCards.length === 0) return;

            // Clone sets to make 3 identical sets
            const originalHTML = track.innerHTML;
            track.innerHTML = originalHTML + originalHTML + originalHTML;

            const allCards = Array.from(track.children);
            const numOriginal = originalCards.length;

            // Set draggable="false" on images and anchors to prevent native drag interrupting pointer events
            track.querySelectorAll('img, a').forEach(el => {
                el.setAttribute('draggable', 'false');
                el.style.webkitUserDrag = 'none'; // Force WebKit browsers to not drag links/images
            });

            let setWidth = 0;

            const calculateWidth = () => {
                // Width of exactly one set
                setWidth = allCards[numOriginal].offsetLeft - allCards[0].offsetLeft;
            };
            calculateWidth();
            window.addEventListener('resize', calculateWidth);

            let currentX = -setWidth;
            let targetX = -setWidth;
            let previousTargetX = -setWidth;

            let isDragging = false;
            let startX = 0;
            let dragStartTargetX = 0;
            let velocity = 0;
            let totalDragDistance = 0;

            // Custom cursor position state
            let cursorTargetX = window.innerWidth / 2;
            let cursorTargetY = window.innerHeight / 2;
            let cursorCurrentX = window.innerWidth / 2;
            let cursorCurrentY = window.innerHeight / 2;
            let isHovering = false;

            const handlePointerEnter = (e) => {
                if (e.pointerType === 'mouse') {
                    isHovering = true;
                    if (globalCursor) globalCursor.style.opacity = '0';
                    if (dragCursor) {
                        dragCursor.classList.add('visible');
                        cursorCurrentX = e.clientX;
                        cursorCurrentY = e.clientY;
                        cursorTargetX = e.clientX;
                        cursorTargetY = e.clientY;
                    }
                }
            };

            const handlePointerLeave = (e) => {
                if (e.pointerType === 'mouse') {
                    isHovering = false;
                    if (globalCursor) globalCursor.style.opacity = '';
                    if (dragCursor) {
                        dragCursor.classList.remove('visible');
                        dragCursor.classList.remove('pressing');
                    }
                }
            };

            const handlePointerDown = (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;

                if (dragCursor) dragCursor.classList.add('pressing');

                isDragging = true;
                projectsWrap.classList.add('dragging');
                track.classList.add('dragging');

                startX = e.clientX;
                dragStartTargetX = targetX;
                velocity = 0;
                totalDragDistance = 0;

                window.addEventListener('pointermove', handlePointerMove);
                window.addEventListener('pointerup', handlePointerUp);
                window.addEventListener('pointercancel', handlePointerUp);
            };

            const handlePointerMove = (e) => {
                if (isHovering && dragCursor) {
                    cursorTargetX = e.clientX;
                    cursorTargetY = e.clientY;
                }

                if (isDragging) {
                    const deltaX = e.clientX - startX;
                    const speedMultiplier = 1.2;
                    targetX = dragStartTargetX + (deltaX * speedMultiplier);

                    totalDragDistance += Math.abs(e.movementX || 1);
                }
            };

            const handlePointerUp = (e) => {
                if (dragCursor) dragCursor.classList.remove('pressing');

                if (!isDragging) return;
                isDragging = false;
                projectsWrap.classList.remove('dragging');
                track.classList.remove('dragging');

                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
                window.removeEventListener('pointercancel', handlePointerUp);
            };

            projectsWrap.addEventListener('pointerenter', handlePointerEnter);
            projectsWrap.addEventListener('pointerleave', handlePointerLeave);
            projectsWrap.addEventListener('pointerdown', handlePointerDown);
            projectsWrap.addEventListener('pointermove', handlePointerMove); // For hover tracking
            projectsWrap.addEventListener('dragstart', (e) => e.preventDefault());

            // Prevent actual click if dragged (> 7px)
            projectsWrap.addEventListener('click', (e) => {
                if (totalDragDistance > 7) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);

            // Physics Ticker Loop
            const update = () => {
                if (isDragging) {
                    velocity = targetX - previousTargetX;
                    previousTargetX = targetX;
                } else {
                    velocity *= 0.93;
                    targetX += velocity;
                    previousTargetX = targetX;
                }

                currentX += (targetX - currentX) * 0.08;

                // Infinite wrapping math:
                if (currentX > 0) {
                    currentX -= setWidth;
                    targetX -= setWidth;
                    previousTargetX -= setWidth;
                } else if (currentX < -setWidth * 2) {
                    currentX += setWidth;
                    targetX += setWidth;
                    previousTargetX += setWidth;
                }

                track.style.transform = `translate3d(${currentX}px, 0, 0)`;

                // Cursor smooth tracking
                if ((isDragging || isHovering) && dragCursor) {
                    cursorCurrentX += (cursorTargetX - cursorCurrentX) * 0.15;
                    cursorCurrentY += (cursorTargetY - cursorCurrentY) * 0.15;
                    dragCursor.style.left = `${cursorCurrentX}px`;
                    dragCursor.style.top = `${cursorCurrentY}px`;

                    const rotate = Math.min(Math.max(velocity * 0.4, -15), 15);
                    dragCursor.style.transform = `translate(-50%, -50%) scale(${isDragging ? 0.9 : 1}) rotate(${rotate}deg)`;
                }

                infiniteSliderRaf = requestAnimationFrame(update);
            };

            infiniteSliderInitialized = true;
            update();
        };

        if (images.length === 0) {
            setupSlider();
        } else {
            images.forEach(img => {
                if (img.complete) {
                    loadedCount++;
                    if (loadedCount === images.length) setupSlider();
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === images.length) setupSlider();
                    });
                    img.addEventListener('error', () => {
                        loadedCount++;
                        if (loadedCount === images.length) setupSlider();
                    });
                }
            });
        }
    };
    const testimonialsTrack = document.querySelector('.testimonials-track');
    if (testimonialsTrack) {
        // Duplicate content for seamless loop
        const content = testimonialsTrack.innerHTML;
        testimonialsTrack.innerHTML += content;
    }

    // 9. Smooth Scroll Navigation
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Let the shutter effect handle main nav links
            if (link.closest('#main-nav') || link.closest('.mm-links')) {
                return;
            }

            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    document.body.classList.remove('no-scroll');
                }
            }
        });
    });

    // 10. Mobile Menu Toggle
    const navToggle = document.getElementById('nav-mtoggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mmClose = document.getElementById('mm-close');
    const mmLinks = document.querySelectorAll('.mm-link');

    const toggleMobileMenu = () => {
        if (mobileMenu) {
            mobileMenu.classList.toggle('open');
            document.body.classList.toggle('no-scroll');
        }
    };

    if (navToggle) navToggle.addEventListener('click', toggleMobileMenu);
    // Also handle any other burger buttons (e.g., in scrolled nav state)
    document.querySelectorAll('.nav-burger').forEach(btn => {
        btn.addEventListener('click', toggleMobileMenu);
    });
    if (mmClose) mmClose.addEventListener('click', toggleMobileMenu);

    mmLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });



    // 12. Contact Form Validation
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;
            const nameInput = contactForm.querySelector('input[name="name"]');
            const emailInput = contactForm.querySelector('input[name="email"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');

            const setError = (input) => {
                if (input) {
                    input.classList.add('error');
                    isValid = false;
                }
            };

            const clearErrors = () => {
                [nameInput, emailInput, messageInput].forEach(input => {
                    if (input) input.classList.remove('error');
                });
            };

            clearErrors();

            if (!nameInput?.value.trim()) setError(nameInput);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput?.value.trim() || !emailRegex.test(emailInput.value)) {
                setError(emailInput);
            }

            if (!messageInput?.value.trim()) setError(messageInput);

            if (isValid) {
                const btn = contactForm.querySelector('.form-submit');
                if (btn) {
                    btn.classList.add('loading');
                    setTimeout(() => {
                        btn.classList.remove('loading');
                        btn.classList.add('success');
                        setTimeout(() => {
                            btn.classList.remove('success');
                            contactForm.reset();
                            clearErrors();
                        }, 2500);
                    }, 1200);
                }
            }
        });
    }

    // 13. Back to Top Button
    const backToTopBtn = document.querySelector('.back-to-top');

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show/hide based on scroll
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > window.innerHeight) {
                        backToTopBtn.classList.add('visible');
                    } else {
                        backToTopBtn.classList.remove('visible');
                    }
                });
            }
        }, { passive: true });
    }

    // 14. Active Nav Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navPills = document.querySelectorAll('.nav-pill, .mm-link');

    if (sections.length > 0 && navPills.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');

                    navPills.forEach(pill => {
                        pill.classList.remove('active');
                        if (pill.getAttribute('href') === `#${currentId}`) {
                            pill.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => sectionObserver.observe(section));
    }

    // 14.5 Dynamic Projects from projects-data.js
    const dynamicProjectsTrack = document.getElementById('dynamic-projects-track');

    // Shared YouTube ID extractor
    const extractYouTubeId = (url) => {
        if (!url) return null;
        if (url.length === 11 && !url.includes('/') && !url.includes('?')) return url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    if (dynamicProjectsTrack) {
        let allProjects = [];

        const renderProjects = (filter = 'All') => {
            dynamicProjectsTrack.innerHTML = '';

            const filteredProjects = allProjects.filter(p => {
                const isMainSite = p.show_on_main_site === undefined ? true : !!p.show_on_main_site;
                if (!isMainSite) return false;
                return filter === 'All' || p.category === filter;
            });

            filteredProjects.forEach(p => {
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'project-card';
                a.setAttribute('data-youtube-id', p.youtube_url || p.youtubeUrl);

                let thumbSrc = (p.thumbnail && p.thumbnail.trim() !== '') ? p.thumbnail.trim() : null;
                if (!thumbSrc) {
                    const ytId = extractYouTubeId(p.youtube_url || p.youtubeUrl);
                    if (ytId) {
                        thumbSrc = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
                    } else {
                        thumbSrc = 'assets/images/placeholder.jpg';
                    }
                }

                a.innerHTML = `
                    <div class="project-media">
                        <span class="project-badge">${p.category || p.badge}</span>
                        <img src="${thumbSrc}" alt="${p.title}" class="project-img" loading="lazy">
                        <div class="project-play-overlay">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div class="project-info">
                        <span class="project-title">${p.title}</span>
                        <span class="project-year">${p.year || ''}</span>
                    </div>
                `;
                dynamicProjectsTrack.appendChild(a);
            });

            // Initialize the physics drag slider after rendering
            setTimeout(() => {
                if (window.initInfiniteSlider) {
                    window.initInfiniteSlider();
                }
            }, 100);
        };

        const loadFromSupabase = async () => {
            if (window.supabaseClient) {
                const { data, error } = await window.supabaseClient
                    .from('portfolio_projects')
                    .select('*')
                    .eq('hidden', false)
                    .order('sort_order', { ascending: true });

                if (!error && data) {
                    allProjects = data;
                    renderProjects('All');
                    return;
                }
            }

            // Render empty or handle failure
            renderProjects('All');
        };

        // Initial fetch and render
        loadFromSupabase();
    }

    // 15. YouTube Video Modal
    const videoModal = document.getElementById('video-modal');
    if (videoModal && typeof gsap !== 'undefined') {
        const modalBackdrop = videoModal.querySelector('.video-modal-backdrop');
        const modalContainer = videoModal.querySelector('.video-modal-container');
        const modalCloseBtn = videoModal.querySelector('.video-modal-close');

        const openModal = (youtubeId, localVideoSrc) => {
            videoModal.classList.add('active');

            if (localVideoSrc) {
                modalContainer.innerHTML = `<video src="${localVideoSrc}" autoplay controls playsinline style="width: 100%; height: 100%; border-radius: 8px; background-color: #000; object-fit: cover;"></video>`;
            } else if (youtubeId) {
                modalContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&showinfo=0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
            }

            gsap.set(videoModal, { pointerEvents: 'auto' });
            gsap.to(modalBackdrop, { opacity: 1, duration: 0.4, ease: "power2.out" });
            gsap.to(modalCloseBtn, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)", delay: 0.2 });
            gsap.to(modalContainer, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.1 });
        };

        const closeModal = () => {
            gsap.to(modalContainer, { opacity: 0, y: 40, duration: 0.3, ease: "power2.in" });
            gsap.to(modalCloseBtn, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in" });
            gsap.to(modalBackdrop, {
                opacity: 0, duration: 0.4, ease: "power2.in", onComplete: () => {
                    videoModal.classList.remove('active');
                    gsap.set(videoModal, { pointerEvents: 'none' });
                    modalContainer.innerHTML = '';
                }
            });
        };

        // Event delegation for opening modals
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-youtube-id], [data-local-video]');
            if (btn) {
                e.preventDefault();
                const localVideoSrc = btn.getAttribute('data-local-video');
                const rawId = btn.getAttribute('data-youtube-id');
                const youtubeId = extractYouTubeId(rawId);

                if (localVideoSrc || youtubeId) {
                    openModal(youtubeId, localVideoSrc);
                }
            }
        });

        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // 16. Navigation Shutter Reveal
    const shutterNavLinks = document.querySelectorAll('#main-nav a[href^="#"], .mm-links a[href^="#"]');

    const shutterSectionNames = {
        '#hero': 'HOME',
        '#tagline': 'ABOUT',
        '#projects': 'PORTFOLIO',
        '#services': 'SERVICES',
        '#premium-footer': 'CONTACT'
    };

    shutterNavLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            const shutter = document.getElementById('shutter');
            if (shutter && (shutter.classList.contains('shutter-done') || shutter.classList.contains('shutter-open'))) {
                e.preventDefault();

                // Close mobile menu if open
                const mToggle = document.getElementById('nav-mtoggle');
                if (mToggle && mToggle.classList.contains('active')) {
                    mToggle.click();
                }

                // Lock scroll during animation
                document.body.classList.add('no-scroll');

                const shutterText = document.getElementById('shutter-text');
                if (shutterText) {
                    const name = shutterSectionNames[targetId] || targetId.replace('#', '').toUpperCase();
                    shutterText.textContent = name;

                    if (typeof gsap !== 'undefined') {
                        gsap.killTweensOf(shutterText);
                        gsap.set(shutterText, {
                            color: "rgba(255, 255, 255, 0)",
                            scale: 0.94
                            // Kept perfectly centered, no Y movement
                        });
                    }
                }

                // 1. Unhide and snap to bottom
                shutter.classList.remove('shutter-done', 'shutter-open', 'shutter-cover');
                shutter.classList.add('shutter-reset');

                // 2. Wait for next frame to ensure display:none is fully gone
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // 3. Animate up to cover
                        shutter.classList.remove('shutter-reset');
                        shutter.classList.add('shutter-cover');

                        if (shutterText && typeof gsap !== 'undefined') {
                            // Cinematic fade in (peaks when fully black at ~600ms)
                            gsap.to(shutterText, {
                                color: "rgba(255, 255, 255, 1)",
                                scale: 1,
                                duration: 1.0,
                                ease: "power2.out",
                                delay: 0.2
                            });
                        }

                        // 4. Wait for cover animation
                        setTimeout(() => {
                            // Scroll instantly
                            const y = targetSection.getBoundingClientRect().top + window.scrollY;
                            window.scrollTo({ top: y, behavior: 'instant' });

                            // 5. Animate up to reveal
                            shutter.classList.remove('shutter-cover');
                            shutter.classList.add('shutter-open');

                            if (shutterText && typeof gsap !== 'undefined') {
                                // Cinematic fade away
                                gsap.to(shutterText, {
                                    color: "rgba(255, 255, 255, 0)",
                                    scale: 1.06, // Continue drifting gently outward
                                    duration: 0.6,
                                    ease: "power2.inOut"
                                });
                            }

                            // 6. Cleanup
                            setTimeout(() => {
                                shutter.classList.add('shutter-done');
                                document.body.classList.remove('no-scroll');
                            }, 1100);

                        }, 1000); // Wait for cover
                    });
                });
            }
        });
    });

    // 17. Cinematic Premium Footer
    const premiumFooter = document.getElementById('premium-footer');
    const mainWrapper = document.querySelector('.main-wrapper');

    if (premiumFooter && mainWrapper) {
        const updatePremiumFooterHeight = () => {
            mainWrapper.style.marginBottom = `${premiumFooter.offsetHeight}px`;
        };

        updatePremiumFooterHeight();
        window.addEventListener('resize', updatePremiumFooterHeight, { passive: true });
        if (document.fonts) document.fonts.ready.then(updatePremiumFooterHeight);

        if (typeof gsap !== 'undefined') {
            const track = document.querySelector('.footer-marquee-track');
            if (track) {
                gsap.to(track, {
                    xPercent: -25,
                    ease: 'none',
                    duration: 25, // slower and smoother
                    repeat: -1,
                    force3D: true, // hardware acceleration for smoothness
                    rotationZ: 0.01 // prevents subpixel jitter
                });
            }

            if (typeof ScrollTrigger !== 'undefined') {
                const elementsToReveal = [
                    // '.pf-marquee-wrap', // Removed text fade in animation from loop text
                    '.pf-brand',
                    '.pf-nav',
                    '.pf-contact',
                    '.pf-bottom'
                ];

                const targets = elementsToReveal.map(sel => premiumFooter.querySelector(sel)).filter(Boolean);

                // Parallax underlayer effect: Footer slides down relative to the wrapper scrolling up
                gsap.fromTo(premiumFooter,
                    { yPercent: 50 },
                    {
                        yPercent: 0,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: mainWrapper,
                            start: 'bottom bottom',
                            end: () => `+=${premiumFooter.offsetHeight}`,
                            scrub: true
                        }
                    }
                );

                // Smooth stagger animation starts exactly when the marquee is uncovered by the wrapper
                gsap.fromTo(targets,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.2,
                        duration: 1.6,
                        ease: 'expo.out', // Much smoother ease curve
                        scrollTrigger: {
                            trigger: mainWrapper,
                            start: 'bottom 35%', // Triggers when the top of the footer is safely uncovered
                            toggleActions: 'play none none none'
                        }
                    }
                );

                ScrollTrigger.create({
                    trigger: mainWrapper,
                    start: 'bottom 50%',
                    onEnter: () => {
                        const mainNav = document.getElementById('main-nav');
                        if (mainNav) gsap.to(mainNav, { yPercent: -100, opacity: 0, duration: 0.4, overwrite: true });
                    },
                    onLeaveBack: () => {
                        const mainNav = document.getElementById('main-nav');
                        if (mainNav) gsap.to(mainNav, { yPercent: 0, opacity: 1, duration: 0.4, overwrite: true });
                    }
                });
            }
        }

        const pfBtt = document.querySelector('.pf-btt');
        if (pfBtt) {
            pfBtt.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
});
