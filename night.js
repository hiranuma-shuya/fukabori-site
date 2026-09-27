(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduce.matches;
  let context;
  const flip = $('#hero-flip');
  flip.addEventListener('click', () => {
    const open = flip.getAttribute('aria-pressed') !== 'true';
    flip.setAttribute('aria-pressed', String(open));
    flip.setAttribute('aria-label', open ? 'カードを裏に戻す' : 'カードをめくって質問を見る');
  });

  $('#preview-card').addEventListener('click', () => flip.click());

  function setupMotion() {
    if (context) context.revert();
    document.body.classList.toggle('motion-paused', paused);
    $('#motion-toggle').setAttribute('aria-pressed', String(paused));
    $('#motion-toggle').innerHTML = paused ? '動きを再開 <span aria-hidden="true">▷</span>' : '動きを止める <span aria-hidden="true">Ⅱ</span>';
    window.dispatchEvent(new CustomEvent('fukabori:motion', {detail:{paused}}));
    if (!window.gsap || !window.ScrollTrigger) {return;}
    gsap.registerPlugin(ScrollTrigger);
    if (paused) {return;}
    context = gsap.context(() => {
      gsap.to('.reading-progress', {scaleX:1,ease:'none',scrollTrigger:{trigger:'body',start:'top top',end:'bottom bottom',scrub:true}});
      gsap.fromTo('.hero-copy h1>span', {y:35,opacity:0}, {y:0,opacity:1,duration:1.1,stagger:.14,ease:'power3.out'});
      gsap.fromTo('.hero-stack', {y:35,opacity:0}, {y:0,opacity:1,duration:1.5,ease:'power3.out'});
      gsap.to('.hero-stack', {y:-14,duration:3.4,yoyo:true,repeat:-1,ease:'sine.inOut'});
      gsap.to('.hero-object', {y:100,rotation:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-copy', {y:-65,opacity:.1,ease:'none',scrollTrigger:{trigger:'.hero',start:'15% top',end:'bottom 30%',scrub:1}});
      ['.section-heading','.deck-selectors','.question-sampler','.how-intro','.closing h2'].forEach(selector => {
        gsap.from(selector,{y:40,opacity:0,duration:1,ease:'power2.out',scrollTrigger:{trigger:selector,start:'top 92%',toggleActions:'play none none reverse'}});
      });
      gsap.fromTo('.phone-stage img',{rotationY:-24,rotationZ:14,y:60},{rotationY:8,rotationZ:-4,y:-20,ease:'none',scrollTrigger:{trigger:'.how',start:'top bottom',end:'bottom top',scrub:1}});
    });
    ScrollTrigger.refresh();
  }
  $('#motion-toggle').addEventListener('click', () => {paused = !paused;setupMotion();});
  reduce.addEventListener('change', () => {paused = reduce.matches;setupMotion();});
  if (matchMedia('(pointer:fine)').matches) {
    $('.hero-object').addEventListener('pointermove', event => {
      if (paused || !window.gsap) return;
      const box = $('.hero-object').getBoundingClientRect();
      gsap.to('#hero-stack',{rotationY:(event.clientX-box.left-box.width/2)/box.width*22,rotationX:-(event.clientY-box.top-box.height/2)/box.height*16,duration:.6,overwrite:'auto'});
    });
    $('.hero-object').addEventListener('pointerleave', () => {
      if (window.gsap) gsap.to('#hero-stack',{rotationY:0,rotationX:0,duration:1});
    });
  }

  const decks = {"self_v1": {"name": "セルフケア", "questions": ["いま肩と奥歯、力が入ってない？ゆるめたら何が変わる？", "今日は何時間眠れた？それは自分にとって十分？", "今日ごはんはちゃんと食べた？味を覚えてる？", "いま体でいちばん疲れている場所はどこ？触ってみて", "今日ほっとしたのはどの瞬間？何があった？"]}, "couple_v1": {"name": "カップル", "questions": ["わたしの第一印象、正直どうだった？いまとどんなふうに違う？", "ふたりの写真から1枚だけ残すなら、どれにする？", "もう一度そのまま過ごしたいデートって、どの日？", "わたしにまだ一度も言ってない、好きなところってある？"]}, "parents_v1": {"name": "親と話す", "questions": ["最近楽しかったのはどんな時間？何があった？", "いま毎日、何に時間を使ってる？楽しい？", "体で気になっているところは？病院は行った？", "最近会った人で印象に残ってるのは誰？何を話した？", "いま続けている習慣で、いちばん長いのは？"]}, "friends_v1": {"name": "友達", "questions": ["最近こっそりした無駄遣いを、白状して", "最近ハマってるものを、30秒でプレゼンして", "スマホで最近撮った写真を、見せて解説して", "学生時代のあだ名を、由来つきで", "この中の誰かと食べた中で、忘れられない飯は？"]}};
  let deckId = 'couple_v1';
  let sampleIndex = 0;
  function showSample() {
    const deck = decks[deckId];
    $('#sample-label').textContent = `${deck.name} / ${String(sampleIndex + 1).padStart(2,'0')}`;
    $('#sample-question').textContent = deck.questions[sampleIndex];
    if (!paused && window.gsap) gsap.fromTo('#sample-question',{y:12,opacity:0},{y:0,opacity:1,duration:.4,overwrite:true});
  }
  document.querySelectorAll('[data-deck]').forEach(button => button.addEventListener('click', () => {
    deckId = button.dataset.deck;
    sampleIndex = 0;
    document.querySelectorAll('[data-deck]').forEach(b => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    showSample();
  }));
  $('#next-question').addEventListener('click', () => {
    sampleIndex = (sampleIndex + 1) % decks[deckId].questions.length;
    showSample();
  });
  setupMotion();
  document.fonts?.ready.then(() => {if(window.ScrollTrigger) ScrollTrigger.refresh();});
  window.addEventListener('load', () => {if(window.ScrollTrigger) ScrollTrigger.refresh();}, {once:true});
})();
