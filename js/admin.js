document.addEventListener('DOMContentLoaded', async () => {
    
    // Check if supabase is configured
    if (!window.supabaseClient) {
        document.getElementById('login-error').innerText = "Supabase is not configured. Check js/supabase-config.js";
        return;
    }
    const supabase = window.supabaseClient;

    // Elements
    const loginOverlay = document.getElementById('admin-login');
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    
    const dashboard = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logout-btn');
    
    const viewList = document.getElementById('view-list');
    const viewEditor = document.getElementById('view-editor');
    
    const projectsList = document.getElementById('projects-list');
    const btnAddNew = document.getElementById('btn-add-new');
    const btnCancel = document.getElementById('btn-cancel');
    const btnSave = document.getElementById('btn-save');
    
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');

    // Editor Inputs
    const editorTitle = document.getElementById('editor-title');
    const editId = document.getElementById('edit-id');
    const editTitle = document.getElementById('edit-title');
    const editCategory = document.getElementById('edit-category');
    const editYear = document.getElementById('edit-year');
    const editYoutube = document.getElementById('edit-youtube');
    const editThumbnail = document.getElementById('edit-thumbnail');
    const editDescription = document.getElementById('edit-description');
    const editTags = document.getElementById('edit-tags');
    const editClient = document.getElementById('edit-client');
    const editShowMain = document.getElementById('edit-show-main');
    const editShowWork = document.getElementById('edit-show-work');
    const editHidden = document.getElementById('edit-hidden');

    // Preview Elements
    const previewTitle = document.getElementById('preview-title');
    const previewBadge = document.getElementById('preview-badge');
    const previewYear = document.getElementById('preview-year');
    const previewImg = document.getElementById('preview-img');

    let currentProjects = [];

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            loginOverlay.style.display = 'none';
            dashboard.style.display = 'flex';
            loadProjects();
        } else {
            loginOverlay.style.display = 'flex';
            dashboard.style.display = 'none';
        }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.innerText = "Logging in...";
        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail.value,
            password: loginPassword.value
        });
        
        if (error) {
            loginError.innerText = error.message;
        } else {
            loginError.innerText = "";
            checkAuth();
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        checkAuth();
    });

    checkAuth(); // Initial check

    // ==========================================
    // DATA LOADING & RENDERING
    // ==========================================

    const extractYouTubeId = (url) => {
        if (!url) return null;
        if (url.length === 11 && !url.includes('/') && !url.includes('?')) return url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const getThumbnail = (p) => {
        if (p.thumbnail && p.thumbnail.trim() !== '') return p.thumbnail;
        const ytId = extractYouTubeId(p.youtube_url);
        return ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : 'assets/images/placeholder.jpg';
    };

    const loadProjects = async () => {
        const { data, error } = await supabase
            .from('portfolio_projects')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) {
            console.error("Error loading projects", error);
            return;
        }
        
        currentProjects = data;
        renderList();
    };

    const renderList = () => {
        projectsList.innerHTML = '';
        
        const searchTerm = searchInput.value.toLowerCase();
        const filterVal = filterSelect.value;
        
        let filtered = currentProjects;
        
        // Search
        if (searchTerm) {
            filtered = filtered.filter(p => 
                (p.title && p.title.toLowerCase().includes(searchTerm)) ||
                (p.category && p.category.toLowerCase().includes(searchTerm)) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(searchTerm)))
            );
        }
        
        // Filter
        if (filterVal !== 'All') {
            if (filterVal === 'Featured') {
                // Filter doesn't perfectly match 'Featured' anymore, maybe filter by main site?
                filtered = filtered.filter(p => p.show_on_main_site);
            }
            else if (filterVal === 'Hidden') filtered = filtered.filter(p => p.hidden);
            else filtered = filtered.filter(p => p.category === filterVal);
        }

        filtered.forEach(p => {
            const thumbSrc = getThumbnail(p);
            
            let badges = '';
            if (p.hidden) badges += `<span class="badge hidden">Hidden</span>`;
            else badges += `<span class="badge active">Active</span>`;
            
            const isMain = p.show_on_main_site === undefined ? false : !!p.show_on_main_site;
            const isWork = p.show_on_work_page === undefined ? true : !!p.show_on_work_page;
            
            if (isMain) badges += `<span class="badge featured">MAIN SITE</span>`;
            if (isWork) badges += `<span class="badge featured" style="background:#555; color:#fff;">WORK PAGE</span>`;

            const item = document.createElement('div');
            item.className = 'list-item';
            item.dataset.id = p.id;
            
            item.innerHTML = `
                <div class="col-drag drag-handle">≡</div>
                <div class="col-thumb">
                    <img src="${thumbSrc}" class="item-thumb" alt="Thumbnail">
                </div>
                <div class="col-title item-details">
                    <h4>${p.title}</h4>
                    <p>${p.category} • ${p.year || 'N/A'}</p>
                </div>
                <div class="col-status item-status">
                    ${badges}
                </div>
                <div class="col-actions item-actions">
                    <button class="admin-btn secondary btn-edit" data-id="${p.id}">Edit</button>
                    <button class="admin-btn secondary btn-delete" data-id="${p.id}" style="color:red;">Delete</button>
                </div>
            `;
            projectsList.appendChild(item);
        });

        // Setup Drag and Drop
        if (window.Sortable) {
            new Sortable(projectsList, {
                handle: '.drag-handle',
                animation: 150,
                onEnd: async (evt) => {
                    const items = Array.from(projectsList.children);
                    // Build array of {id, sort_order}
                    const updates = items.map((el, index) => ({
                        id: el.dataset.id,
                        sort_order: index
                    }));
                    
                    // Update locally
                    updates.forEach(u => {
                        const proj = currentProjects.find(p => p.id === u.id);
                        if(proj) proj.sort_order = u.sort_order;
                    });
                    
                    // Supabase requires individual updates or a bulk upsert RPC. We'll do individual updates.
                    for (const u of updates) {
                        await supabase.from('portfolio_projects').update({ sort_order: u.sort_order }).eq('id', u.id);
                    }
                }
            });
        }
        
        bindListEvents();
    };

    const bindListEvents = () => {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                openEditor(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this project?")) {
                    await supabase.from('portfolio_projects').delete().eq('id', id);
                    loadProjects();
                }
            });
        });
    };

    searchInput.addEventListener('input', renderList);
    filterSelect.addEventListener('change', renderList);

    // ==========================================
    // EDITOR LOGIC
    // ==========================================
    
    btnAddNew.addEventListener('click', () => {
        openEditor(null);
    });

    btnCancel.addEventListener('click', () => {
        viewEditor.style.display = 'none';
        viewList.style.display = 'block';
    });

    const openEditor = (id) => {
        document.getElementById('project-form').reset();
        
        if (id) {
            editorTitle.innerText = "Edit Project";
            const p = currentProjects.find(x => x.id === id);
            editId.value = p.id;
            editTitle.value = p.title || '';
            editCategory.value = p.category || '';
            editYear.value = p.year || '';
            editYoutube.value = p.youtube_url || '';
            editThumbnail.value = p.thumbnail || '';
            editDescription.value = p.description || '';
            editTags.value = p.tags ? p.tags.join(', ') : '';
            editClient.value = p.client || '';
            editShowMain.checked = p.show_on_main_site === undefined ? false : !!p.show_on_main_site;
            editShowWork.checked = p.show_on_work_page === undefined ? true : !!p.show_on_work_page;
            editHidden.checked = !!p.hidden;
        } else {
            editorTitle.innerText = "Add New Project";
            editId.value = "";
            
            // Defaults for new projects
            editShowMain.checked = false;
            editShowWork.checked = true;
            editHidden.checked = false;
        }
        
        updatePreview();
        viewList.style.display = 'none';
        viewEditor.style.display = 'block';
    };

    const updatePreview = () => {
        previewTitle.innerText = editTitle.value || 'Project Title';
        previewBadge.innerText = editCategory.value || 'Category';
        previewYear.innerText = editYear.value || '2026';
        
        const thumbSrc = getThumbnail({
            thumbnail: editThumbnail.value,
            youtube_url: editYoutube.value
        });
        previewImg.src = thumbSrc;
    };

    // Live preview binding
    document.querySelectorAll('#project-form input').forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    btnSave.addEventListener('click', async () => {
        btnSave.innerText = "Saving...";
        
        const payload = {
            title: editTitle.value,
            category: editCategory.value,
            year: editYear.value,
            youtube_url: editYoutube.value,
            thumbnail: editThumbnail.value,
            description: editDescription.value,
            tags: editTags.value.split(',').map(t => t.trim()).filter(Boolean),
            client: editClient.value,
            show_on_main_site: editShowMain.checked,
            show_on_work_page: editShowWork.checked,
            hidden: editHidden.checked
        };

        if (editId.value) {
            // Update
            await supabase.from('portfolio_projects').update(payload).eq('id', editId.value);
        } else {
            // Insert
            payload.sort_order = currentProjects.length;
            await supabase.from('portfolio_projects').insert([payload]);
        }
        
        btnSave.innerText = "Save Changes";
        viewEditor.style.display = 'none';
        viewList.style.display = 'block';
        loadProjects();
    });

});
