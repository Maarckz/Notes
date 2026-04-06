<<<<<<< HEAD
// Obsidian Vault v6.3 - Modern Dark SPA Router & Command Palette
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Sidebar Resizer ---
=======
// Obsidian Vault v6.1 - SPA Router JS
document.addEventListener('DOMContentLoaded', () => {
    
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
    const resizer = document.getElementById('sidebar-resizer');
    let isResizing = false;
    const savedWidth = localStorage.getItem('obsidian-sidebar-width');
    if (savedWidth) document.documentElement.style.setProperty('--sidebar-width', savedWidth);

    if (resizer) {
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true; document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; resizer.classList.add('is-resizing'); e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            let newWidth = e.clientX;
<<<<<<< HEAD
            if (newWidth < 220) newWidth = 220; if (newWidth > 600) newWidth = 600;
=======
            if (newWidth < 200) newWidth = 200; if (newWidth > 600) newWidth = 600;
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
            document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
        });
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false; document.body.style.cursor = ''; document.body.style.userSelect = '';
                resizer.classList.remove('is-resizing');
                localStorage.setItem('obsidian-sidebar-width', getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'));
            }
        });
    }

<<<<<<< HEAD
    // --- Active Links & Folders ---
    function updateActiveLinks(currentUrl) {
        document.querySelectorAll('.nav-file, .nav-folder').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-file a, .folder-name-link').forEach(link => {
=======
    function updateActiveLinks(currentUrl) {
        document.querySelectorAll('.nav-file, .nav-folder').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-file a, .folder-name-link').forEach(link => {
            link.style.color = ''; 
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
            const href = link.getAttribute('href');
            const linkPath = new URL(href, window.location.origin).pathname;
            const currentPath = new URL(currentUrl, window.location.origin).pathname;
            
<<<<<<< HEAD
            if (decodeURIComponent(linkPath) === decodeURIComponent(currentPath) || (href.endsWith('/index.html') && currentPath.endsWith('index.html'))) {
                if(!link.classList.contains('folder-name-link')) {
=======
            // Lógica mais robusta para lidar com a Home em subdiretórios
            if (decodeURIComponent(linkPath) === decodeURIComponent(currentPath) || (href.endsWith('/index.html') && currentPath.endsWith('index.html'))) {
                if(link.classList.contains('folder-name-link')) {
                    link.style.color = 'var(--primary)';
                } else {
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
                    const navFile = link.closest('.nav-file');
                    if (navFile) navFile.classList.add('active');
                }
                let parent = link.closest('.nav-folder');
                while (parent) {
                    parent.classList.add('expanded');
                    parent = parent.parentElement?.closest('.nav-folder');
                }
            }
        });
    }
    updateActiveLinks(window.location.pathname); 

<<<<<<< HEAD
    // --- Lightbox para Imagens ---
    function initLightbox() {
        document.querySelectorAll('.markdown-content img:not(.no-lightbox)').forEach(img => {
=======
    function initLightbox() {
        document.querySelectorAll('.markdown-content img').forEach(img => {
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
            const newImg = img.cloneNode(true);
            img.parentNode.replaceChild(newImg, img);
            
            newImg.addEventListener('click', (e) => {
                const src = e.target.getAttribute('src');
                const lightbox = document.getElementById('lightbox-overlay');
                lightbox.querySelector('.lightbox-img').setAttribute('src', src);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; 
            });
        });
    }
    document.getElementById('lightbox-overlay').addEventListener('click', (e) => {
        e.currentTarget.classList.remove('active');
        document.body.style.overflow = '';
    });
    initLightbox();

<<<<<<< HEAD
    // --- Search System (Command Palette) ---
    let searchIndex = [];
    fetch('/assets/js/search-index.json')
        .then(res => res.json())
        .then(data => searchIndex = data);

    const searchTrigger = document.getElementById('search-trigger');
    const searchModalOverlay = document.getElementById('search-modal-overlay');
    const modalSearchInput = document.getElementById('modal-search-input');
    const searchModalResults = document.getElementById('search-modal-results');
    const closeSearchBtn = document.getElementById('close-search');

    function openSearch() {
        searchModalOverlay.classList.add('active');
        setTimeout(() => modalSearchInput.focus(), 50); // Timeout leve para garantir que a div apareceu
        document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
        searchModalOverlay.classList.remove('active');
        modalSearchInput.value = '';
        searchModalResults.innerHTML = '';
        document.body.style.overflow = '';
    }

    if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
    
    // Fechar se clicar no fundo desfocado
    searchModalOverlay.addEventListener('click', (e) => {
        if (e.target === searchModalOverlay) closeSearch();
    });

    modalSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) { 
            searchModalResults.innerHTML = ''; 
            return; 
        }
        
        const results = searchIndex.filter(item => 
            (item.title && item.title.toLowerCase().includes(query)) || 
            (item.path && item.path.toLowerCase().includes(query))
        ).slice(0, 15); // Limite de 15 resultados
        
        if (results.length === 0) {
            searchModalResults.innerHTML = `
                <div class="search-empty">
                    <i class="far fa-folder-open"></i>
                    <span>Nenhum conhecimento encontrado para "<b>${e.target.value}</b>"</span>
                </div>`;
        } else {
            searchModalResults.innerHTML = results.map(item => `
                <a href="${item.url}" style="text-decoration:none; display:block;">
                    <div class="search-result-item">
                        <div class="search-result-title"><i class="far fa-file-alt"></i> ${item.title}</div>
                        <div class="search-result-path">${item.path}</div>
                    </div>
                </a>
            `).join('');
        }
    });

    // --- SPA Core ---
=======
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
    async function loadPage(url, pushState = true) {
        const mainContent = document.querySelector('.main-content');
        mainContent.classList.add('loading');
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Página não encontrada');
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            document.querySelector('.content-header').innerHTML = doc.querySelector('.content-header').innerHTML;
            
            const newBody = doc.querySelector('.content-body');
            const currentBody = document.querySelector('.content-body');
            
            currentBody.style.animation = 'none';
            currentBody.innerHTML = newBody.innerHTML;
            void currentBody.offsetWidth; 
            currentBody.style.animation = null;
            
            document.title = doc.querySelector('title').innerText;
            if (pushState) history.pushState({ path: url }, '', url);
            
            updateActiveLinks(url);
            initLightbox();
            document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
            
            window.scrollTo({top: 0, behavior: 'smooth'});

        } catch (error) {
            console.error('Erro no SPA:', error);
            window.location.href = url; 
        } finally {
            mainContent.classList.remove('loading');
<<<<<<< HEAD
            closeSearch(); // Garante que a modal de busca fecha se carregou via SPA
        }
    }

    // Intercepta cliques nos links (Global e na Modal)
=======
            document.querySelector('.search-results').classList.remove('active');
        }
    }

>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || link.getAttribute('target') === '_blank') return;
<<<<<<< HEAD
        if (href.match(/\.(mp4|png|jpg|jpeg|mp3|zip|m4a)$/i)) return;

        e.preventDefault(); 
        
        // Se o clique veio da Modal, fecha ela
        if (link.closest('.search-modal')) closeSearch();
        
=======
        
        if (href.match(/\.(mp4|png|jpg|jpeg|mp3|zip|m4a)$/i)) return;

        e.preventDefault(); 
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
        loadPage(link.href);
    });

    window.addEventListener('popstate', () => {
        loadPage(window.location.href, false);
    });

<<<<<<< HEAD
    // --- Toggle de Pastas (Tree View) ---
=======
    // --- Busca atualizada para usar o BASE_PATH ---
    let searchIndex = [];
    fetch('/Notes/assets/js/search-index.json')
        .then(res => res.json())
        .then(data => searchIndex = data);

    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.querySelector('.search-results');

    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) { resultsContainer.classList.remove('active'); return; }
            const results = searchIndex.filter(item => 
                (item.title && item.title.toLowerCase().includes(query)) || 
                (item.path && item.path.toLowerCase().includes(query))
            ).slice(0, 10);
            
            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="search-result-item" style="cursor:default;"><span class="search-result-title" style="color:var(--text-muted);">Nenhuma inteligência encontrada.</span></div>';
            } else {
                resultsContainer.innerHTML = results.map(item => `
                    <a href="${item.url}" style="text-decoration:none; display:block;">
                        <div class="search-result-item">
                            <div class="search-result-title">${item.title}</div>
                            <div class="search-result-path">${item.path}</div>
                        </div>
                    </a>
                `).join('');
            }
            resultsContainer.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) resultsContainer.classList.remove('active');
        });
    }

>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
    const navContainer = document.querySelector('.nav-tree-container');
    if (navContainer) {
        navContainer.addEventListener('click', (e) => {
            if (e.target.closest('.folder-name-link') || e.target.closest('.sidebar-resizer')) return; 
            const folderHeader = e.target.closest('.folder-header');
            if (folderHeader) {
                e.preventDefault();
                const folder = folderHeader.closest('.nav-folder');
                if (folder) folder.classList.toggle('expanded');
            }
        });
    }

<<<<<<< HEAD
    // --- Atalhos de Teclado Globais ---
    document.addEventListener('keydown', (e) => {
        // Ctrl+K (ou Cmd+K) abre a pesquisa
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (searchModalOverlay.classList.contains('active')) {
                closeSearch();
            } else {
                openSearch();
            }
        }
        
        // ESC para fechar modais
        if (e.key === 'Escape') {
            if (searchModalOverlay.classList.contains('active')) closeSearch();
            const lightbox = document.getElementById('lightbox-overlay');
            if (lightbox && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
=======
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (searchInput) { searchInput.focus(); searchInput.select(); }
        }
        if (e.key === 'Escape') {
            if (resultsContainer) resultsContainer.classList.remove('active');
            document.getElementById('lightbox-overlay').classList.remove('active');
            document.body.style.overflow = '';
>>>>>>> e9862c1bed36d2a9dacdb0cb530d3a7538933fbd
        }
    });
});
