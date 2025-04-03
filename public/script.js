document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navbar = document.querySelector('.navbar');
    const body = document.body;

    // 햄버거 메뉴 버튼에 클릭 이벤트 추가
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    // 메뉴 항목 클릭 시 메뉴 닫기
    const menuItems = document.querySelectorAll('.mobile-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });

    // 스크롤 시 네비게이션 바 스타일 변경
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 화면 크기 변경 시 모바일 메뉴 상태 초기화
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });

    // 스크롤 이벤트 처리 (TOP 버튼)
    const topButton = document.querySelector('.top-fixed-btn');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 200) {
            topButton.classList.add('visible');
        } else {
            topButton.classList.remove('visible');
        }
    });

    // 부드러운 스크롤 처리
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 모바일 메뉴가 열려있다면 닫기
                if (mobileMenu.classList.contains('active')) {
                    mobileMenuBtn.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            }
        });
    });

    // 스크롤 인디케이터 클릭 시 다음 섹션으로 스크롤
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('section:nth-child(2)');
            nextSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 스크롤 시 요소 페이드인 효과
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 페이드인 효과를 적용할 요소들
    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

    // 숫자 카운트업 애니메이션
    const numberElements = document.querySelectorAll('.stat-number');
    const numberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetNumber = parseInt(target.getAttribute('data-target'));
                animateNumber(target, targetNumber);
                numberObserver.unobserve(target);
            }
        });
    }, observerOptions);

    numberElements.forEach(element => {
        numberObserver.observe(element);
    });

    // 스무스 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 모바일 메뉴 토글
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // 스크롤 시 헤더 스타일 변경
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // 스크롤 다운
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // 스크롤 업
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
});

// 숫자 카운트업 애니메이션 함수
function animateNumber(element, target) {
    let current = 0;
    const increment = target / 100;
    const duration = 2000; // 2초
    const stepTime = duration / 100;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// 케이스 스터디 슬라이더
class CaseSlider {
    constructor() {
        this.slider = document.querySelector('.cases-grid');
        this.slides = document.querySelectorAll('.case-card');
        this.currentSlide = 0;
        this.slideCount = this.slides.length;
        this.init();
    }

    init() {
        if (!this.slider || this.slideCount <= 3) return;

        // 슬라이더 컨트롤 버튼 추가
        const controls = document.createElement('div');
        controls.className = 'slider-controls';
        controls.innerHTML = `
            <button class="prev-btn"><i class="fas fa-chevron-left"></i></button>
            <button class="next-btn"><i class="fas fa-chevron-right"></i></button>
        `;
        this.slider.parentNode.appendChild(controls);

        // 이벤트 리스너 추가
        controls.querySelector('.prev-btn').addEventListener('click', () => this.prevSlide());
        controls.querySelector('.next-btn').addEventListener('click', () => this.nextSlide());

        // 자동 슬라이드
        setInterval(() => this.nextSlide(), 5000);
    }

    updateSlider() {
        const offset = -this.currentSlide * 100;
        this.slider.style.transform = `translateX(${offset}%)`;
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % (this.slideCount - 2);
        this.updateSlider();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + (this.slideCount - 3)) % (this.slideCount - 2);
        this.updateSlider();
    }
}

// 케이스 스터디 슬라이더 초기화
document.addEventListener('DOMContentLoaded', function() {
    new CaseSlider();
});

// 모바일 메뉴 토글
const menuButton = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuButton && navMenu) {
    menuButton.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuButton.classList.toggle('active');
    });
}

// 스크롤 시 헤더 스타일 변경
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 성능 최적화
document.addEventListener('scroll', function() {
    requestAnimationFrame(function() {
        // 스크롤 이벤트 최적화
    });
}, { passive: true }); 