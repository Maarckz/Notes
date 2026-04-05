// Obsidian Vault v6.1 - SPA Router JS
document.addEventListener('DOMContentLoaded', () => {
    
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
            if (newWidth < 200) newWidth = 200; if (newWidth > 600) newWidth = 600;
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

    function updateActiveLinks(currentUrl) {
        document.querySelectorAll('.nav-file, .nav-folder').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-file a, .folder-name-link').forEach(link => {
            link.style.color = ''; 
            const href = link.getAttribute('href');
            const linkPath = new URL(href, window.location.origin).pathname;
            const currentPath = new URL(currentUrl, window.location.origin).pathname;
            
            // Lógica mais robusta para lidar com a Home em subdiretórios
            if (decodeURIComponent(linkPath) === decodeURIComponent(currentPath) || (href.endsWith('/index.html') && currentPath.endsWith('index.html'))) {
                if(link.classList.contains('folder-name-link')) {
                    link.style.color = 'var(--primary)';
                } else {
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

    function initLightbox() {
        document.querySelectorAll('.markdown-content img').forEach(img => {
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
            document.querySelector('.search-results').classList.remove('active');
        }
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || link.getAttribute('target') === '_blank') return;
        
        if (href.match(/\.(mp4|png|jpg|jpeg|mp3|zip|m4a)$/i)) return;

        e.preventDefault(); 
        loadPage(link.href);
    });

    window.addEventListener('popstate', () => {
        loadPage(window.location.href, false);
    });

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

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (searchInput) { searchInput.focus(); searchInput.select(); }
        }
        if (e.key === 'Escape') {
            if (resultsContainer) resultsContainer.classList.remove('active');
            document.getElementById('lightbox-overlay').classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
