(() => {
  const questions = [{"text": "わたしのいちばん好きな食べ物、当ててみて", "deck": "カップル"}, {"text": "わたしのカバンに絶対入ってるもの、当ててみて", "deck": "カップル"}, {"text": "わたしが休日に時間を使ってるもの、何だと思う？", "deck": "カップル"}, {"text": "最近こっそりした無駄遣いを、白状して", "deck": "友達"}, {"text": "最近ハマってるものを、30秒でプレゼンして", "deck": "友達"}, {"text": "スマホで最近撮った写真を、見せて解説して", "deck": "友達"}, {"text": "最近楽しかったのはどんな時間？何があった？", "deck": "親と話す"}, {"text": "いま毎日、何に時間を使ってる？楽しい？", "deck": "親と話す"}, {"text": "体で気になっているところは？病院は行った？", "deck": "親と話す"}, {"text": "いま肩と奥歯、力が入ってない？ゆるめたら何が変わる？", "deck": "セルフケア"}, {"text": "今日は何時間眠れた？それは自分にとって十分？", "deck": "セルフケア"}, {"text": "今日ごはんはちゃんと食べた？味を覚えてる？", "deck": "セルフケア"}];
  let index = 0;
  const button = document.getElementById('next-card');
  const card = document.getElementById('demo-card');
  button.addEventListener('click', () => {
    index = (index + 1) % questions.length;
    document.getElementById('demo-question').textContent = questions[index].text;
    document.getElementById('demo-deck').textContent = questions[index].deck;
    document.getElementById('demo-count').textContent = `${String(index + 1).padStart(2, '0')} / ${questions.length}`;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && card.animate) {
      card.animate([{transform:'translateY(10px) rotate(-2deg)',opacity:.5},{transform:'translateY(0) rotate(0)',opacity:1}],{duration:340,easing:'ease-out'});
    }
  });
})();
