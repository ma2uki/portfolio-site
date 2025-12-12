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
