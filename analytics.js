(() => {
  'use strict';
  // Local previews and browser QA must not become acquisition traffic.
  if (location.hostname !== 'hiranuma-shuya.github.io' || !location.pathname.startsWith('/fukabori-site/')) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
  const pending = [];
  let client;
  function track(event, properties = {}, outgoing = false) {
    if (!client) { if (pending.length < 30) pending.push([event, properties, outgoing]); return; }
    client.capture(event, properties, outgoing ? {transport: 'sendBeacon', send_instantly: true} : undefined);
  }
  document.addEventListener('click', event => {
    const cta = event.target.closest('[data-store-cta]');
    if (cta) track('lp_store_click', {cta_position: cta.dataset.storeCta}, true);
  });
  window.addEventListener('fukabori:preview', event => {
    track('lp_question_preview', event.detail);
  });
  // Record a section/CTA only after it stays in view for a second.
  if ('IntersectionObserver' in window) {
    const timers = new Map();
    const seen = new WeakSet();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const el = entry.target;
        clearTimeout(timers.get(el));
        timers.delete(el);
        if (!entry.isIntersecting || seen.has(el) || document.hidden) return;
        timers.set(el, setTimeout(() => {
          timers.delete(el);
          if (document.hidden) return;
          seen.add(el);
          const cta = el.dataset.storeCta;
          track(cta ? 'lp_cta_view' : 'lp_section_view', cta ? {cta_position: cta} : {section: el.closest('section').id});
          observer.unobserve(el);
        }, 1000));
      });
    }, {threshold: 0.5});
    document.querySelectorAll('[data-store-cta], #decks .section-heading, #hero h1').forEach(el => observer.observe(el));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { timers.forEach(clearTimeout); timers.clear(); }
      else document.querySelectorAll('[data-store-cta], #decks .section-heading, #hero h1').forEach(el => {
        if (!seen.has(el)) { observer.unobserve(el); observer.observe(el); }
      });
    });
  }
  const script = document.createElement('script');
  script.src = 'https://us-assets.i.posthog.com/static/array.js';
  script.async = true;
  script.onload = () => {
    if (!window.posthog?.init) return;
    window.posthog.init('phc_mdtMoTpNnozGdZeCLP4mNrGF9wFxScvhoNGW9rJ8dzfP', {
      api_host: 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
      respect_dnt: true,
      person_profiles: 'identified_only',
      capture_dead_clicks: false,
      disable_surveys: true,
      capture_performance: false,
      loaded: ph => {
        client = ph;
        ph.register({lp_version: 'acquisition-v1'});
        ph.capture('$pageview');
        pending.splice(0).forEach(args => track(...args));
      }
    });
  };
  document.head.appendChild(script);
})();
