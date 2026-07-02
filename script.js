document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    const mobileLinks = document.querySelectorAll('.nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Close menu when clicking the close button
    const closeBtn = document.querySelector('.close-menu');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    }

    // --- Scroll to Explore Logic ---
    const scrollExploreBtn = document.getElementById('scrollExploreBtn');
    if (scrollExploreBtn) {
        scrollExploreBtn.addEventListener('click', () => {
            const nextSection = document.getElementById('projects');
            if (nextSection) {
                // Offset by navbar height (approx 100px)
                const offsetTop = nextSection.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }

    // --- Reusable Infinite Carousel Logic ---
    function initInfiniteCarousel(trackId, containerSelector, isLogoCarousel = false, desktopItems = 3) {
        const track = document.getElementById(trackId);
        const container = document.querySelector(containerSelector);
        
        if (!track || !container) return;

        let originalSlides = Array.from(track.children);
        const originalLength = originalSlides.length;
        
        // Clone slides for seamless infinite looping
        originalSlides.forEach(slide => {
            const clone = slide.cloneNode(true);
            track.appendChild(clone);
        });
        originalSlides.forEach(slide => {
            const clone = slide.cloneNode(true);
            track.insertBefore(clone, track.firstChild);
        });
        
        let slides = track.children;
        let currentIndex = originalLength; // Start at the original set (middle)
        const gap = isLogoCarousel ? 64 : 24; // 4rem for logos, 1.5rem (24px) for featured images
        let slideWidth = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let autoPlayInterval;

        function updateSlideWidths() {
            const containerWidth = container.clientWidth;
            if (isLogoCarousel) {
                // Determine logo widths depending on screen size
                if (window.innerWidth <= 768) {
                    slideWidth = (containerWidth - gap) / 2;
                } else {
                    slideWidth = (containerWidth - (gap * (desktopItems - 1))) / desktopItems;
                }
            } else {
                if (window.innerWidth <= 768) {
                    slideWidth = (containerWidth - gap) / 1.5;
                } else {
                    slideWidth = (containerWidth - (gap * (desktopItems - 1))) / desktopItems;
                }
            }
            
            Array.from(slides).forEach(slide => {
                slide.style.width = `${slideWidth}px`;
                slide.style.flexShrink = '0';
            });
            setPositionByIndex(currentIndex, false);
        }

        function setPositionByIndex(index, transition = true) {
            currentIndex = index;
            currentTranslate = currentIndex * (slideWidth + gap) * -1;
            prevTranslate = currentTranslate;
            
            if (transition) {
                track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                track.style.transition = 'none';
            }
            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        function slideNext() {
            setPositionByIndex(currentIndex + 1, true);
        }

        function slidePrev() {
            setPositionByIndex(currentIndex - 1, true);
        }

        // Infinite loop jumping
        track.addEventListener('transitionend', () => {
            if (currentIndex >= originalLength * 2) {
                setPositionByIndex(currentIndex - originalLength, false);
            } else if (currentIndex < originalLength) {
                setPositionByIndex(currentIndex + originalLength, false);
            }
        });

        // Autoplay
        function startAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(slideNext, 3000);
        }
        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }
        startAutoPlay();

        // Manual Drag Logic
        track.addEventListener('mousedown', dragStart);
        track.addEventListener('touchstart', dragStart, {passive: true});
        track.addEventListener('mouseup', dragEnd);
        track.addEventListener('mouseleave', dragEnd);
        track.addEventListener('touchend', dragEnd);
        track.addEventListener('mousemove', dragAction);
        track.addEventListener('touchmove', dragAction, {passive: true});

        function dragStart(e) {
            stopAutoPlay();
            isDragging = true;
            startPos = getPositionX(e);
            track.style.transition = 'none';
        }

        function dragAction(e) {
            if (!isDragging) return;
            const currentPosition = getPositionX(e);
            const diff = currentPosition - startPos;
            currentTranslate = prevTranslate + diff;
            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            
            const movedBy = currentTranslate - prevTranslate;
            const threshold = slideWidth / 4; // Move 25% to snap
            
            if (movedBy < -threshold) {
                slideNext();
            } else if (movedBy > threshold) {
                slidePrev();
            } else {
                setPositionByIndex(currentIndex, true);
            }
            startAutoPlay();
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        updateSlideWidths();
        window.addEventListener('resize', updateSlideWidths);
    }

    // Initialize all carousels
    initInfiniteCarousel('featuredTrack', '.featured-carousel-container', false);
    initInfiniteCarousel('pressTrack', '.press-carousel-container', true);
    initInfiniteCarousel('processTrack', '.process-carousel-container', false);
    initInfiniteCarousel('btsTrack', '.bts-carousel-container', false, 5);

    // --- Accordion Logic ---
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion-btn');
        const content = item.querySelector('.accordion-content');
        
        button.addEventListener('click', () => {
            // Close other items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // Open first accordion item by default
    if(accordionItems.length > 0) {
        accordionItems[0].classList.add('active');
        const firstContent = accordionItems[0].querySelector('.accordion-content');
        firstContent.style.maxHeight = firstContent.scrollHeight + "px";
    }

    // --- Scroll to Top Logic ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
