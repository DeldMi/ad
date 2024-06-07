(function() {
    'use strict';

    // Ad selectors
    const cssSelectorArr = [
        '#masthead-ad', // Top banner ad on the homepage.
        'ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)', // Video ads on the homepage.
        '.video-ads.ytp-ad-module', // Bottom ad in the video player.
        'tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)', // Membership promotion ad on the video page.
        'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]', // Recommended ads on the top right of the video page.
        '#related #player-ads', // Promotional ads on the right side of the comment section.
        '#related ytd-ad-slot-renderer', // Video ads on the right side of the comment section.
        'ytd-ad-slot-renderer', // Ads on the search page.
        'yt-mealbar-promo-renderer', // Membership recommendation ad on the video page.
        'ad-slot-renderer', // Third-party recommended ads on the video page.
        'ytm-companion-ad-renderer', // Skipable video ad link on mobile.
    ];

    window.dev = false; // For development use

    /**
    * Format standard time
    * @param {Date} time - Standard time
    * @return {String}
    */
    function moment(time) {
        const y = time.getFullYear();
        const m = (time.getMonth() + 1).toString().padStart(2, '0');
        const d = time.getDate().toString().padStart(2, '0');
        const h = time.getHours().toString().padStart(2, '0');
        const min = time.getMinutes().toString().padStart(2, '0');
        const s = time.getSeconds().toString().padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }

    /**
    * Log message
    * @param {String} msg - Message
    */
    function log(msg) {
        if (!window.dev) return;
        console.log(window.location.href);
        console.log(`${moment(new Date())} ${msg}`);
    }

    /**
    * Set run flag
    * @param {String} name
    */
    function setRunFlag(name) {
        const style = document.createElement('style');
        style.id = name;
        (document.querySelector('head') || document.querySelector('body')).appendChild(style);
    }

    /**
    * Get run flag
    * @param {String} name
    * @return {Element}
    */
    function getRunFlag(name) {
        return document.getElementById(name);
    }

    /**
    * Check if run flag is set
    * @param {String} name
    * @return {Boolean}
    */
    function checkRunFlag(name) {
        if (getRunFlag(name)) {
            return true;
        } else {
            setRunFlag(name);
            return false;
        }
    }

    /**
    * Create and append ad removal CSS
    * @param {String} id
    */
    function generateRemoveADHTMLElement(id) {
        if (checkRunFlag(id)) {
            log('Ad removal element already created');
            return;
        }

        const style = document.createElement('style');
        (document.querySelector('head') || document.querySelector('body')).appendChild(style);
        style.appendChild(document.createTextNode(generateRemoveADCssText(cssSelectorArr)));
        log('Ad removal element created successfully');
    }

    /**
    * Generate CSS text to remove ads
    * @param {Array} cssSelectorArr - Array of CSS selectors
    * @return {String}
    */
    function generateRemoveADCssText(cssSelectorArr) {
        return cssSelectorArr.map(selector => `${selector}{display:none!important}`).join(' ');
    }

    /**
    * Simulate touch event
    */
    function nativeTouch() {
        const touch = new Touch({
            identifier: Date.now(),
            target: this,
            clientX: 12,
            clientY: 34,
            radiusX: 56,
            radiusY: 78,
            rotationAngle: 0,
            force: 1
        });

        const touchStartEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            view: window,
            touches: [touch],
            targetTouches: [touch],
            changedTouches: [touch]
        });

        this.dispatchEvent(touchStartEvent);

        const touchEndEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            view: window,
            touches: [],
            targetTouches: [],
            changedTouches: [touch]
        });

        this.dispatchEvent(touchEndEvent);
    }

    /**
    * Skip ads
    * @param {Array} mutationsList - List of mutations
    * @param {MutationObserver} observer - Mutation observer
    */
    function skipAd(mutationsList, observer) {
        const video = document.querySelector('.ad-showing video') || document.querySelector('video');
        const skipButton = document.querySelector('.ytp-ad-skip-button') || document.querySelector('.ytp-skip-ad-button') || document.querySelector('.ytp-ad-skip-button-modern');
        const shortAdMsg = document.querySelector('.video-ads.ytp-ad-module .ytp-ad-player-overlay') || document.querySelector('.ytp-ad-button-icon');

        if (skipButton) {
            if (window.location.href.indexOf("https://m.youtube.com/") === -1) {
                video.muted = true;
            }
            if (video.currentTime > 0.5) {
                video.currentTime = video.duration;
                log('Skipped button ad');
                return;
            }
            skipButton.click();
            nativeTouch.call(skipButton);
            log('Skipped ad using button');
        } else if (shortAdMsg) {
            video.currentTime = video.duration;
            log('Forced end of ad');
        } else {
            log('No ad found');
        }
    }

    /**
    * Remove in-player ads
    * @param {String} id
    */
    function removePlayerAD(id) {
        if (checkRunFlag(id)) {
            log('In-player ad removal is already running');
            return;
        }
        let observer;
        let timerID;

        function startObserve() {
            const targetNode = document.querySelector('.video-ads.ytp-ad-module');
            if (!targetNode) {
                log('Searching for target node');
                return;
            }
            const config = { childList: true, subtree: true };
            observer = new MutationObserver(skipAd);
            observer.observe(targetNode, config);
            timerID = setInterval(skipAd, 500);
        }

        const startObserveID = setInterval(() => {
            if (observer && timerID) {
                clearInterval(startObserveID);
            } else {
                startObserve();
            }
        }, 16);

        log('Running in-player ad removal successfully');
    }

    /**
    * Main function
    */
    function main() {
        generateRemoveADHTMLElement('removeADHTMLElement');
        removePlayerAD('removePlayerAD');
    }

    if (document.readyState === 'loading') {
        log('YouTube AD Blocker script is about to run:');
        document.addEventListener('DOMContentLoaded', main);
    } else {
        log('YouTube AD Blocker script running quickly:');
        main();
    }

})();
