class PremiumFeatures {
    constructor() {
        this.init();
    }

    init() {
        this.addScrollAnimations();
        this.addParticleBackground();
        this.addSmoothScrolling();
        this.addKeyboardShortcuts();
        this.addProgressiveImageLoading();
    }

    addScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.mode-card, .movie-card, .carousel-section').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });
    }

    addParticleBackground() {
        const canvas = document.createElement('canvas');
        canvas.className = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.3;
        `;
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            };
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        }

        resizeCanvas();
        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }
        animate();

        window.addEventListener('resize', resizeCanvas);
    }

    addSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        document.getElementById('search-input')?.focus();
                        break;
                    case 't':
                        e.preventDefault();
                        document.getElementById('theme-toggle')?.click();
                        break;
                }
            }
            if (e.key === 'Escape') {
                const modal = document.querySelector('.movie-modal.active');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
        });
    }

    addProgressiveImageLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img').forEach(img => {
            img.style.transition = 'opacity 0.3s ease';
            img.classList.add('lazy-load');
            imageObserver.observe(img);
        });
    }
}

// Initialize premium features
document.addEventListener('DOMContentLoaded', () => {
    new PremiumFeatures();
});