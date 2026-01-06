(() => {
    const hero = document.querySelector('.hero');

    if (hero) {
        let currentLayer = hero.querySelector('.hero__layer--current');
        let nextLayer = hero.querySelector('.hero__layer--next');

        const heroImages = [
            'assets/images/hero/hero-slide-01-exterior.jpg',
            'assets/images/hero/hero-slide-02-Onsen.jpg',
            'assets/images/hero/hero-slide-03-stonewall.jpg',
            'assets/images/hero/hero-slide-04-river.jpg',
            'assets/images/hero/hero-slide-05-forest.jpg',
            'assets/images/hero/hero-slide-06-stoneSteps.jpg',
            'assets/images/hero/hero-slide-07-roof.jpg',
            'assets/images/hero/hero-slide-08-AutumnleavesandRooftops.jpg',
            'assets/images/hero/hero-slide-09-Bamboopipe.jpg',
            'assets/images/hero/hero-slide-10-Onsenhotel.jpg'
        ];

        const slideDuration = 15000;
        const fadeDuration = 5000;
        const holdDuration = Math.max(slideDuration - fadeDuration, 1000);
        const initialDelay = 1200;

        hero.style.setProperty('--hero-slide-duration', `${slideDuration}ms`);
        hero.style.setProperty('--hero-fade-duration', `${fadeDuration}ms`);

        const imageCache = new Map();

        const createImageRecord = (src) => {
            const img = new Image();
            const record = {
                img,
                loaded: false,
                failed: false,
                promise: null
            };

            record.promise = new Promise((resolve) => {
                img.onload = () => {
                    record.loaded = true;
                    resolve(record);
                };
                img.onerror = () => {
                    record.failed = true;
                    resolve(record);
                };
            });

            img.decoding = 'async';
            img.loading = 'eager';
            img.src = src;

            if (img.complete && img.naturalWidth > 0) {
                record.loaded = true;
            }

            return record;
        };

        const getImageRecord = (src) => imageCache.get(src);

        const waitForImage = (src, callback) => {
            const record = getImageRecord(src);
            if (!record) {
                callback(false);
                return;
            }
            if (record.loaded) {
                callback(true);
                return;
            }
            if (record.failed) {
                callback(false);
                return;
            }
            record.promise.then(() => callback(record.loaded));
        };

        const shuffle = (array) => {
            const arr = array.slice();
            for (let i = arr.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        let order = shuffle(heroImages);
        let index = 0;
        let timerId = null;
        let isRunning = false;
        let isTransitioning = false;
        let pendingImage = null;

        const setLayerImage = (layer, src) => {
            layer.style.backgroundImage = `url("${src}")`;
        };

        const restartPan = (layer) => {
            layer.classList.remove('is-active');
            void layer.offsetWidth;
            layer.classList.add('is-active');
        };

        const getNextImage = () => {
            index += 1;
            if (index >= order.length) {
                order = shuffle(heroImages);
                index = 0;
            }
            return order[index];
        };

        if (currentLayer && nextLayer) {
            currentLayer.style.zIndex = '1';
            nextLayer.style.zIndex = '0';

            heroImages.forEach((src) => {
                if (!imageCache.has(src)) {
                    imageCache.set(src, createImageRecord(src));
                }
            });

            const step = () => {
                if (document.hidden) {
                    isRunning = false;
                    timerId = null;
                    return;
                }

                const nextImage = getNextImage();
                if (isTransitioning) {
                    return;
                }
                isTransitioning = true;
                pendingImage = nextImage;

                const outgoing = currentLayer;
                const incoming = nextLayer;

                waitForImage(nextImage, (loaded) => {
                    if (!isRunning || pendingImage !== nextImage) {
                        isTransitioning = false;
                        return;
                    }
                    if (!loaded) {
                        isTransitioning = false;
                        timerId = window.setTimeout(step, 600);
                        return;
                    }

                    setLayerImage(incoming, nextImage);

                    incoming.style.zIndex = '1';
                    outgoing.style.zIndex = '0';

                    incoming.classList.add('is-visible');
                    restartPan(incoming);
                    window.requestAnimationFrame(() => {
                        outgoing.classList.remove('is-visible');
                    });
                    window.setTimeout(() => {
                        outgoing.classList.remove('is-active');
                    }, fadeDuration);

                    currentLayer = incoming;
                    nextLayer = outgoing;

                    isTransitioning = false;
                    timerId = window.setTimeout(step, holdDuration);
                });
            };

            const startCycle = () => {
                if (isRunning || document.hidden) {
                    return;
                }
                isRunning = true;
                const firstImage = order[0];
                pendingImage = firstImage;
                if (!currentLayer.classList.contains('is-visible')) {
                    waitForImage(firstImage, (loaded) => {
                        if (!isRunning || pendingImage !== firstImage) {
                            return;
                        }
                        if (!loaded) {
                            timerId = window.setTimeout(startCycle, 600);
                            return;
                        }
                        setLayerImage(currentLayer, firstImage);
                        currentLayer.classList.add('is-visible');
                        window.requestAnimationFrame(() => restartPan(currentLayer));
                        timerId = window.setTimeout(step, initialDelay);
                    });
                    return;
                }
                timerId = window.setTimeout(step, initialDelay);
            };

            const stopCycle = () => {
                if (timerId) {
                    window.clearTimeout(timerId);
                    timerId = null;
                }
                isRunning = false;
            };

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopCycle();
                } else {
                    startCycle();
                }
            });

            window.addEventListener('focus', startCycle);
            window.addEventListener('pageshow', startCycle);
            window.addEventListener('pagehide', stopCycle);

            startCycle();
        }
    }
})();
