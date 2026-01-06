(() => {
    const sections = document.querySelectorAll('.reveal');
    const header = document.querySelector('.header');
    const menuButton = document.querySelector('.header__menu-btn');
    const menuOverlay = document.querySelector('#site-menu');
    const hero = document.querySelector('.hero');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );

    sections.forEach((section) => observer.observe(section));

    const setMenuOpen = (open) => {
        if (!menuButton || !menuOverlay) {
            return;
        }
        menuOverlay.classList.toggle('menu--open', open);
        menuButton.classList.toggle('is-open', open);
        document.body.classList.toggle('menu-open', open);
        menuOverlay.setAttribute('aria-hidden', String(!open));
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute(
            'aria-label',
            open ? 'メニューを閉じる' : 'メニューを開く'
        );
    };

    const updateHeaderMode = () => {
        if (!header || !hero) {
            return;
        }
        const threshold = hero.offsetHeight * 0.5;
        const isMenuMode = window.scrollY > threshold;
        header.classList.toggle('header--menu', isMenuMode);
        if (!isMenuMode) {
            setMenuOpen(false);
        }
    };

    if (menuButton && menuOverlay) {
        menuButton.addEventListener('click', () => {
            const shouldOpen = !menuOverlay.classList.contains('menu--open');
            setMenuOpen(shouldOpen);
        });

        menuOverlay.addEventListener('click', (event) => {
            if (event.target === menuOverlay) {
                setMenuOpen(false);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuOverlay.classList.contains('menu--open')) {
                setMenuOpen(false);
            }
        });
    }

    window.addEventListener('scroll', updateHeaderMode, { passive: true });
    window.addEventListener('resize', updateHeaderMode);
    window.addEventListener('load', updateHeaderMode);
})();
