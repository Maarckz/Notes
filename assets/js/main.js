// Obsidian Vault v6.3 - Modern Dark SPA Router & Command Palette
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Sidebar Resizer ---
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
            if (newWidth < 220) newWidth = 220; if (newWidth > 600) newWidth = 600;
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

    // --- Active Links & Folders ---
    function updateActiveLinks(currentUrl) {
        document.querySelectorAll('.nav-file, .nav-folder').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-file a, .folder-name-link').forEach(link => {
            const href = link.getAttribute('href');
            const linkPath = new URL(href, window.location.origin).pathname;
            const currentPath = new URL(currentUrl, window.location.origin).pathname;
            
            if (decodeURIComponent(linkPath) === decodeURIComponent(currentPath) || (href.endsWith('/index.html') && currentPath.endsWith('index.html'))) {
                if(!link.classList.contains('folder-name-link')) {
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

    // --- Lightbox para Imagens ---
    function initLightbox() {
        document.querySelectorAll('.markdown-content img:not(.no-lightbox)').forEach(img => {
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
            closeSearch(); // Garante que a modal de busca fecha se carregou via SPA
        }
    }

    // Intercepta cliques nos links (Global e na Modal)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || link.getAttribute('target') === '_blank') return;
        if (href.match(/\.(mp4|png|jpg|jpeg|mp3|zip|m4a)$/i)) return;

        e.preventDefault(); 
        
        // Se o clique veio da Modal, fecha ela
        if (link.closest('.search-modal')) closeSearch();
        
        loadPage(link.href);
    });

    window.addEventListener('popstate', () => {
        loadPage(window.location.href, false);
    });

    // --- Toggle de Pastas (Tree View) ---
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
        }
    });
});
