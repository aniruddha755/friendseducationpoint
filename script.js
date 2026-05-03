// Initialize Lucide Icons
lucide.createIcons();

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.setAttribute('data-theme', 'dark');
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
const navLinks = document.getElementById('nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if(this.getAttribute('href').startsWith('#') && this.getAttribute('href').length > 1) {
            e.preventDefault();
            if (navLinks) navLinks.classList.remove('active');
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Category Filtering Logic for documents.html
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DYNAMIC DOCUMENT MANAGEMENT ---
    if (window.documentData) {
        // Sort documents from newest to oldest by dateAdded
        window.documentData.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

        // 1. Render Documents if on documents.html
        const container = document.querySelector('.documents-container');
        if (container) {
            container.innerHTML = ''; // Clear container
            window.documentData.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.className = 'document-item';
                docElement.setAttribute('data-category', doc.category);
                docElement.innerHTML = `
                    <div class="doc-icon"><i data-lucide="file-text"></i></div>
                    <div class="doc-info">
                        <h4>${doc.title}</h4>
                        <p>Category: ${doc.category} &bull; Added: ${doc.dateAdded}</p>
                        <a href="${doc.link}" class="primary-btn doc-download-btn" target="_blank" style="display: inline-flex; margin-top: 0.75rem;"><i data-lucide="eye"></i> View</a>
                    </div>
                `;
                container.appendChild(docElement);
            });
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // 2. Update Category Counts across all pages
        const categoryCards = document.querySelectorAll('.category-card');
        if (categoryCards.length > 0) {
            const categoryCounts = {};
            window.documentData.forEach(doc => {
                categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
            });

            categoryCards.forEach(card => {
                const categoryName = card.querySelector('h3').textContent.trim();
                const count = categoryCounts[categoryName] || 0;
                const docCountElement = card.querySelector('.doc-count');
                if (docCountElement) {
                    docCountElement.textContent = `${count} Document${count !== 1 ? 's' : ''}`;
                }
            });
        }
    }
    // ------------------------------------

    // --- DYNAMIC VIDEO MANAGEMENT ---
    if (window.videoData) {
        function getYoutubeVideoId(url) {
            let videoId = '';
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname === 'youtu.be') {
                    videoId = urlObj.pathname.slice(1);
                } else if (urlObj.hostname.includes('youtube.com')) {
                    videoId = urlObj.searchParams.get('v');
                }
            } catch (e) {
                console.error('Invalid URL:', url);
            }
            return videoId;
        }

        // 1. Render Videos on videos.html
        const videoPageContainer = document.getElementById('video-grid-container');
        if (videoPageContainer) {
            videoPageContainer.innerHTML = ''; // Clear container
            
            window.videoData.forEach(video => {
                const videoId = getYoutubeVideoId(video.link);
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400/007bff/white?text=Video';
                
                const videoElement = document.createElement('a');
                videoElement.href = video.link;
                videoElement.target = '_blank';
                videoElement.className = 'video-page-card';
                videoElement.innerHTML = `
                    <div class="video-thumbnail-wrapper">
                        <img src="${thumbnailUrl}" alt="Video Thumbnail" class="video-thumb-img">
                        <div class="play-overlay">
                            <i data-lucide="play-circle" class="play-icon-large"></i>
                        </div>
                    </div>
                    <div class="video-page-info">
                        <h3 title="${video.title}">${video.title}</h3>
                        <p>Click to watch on YouTube</p>
                    </div>
                `;
                videoPageContainer.appendChild(videoElement);
            });
        }

        // 2. Render latest 2 Videos on index.html
        const homeVideoContainer = document.getElementById('home-video-grid');
        if (homeVideoContainer) {
            homeVideoContainer.innerHTML = ''; // Clear container

            // Get up to 2 videos for the home page
            const homeVideos = window.videoData.slice(0, 2);

            homeVideos.forEach(video => {
                const videoId = getYoutubeVideoId(video.link);
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400/007bff/white?text=Video';

                const videoElement = document.createElement('a');
                videoElement.href = video.link;
                videoElement.target = '_blank';
                videoElement.className = 'video-card';
                videoElement.innerHTML = `
                    <div class="video-thumbnail" style="background-image: url('${thumbnailUrl}'); background-size: cover; background-position: center; color: white;">
                        <i data-lucide="play-circle" style="width: 48px; height: 48px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>
                    </div>
                    <h4 title="${video.title}">${video.title}</h4>
                `;
                homeVideoContainer.appendChild(videoElement);
            });
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    // ------------------------------------

    // --- HOME PAGE SEARCH LOGIC ---
    const searchBar = document.getElementById('home-search-bar');
    const searchSuggestions = document.getElementById('search-suggestions');
    const searchBtn = document.getElementById('home-search-btn');

    if (searchBar && searchSuggestions) {
        let currentFocus = -1;

        searchBar.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            searchSuggestions.innerHTML = '';
            currentFocus = -1;

            if (!query) {
                searchSuggestions.classList.remove('active');
                return;
            }

            const results = [];

            // Search Documents
            if (window.documentData) {
                window.documentData.forEach(doc => {
                    if (doc.title.toLowerCase().includes(query) || doc.category.toLowerCase().includes(query)) {
                        results.push({ ...doc, type: 'Document', icon: 'file-text' });
                    }
                });
            }

            // Search Videos
            if (window.videoData) {
                window.videoData.forEach(video => {
                    if (video.title.toLowerCase().includes(query)) {
                        results.push({ ...video, type: 'Video', icon: 'youtube' });
                    }
                });
            }

            if (results.length > 0) {
                // Limit to top 15 results
                const limitedResults = results.slice(0, 15);
                
                limitedResults.forEach(result => {
                    const item = document.createElement('a');
                    item.href = result.link;
                    item.target = '_blank';
                    item.className = 'suggestion-item';
                    
                    item.innerHTML = `
                        <div class="suggestion-icon">
                            <i data-lucide="${result.icon}"></i>
                        </div>
                        <div class="suggestion-content">
                            <span class="suggestion-title">${highlightText(result.title, query)}</span>
                            <span class="suggestion-type">${result.type}${result.category ? ' - ' + result.category : ''}</span>
                        </div>
                    `;
                    
                    item.addEventListener('click', () => {
                        searchSuggestions.classList.remove('active');
                        searchBar.value = '';
                    });

                    searchSuggestions.appendChild(item);
                });
            } else {
                searchSuggestions.innerHTML = '<div class="no-suggestions">No documents or videos found.</div>';
            }

            if (typeof lucide !== 'undefined') lucide.createIcons();
            searchSuggestions.classList.add('active');
        });

        // Helper to highlight matching text
        function highlightText(text, query) {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span style="color: var(--primary-color); font-weight: bold;">$1</span>');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchBar.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.remove('active');
            }
        });

        // Handle Search Button Click / Enter key
        function handleSearchExecute() {
            const query = searchBar.value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', handleSearchExecute);
        }

        searchBar.addEventListener('keydown', function(e) {
            const items = searchSuggestions.querySelectorAll('.suggestion-item');
            
            if (e.key === 'ArrowDown') {
                currentFocus++;
                addActive(items);
            } else if (e.key === 'ArrowUp') {
                currentFocus--;
                addActive(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (items) items[currentFocus].click();
                } else {
                    handleSearchExecute();
                }
            }
        });

        function addActive(items) {
            if (!items) return false;
            removeActive(items);
            if (currentFocus >= items.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (items.length - 1);
            items[currentFocus].classList.add('selected');
            items[currentFocus].scrollIntoView({ block: 'nearest' });
        }

        function removeActive(items) {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove('selected');
            }
        }
    }
    // ------------------------------------

    // --- SEARCH RESULTS PAGE LOGIC ---
    const searchPageHeader = document.getElementById('search-page-header');
    if (searchPageHeader) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        
        const titleElement = document.getElementById('search-page-title');
        const subtitleElement = document.getElementById('search-page-subtitle');
        const docsSection = document.getElementById('search-documents-section');
        const docsContainer = document.getElementById('search-documents-container');
        const videosSection = document.getElementById('search-videos-section');
        const videosContainer = document.getElementById('search-videos-container');
        const noResultsState = document.getElementById('no-results-state');

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            titleElement.textContent = `Search Results for "${searchQuery}"`;
            
            let docsFound = 0;
            let videosFound = 0;

            // Render Documents
            if (window.documentData) {
                window.documentData.forEach(doc => {
                    if (doc.title.toLowerCase().includes(lowerQuery) || doc.category.toLowerCase().includes(lowerQuery)) {
                        docsFound++;
                        const docElement = document.createElement('div');
                        docElement.className = 'document-item animate-on-scroll';
                        docElement.style.transitionDelay = `${(docsFound % 4) * 0.1}s`;
                        docElement.innerHTML = `
                            <div class="doc-icon"><i data-lucide="file-text"></i></div>
                            <div class="doc-info">
                                <h4>${doc.title}</h4>
                                <p>Category: ${doc.category} &bull; Added: ${doc.dateAdded}</p>
                                <a href="${doc.link}" class="primary-btn doc-download-btn" target="_blank" style="display: inline-flex; margin-top: 0.75rem;"><i data-lucide="eye"></i> View</a>
                            </div>
                        `;
                        docsContainer.appendChild(docElement);
                    }
                });
            }

            // Render Videos
            if (window.videoData) {
                function getYoutubeVideoId(url) {
                    let videoId = '';
                    try {
                        const urlObj = new URL(url);
                        if (urlObj.hostname === 'youtu.be') {
                            videoId = urlObj.pathname.slice(1);
                        } else if (urlObj.hostname.includes('youtube.com')) {
                            videoId = urlObj.searchParams.get('v');
                        }
                    } catch (e) {
                        console.error('Invalid URL:', url);
                    }
                    return videoId;
                }

                window.videoData.forEach(video => {
                    if (video.title.toLowerCase().includes(lowerQuery)) {
                        videosFound++;
                        const videoId = getYoutubeVideoId(video.link);
                        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://placehold.co/600x400/007bff/white?text=Video';
                        
                        const videoElement = document.createElement('a');
                        videoElement.href = video.link;
                        videoElement.target = '_blank';
                        videoElement.className = 'video-page-card animate-on-scroll';
                        videoElement.style.transitionDelay = `${(videosFound % 4) * 0.1}s`;
                        videoElement.innerHTML = `
                            <div class="video-thumbnail-wrapper">
                                <img src="${thumbnailUrl}" alt="Video Thumbnail" class="video-thumb-img">
                                <div class="play-overlay">
                                    <i data-lucide="play-circle" class="play-icon-large"></i>
                                </div>
                            </div>
                            <div class="video-page-info">
                                <h3 title="${video.title}">${video.title}</h3>
                                <p>Click to watch on YouTube</p>
                            </div>
                        `;
                        videosContainer.appendChild(videoElement);
                    }
                });
            }

            if (docsFound > 0) docsSection.style.display = 'block';
            if (videosFound > 0) videosSection.style.display = 'block';
            
            if (docsFound === 0 && videosFound === 0) {
                noResultsState.style.display = 'block';
                subtitleElement.textContent = "We couldn't find any documents or videos matching your search.";
            } else {
                subtitleElement.textContent = `Found ${docsFound} document(s) and ${videosFound} video(s).`;
            }
        } else {
            titleElement.textContent = "Search";
            subtitleElement.textContent = "Please enter a search term.";
            noResultsState.style.display = 'block';
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Let updateFileSizes handle file size updates after rendering
    }
    // ------------------------------------

    const urlParams = new URLSearchParams(window.location.search);
    const categoryQuery = urlParams.get('category');
    
    const filterSelect = document.getElementById('category-filter');
    // Must query documentItems AFTER they might have been dynamically added
    const documentItems = document.querySelectorAll('.document-item');
    const pageTitle = document.getElementById('docs-page-title');

    // Function to apply filter
    function filterDocuments(category) {
        let visibleCount = 0;
        
        documentItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || !category || itemCategory === category) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // Update Title
        if (pageTitle) {
            if (category && category !== 'all') {
                pageTitle.textContent = `${category} Documents`;
            } else {
                pageTitle.textContent = 'Available Documents';
            }
        }

        // Show empty state if no documents found
        const container = document.querySelector('.documents-container');
        let emptyState = document.getElementById('empty-state');
        
        if (visibleCount === 0) {
            if (!emptyState && container) {
                emptyState = document.createElement('div');
                emptyState.id = 'empty-state';
                emptyState.style.textAlign = 'center';
                emptyState.style.padding = '3rem';
                emptyState.style.color = 'var(--text-light)';
                emptyState.innerHTML = '<i data-lucide="folder-open" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i><p>No pdfs available<br>Coming soon</p>';
                container.appendChild(emptyState);
                lucide.createIcons();
            }
            if(emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
        }
    }

    // If there's a category in the URL, apply it
    if (categoryQuery && filterSelect) {
        // Find matching option (case insensitive just in case)
        Array.from(filterSelect.options).forEach(opt => {
            if (opt.value.toLowerCase() === categoryQuery.toLowerCase()) {
                filterSelect.value = opt.value;
                filterDocuments(opt.value);
            }
        });
    } else if (filterSelect) {
        // Initialize empty state if needed
        filterDocuments('all');
    }

    // Listen for dropdown changes
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const selectedCategory = e.target.value;
            filterDocuments(selectedCategory);
            
            // Update URL without reloading the page
            const newUrl = selectedCategory === 'all' 
                ? window.location.pathname 
                : `${window.location.pathname}?category=${encodeURIComponent(selectedCategory)}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        });
    }

    // File sizes are no longer displayed, so no need to fetch them

    // --- SCROLL ANIMATIONS ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply animation classes to elements
    const elementsToAnimate = [
        '.category-card',
        '.document-item',
        '.video-card',
        '.video-page-card',
        '.contact-card',
        '.section-title',
        '.hero-title',
        '.hero-subtitle'
    ];

    // Wait a tiny bit for dynamic content to be inserted before observing
    setTimeout(() => {
        elementsToAnimate.forEach(selector => {
            document.querySelectorAll(selector).forEach((el, index) => {
                el.classList.add('animate-on-scroll');
                // Staggering based on index for cards
                if (selector.includes('card') || selector.includes('item')) {
                    const delay = (index % 4) * 0.1;
                    el.style.transitionDelay = `${delay}s`;
                }
                observer.observe(el);
            });
        });
    }, 100);

});

