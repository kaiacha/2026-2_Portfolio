(function () {
  const GA_MEASUREMENT_ID = 'G-92L4EEV0RP';
  const isConfigured = /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  const isFramed = window.self !== window.top;
  const pagePath = window.location.pathname.replace(/\/index\.html$/, '/') || '/';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  function sendEvent(name, params) {
    if (!isConfigured || typeof window.gtag !== 'function') return;
    window.gtag('event', name, {
      page_path: pagePath,
      page_title: document.title,
      engagement_context: isFramed ? 'embedded_home' : 'top_level',
      ...params,
    });
  }

  window.kaiaTrack = sendEvent;

  if (!isConfigured) {
    console.info('[analytics] Add your GA4 Measurement ID in analytics.js to enable tracking.');
  } else {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: !isFramed,
      page_title: document.title,
      page_path: pagePath,
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const seenSections = new Set();
    const scrollDepths = new Set();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.45) return;
            const section = entry.target.getAttribute('data-screen-label') || entry.target.id;
            if (!section || seenSections.has(section)) return;
            seenSections.add(section);
            sendEvent('portfolio_section_view', {
              section_name: section,
              section_id: entry.target.id || '',
            });
          });
        },
        { threshold: [0.45, 0.65] }
      );

      document.querySelectorAll('section[id], [data-screen-label]').forEach(function (section) {
        observer.observe(section);
      });
    }

    function onScrollDepth() {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const percent = Math.min(100, Math.round((window.scrollY / max) * 100));
      [25, 50, 75, 90].forEach(function (depth) {
        if (percent >= depth && !scrollDepths.has(depth)) {
          scrollDepths.add(depth);
          sendEvent('scroll_depth', { percent_scrolled: depth });
        }
      });
    }

    window.addEventListener('scroll', onScrollDepth, { passive: true });
    onScrollDepth();

    document.addEventListener('click', function (event) {
      const target = event.target.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      const label = (target.getAttribute('aria-label') || target.getAttribute('title') || target.textContent || '').trim();
      const card = target.closest('.ux-project-card, .hci-project-row');

      if (card) {
        const title = card.querySelector('.ux-project-copy span:nth-child(2), .hci-project-copy span:nth-child(2)')?.textContent?.trim() || label;
        sendEvent('project_card_click', {
          project_title: title,
          project_category: card.classList.contains('hci-project-row') ? 'HCI' : 'UX',
          link_url: href,
        });
        return;
      }

      if (target.closest('nav') || href.startsWith('#') || href.includes('/Home/#')) {
        sendEvent('navigation_click', {
          navigation_label: label,
          link_url: href,
        });
      }

      if (href.startsWith('mailto:')) {
        sendEvent('contact_click', {
          contact_method: 'email',
          link_url: href,
        });
      } else if (href.includes('drive.google.com')) {
        sendEvent('cv_click', { link_url: href });
      } else if (/^https?:\/\//.test(href) && !href.includes(window.location.hostname)) {
        sendEvent('outbound_link_click', {
          link_text: label,
          link_url: href,
        });
      }

      if (label.toLowerCase() === 'back' || target.getAttribute('aria-label') === 'Back to portfolio') {
        sendEvent('case_study_back_click', { link_url: href });
      }
    });
  });
})();
