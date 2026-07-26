// Update year in footer
document.addEventListener('DOMContentLoaded', function () {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Initialize carousels
    initCarousels();
});

// Carousel functionality
function initCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
        const carouselId = carousel.getAttribute('data-carousel');
        const items = carousel.querySelectorAll('.carousel-item');
        const dotsContainer = document.querySelector(`[data-carousel-dots="${carouselId}"]`);
        const prevBtn = document.querySelector(`[data-carousel-prev="${carouselId}"]`);
        const nextBtn = document.querySelector(`[data-carousel-next="${carouselId}"]`);
        
        let currentIndex = 0;
        let startX = 0;
        let endX = 0;
        
        function updateCarousel() {
            const offset = -currentIndex * 100;
            carousel.style.transform = `translateX(${offset}%)`;
            
            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.carousel-dot');
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % items.length;
            updateCarousel();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel();
        }
        
        // Event listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        // Dot click handlers
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentIndex = index;
                    updateCarousel();
                });
            });
        }
        
        // Swipe functionality
        const carouselElement = carousel.closest('.carousel');
        if (carouselElement) {
            carouselElement.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, false);
            
            carouselElement.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                handleSwipe();
            }, false);
            
            carouselElement.addEventListener('mousedown', (e) => {
                startX = e.clientX;
            }, false);
            
            carouselElement.addEventListener('mouseup', (e) => {
                endX = e.clientX;
                handleSwipe();
            }, false);
        }
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swiped left, show next slide
                    nextSlide();
                } else {
                    // Swiped right, show previous slide
                    prevSlide();
                }
            }
        }
        
        // Auto-advance carousel every 5 seconds (optional)
        // setInterval(nextSlide, 5000);
    });
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation to elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(section);
});

// ブログカルーセル機能
let blogCurrentIndex = 0;
let blogTouchStartX = 0;
let blogTouchEndX = 0;

async function initBlogCarousel() {
    try {
        const response = await fetch('./data/index.json');
        const data = await response.json();
        
        // articles 配列が存在するかチェック
        const articles = data.articles || data;
        if (!Array.isArray(articles)) {
            console.log('No articles array found');
            return;
        }
        
        // 日付でソートして最新3件を取得
        const sortedArticles = articles
            .sort((a, b) => {
                const dateA = new Date(a.update || a.date);
                const dateB = new Date(b.update || b.date);
                return dateB - dateA;
            })
            .slice(0, 3);
        
        if (sortedArticles.length === 0) {
            console.log('No articles found');
            return;
        }
        
        const container = document.getElementById('blog-carousel');
        const dotsContainer = document.getElementById('blog-carousel-dots');
        
        if (!container || !dotsContainer) {
            console.log('Blog carousel containers not found');
            return;
        }
        
        // カルーセルアイテムを生成
        sortedArticles.forEach((article, index) => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            
            const card = document.createElement('a');
            card.href = article.path;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.style.display = 'block';
            
            const dateStr = new Date(article.update || article.date).toLocaleDateString('ja-JP');
            const updateStr = article.update ? `更新: ${dateStr}` : `公開: ${dateStr}`;
            
            card.innerHTML = `
                <div class="blog-card">
                    <img src="${article.image}" alt="${article.title}" class="blog-card-image" onerror="this.src='./assets/image/placeholder.png'">
                    <h3>${article.title}</h3>
                    <div class="blog-card-meta">
                        <div class="blog-card-date">
                            <span class="label">${updateStr}</span>
                        </div>
                    </div>
                    <p>${article.description}</p>
                </div>
            `;
            
            item.appendChild(card);
            container.appendChild(item);
            
            // ドットを生成
            const dot = document.createElement('span');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.addEventListener('click', () => showBlogSlide(index));
            dotsContainer.appendChild(dot);
        });
        
        // カルーセル操作
        const prevBtn = document.getElementById('blog-carousel-prev');
        const nextBtn = document.getElementById('blog-carousel-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => prevBlogSlide());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => nextBlogSlide());
        }
        
        // スワイプ対応
        container.addEventListener('touchstart', (e) => {
            blogTouchStartX = e.touches[0].clientX;
        }, false);
        
        container.addEventListener('touchend', (e) => {
            blogTouchEndX = e.changedTouches[0].clientX;
            handleBlogSwipe();
        }, false);
        
    } catch (error) {
        console.error('Error loading blog data:', error);
    }
}

function showBlogSlide(index) {
    const container = document.getElementById('blog-carousel');
    const dots = document.querySelectorAll('#blog-carousel-dots .carousel-dot');
    const items = container.querySelectorAll('.carousel-item');
    
    if (items.length === 0) return;
    
    if (index >= items.length) {
        blogCurrentIndex = 0;
    } else if (index < 0) {
        blogCurrentIndex = items.length - 1;
    } else {
        blogCurrentIndex = index;
    }
    
    const offset = -blogCurrentIndex * 100;
    container.style.transform = `translateX(${offset}%)`;
    
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[blogCurrentIndex]) {
        dots[blogCurrentIndex].classList.add('active');
    }
}

function nextBlogSlide() {
    showBlogSlide(blogCurrentIndex + 1);
}

function prevBlogSlide() {
    showBlogSlide(blogCurrentIndex - 1);
}

function handleBlogSwipe() {
    const swipeThreshold = 50;
    const diff = blogTouchStartX - blogTouchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextBlogSlide();
        } else {
            prevBlogSlide();
        }
    }
}

// ページ読み込み時にブログカルーセルを初期化
document.addEventListener('DOMContentLoaded', () => {
    initBlogCarousel();
});
