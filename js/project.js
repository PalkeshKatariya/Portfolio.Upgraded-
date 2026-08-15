document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    const mediaContainer = document.getElementById('project-media-container');
    const titleDisplay = document.getElementById('project-title-display');
    const descDisplay = document.getElementById('project-desc-display');
    const categoryDisplay = document.getElementById('project-category-display');
    
    const clientWrapper = document.getElementById('pd-client-wrapper');
    const clientDisplay = document.getElementById('project-client-display');
    const yearWrapper = document.getElementById('pd-year-wrapper');
    const yearDisplay = document.getElementById('project-year-display');
    const tagsWrapper = document.getElementById('pd-tags-wrapper');
    const tagsDisplay = document.getElementById('project-tags-display');

    // Shared YouTube ID extractor
    const extractYouTubeId = (url) => {
        if (!url) return null;
        if (url.length === 11 && !url.includes('/') && !url.includes('?')) return url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const renderProject = (project) => {
        if (!project) {
            titleDisplay.textContent = "Project Not Found";
            return;
        }

        // Set Text Content
        titleDisplay.textContent = project.title;
        categoryDisplay.textContent = project.category;
        
        if (project.description) {
            descDisplay.innerHTML = `<p>${project.description.replace(/\\n/g, '<br>')}</p>`;
        } else {
            descDisplay.innerHTML = '';
        }

        if (project.client) {
            clientDisplay.textContent = project.client;
            clientWrapper.style.display = 'flex';
        }
        
        if (project.year) {
            yearDisplay.textContent = project.year;
            yearWrapper.style.display = 'flex';
        }

        if (project.tags && project.tags.length > 0) {
            tagsDisplay.textContent = Array.isArray(project.tags) ? project.tags.join(', ') : project.tags;
            tagsWrapper.style.display = 'flex';
        }

        // Set Media
        const ytId = extractYouTubeId(project.youtube_url || project.youtubeUrl);
        if (ytId) {
            // Embed YouTube video with overlay to allow custom cursor on top
            mediaContainer.innerHTML = `
                <div id="yt-player" style="width:100%; height:100%;"></div>
                <div id="yt-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 60px; z-index: 10; cursor: none;"></div>
            `;
            
            const initYTPlayer = () => {
                let isPlaying = false;
                const player = new YT.Player('yt-player', {
                    videoId: ytId,
                    playerVars: { 'autoplay': 0, 'rel': 0, 'showinfo': 0, 'controls': 1 },
                    events: {
                        'onReady': () => {
                            const overlay = document.getElementById('yt-overlay');
                            if (overlay) {
                                overlay.addEventListener('click', () => {
                                    if (isPlaying) {
                                        player.pauseVideo();
                                    } else {
                                        player.playVideo();
                                    }
                                });
                            }
                        },
                        'onStateChange': (event) => {
                            isPlaying = event.data === YT.PlayerState.PLAYING;
                        }
                    }
                });
            };

            if (window.YT && window.YT.Player) {
                initYTPlayer();
            } else {
                if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                    const tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                }
                const existingCallback = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (existingCallback) existingCallback();
                    initYTPlayer();
                };
            }
        } else if (project.thumbnail) {
            // Fallback to image if no video
            mediaContainer.innerHTML = `<img src="${project.thumbnail}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            mediaContainer.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #eee; color: #999;">No Media Available</div>`;
        }
        
        // Animate elements in using GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(mediaContainer, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: 0.2 });
            gsap.fromTo('.project-detail-main > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
            gsap.fromTo('.pd-meta-item', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.6 });
        }
    };

    const loadProject = async () => {
        if (!projectId) {
            renderProject(null);
            return;
        }

        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient
                .from('portfolio_projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (!error && data) {
                renderProject(data);
                return;
            } else {
                console.error("Error loading project:", error);
            }
        }
        renderProject(null);
    };

    loadProject();
});
