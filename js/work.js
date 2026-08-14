document.addEventListener('DOMContentLoaded', () => {
    const workGrid = document.getElementById('work-grid');
    const filterBtns = document.querySelectorAll('.work-filter-btn');
    let allProjects = [];

    // Shared YouTube ID extractor (similar to main.js)
    const extractYouTubeId = (url) => {
        if (!url) return null;
        if (url.length === 11 && !url.includes('/') && !url.includes('?')) return url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const renderProjects = (filter = 'All') => {
        if (!workGrid) return;

        workGrid.innerHTML = '';

        const filteredProjects = allProjects.filter(p => {
            const isWorkPage = p.show_on_work_page === undefined ? true : !!p.show_on_work_page;
            if (!isWorkPage) return false;
            return filter === 'All' || p.category === filter;
        });

        filteredProjects.forEach((p, index) => {
            const a = document.createElement('a');
            // We use a query parameter to pass the project id to the detail page.
            a.href = `project.html?id=${p.id}`;
            a.className = 'work-card reveal';

            // Stagger reveal animations slightly based on index
            a.style.animationDelay = `${index * 0.05}s`;

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
                <div class="work-card-media">
                    <img src="${thumbSrc}" alt="${p.title}" class="work-card-img" loading="lazy">
                    <div class="work-card-overlay">
                        <span class="work-card-view">View Project</span>
                    </div>
                </div>
                <div class="work-card-info">
                    <h3 class="work-card-title">${p.title}</h3>
                    <div class="work-card-meta">
                        <span class="work-card-category">${p.category}</span>
                        ${p.year ? `<span class="work-card-dot">•</span><span class="work-card-year">${p.year}</span>` : ''}
                    </div>
                </div>
            `;

            workGrid.appendChild(a);
        });

        // Setup GSAP scroll trigger for the newly added reveal elements if ScrollTrigger exists
        if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
            const newReveals = workGrid.querySelectorAll('.reveal');
            newReveals.forEach(el => {
                gsap.fromTo(el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                        }
                    }
                );
            });
            ScrollTrigger.refresh();
        }
    };

    const loadProjects = async () => {
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
        // Handle failure
        renderProjects('All');
    };

    // Filter Buttons Logic
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                const cards = document.querySelectorAll('.work-card');
                if (typeof gsap !== 'undefined' && cards.length > 0) {
                    gsap.to(cards, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        stagger: 0.02,
                        ease: 'power2.in',
                        onComplete: () => {
                            renderProjects(filterValue);
                        }
                    });
                } else {
                    renderProjects(filterValue);
                }
            });
        });
    }

    // Initial fetch
    if (workGrid) {
        loadProjects();
    }
});
