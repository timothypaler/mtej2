const progress = document.querySelector('.page-progress span');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.topnav');
const hero = document.querySelector('.hero');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('.lightbox-stage p');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.transform = `scaleX(${ratio})`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

menuButton?.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

  hero?.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    hero.style.setProperty('--mx', `${x}%`);
    hero.style.setProperty('--my', `${y}%`);
  });
}

document.querySelectorAll('.record').forEach((record) => {
  record.addEventListener('toggle', () => {
    if (!record.open) return;
    document.querySelectorAll('.record[open]').forEach((other) => {
      if (other !== record) other.removeAttribute('open');
    });
  });
});

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector('img')?.alt || '';
    lightboxCaption.textContent = button.dataset.caption || '';
    lightbox.showModal();
  });
});

lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox?.open) lightbox.close();
});

const ejAudio=document.querySelector('#ej-audio');
const musicButton=document.querySelector('#music-toggle');
const volumeControl=document.querySelector('#music-volume');
const musicStatus=document.querySelector('#music-status');
let activeMusicTerm='midterms',manuallyPaused=false,musicAttempt=0;
ejAudio.volume=.4;
function updateMusic(){musicButton.textContent=ejAudio.paused?'Play ▶':'Pause Ⅱ';musicButton.setAttribute('aria-pressed',String(!ejAudio.paused));musicButton.setAttribute('aria-label',ejAudio.paused?'Play High Hopes':'Pause High Hopes');}
function attemptMusic(){if(activeMusicTerm!=='midterms'||manuallyPaused)return;const attempt=++musicAttempt;ejAudio.play().then(()=>{if(attempt===musicAttempt)musicStatus.textContent='';}).catch(()=>{if(attempt===musicAttempt)musicStatus.textContent='Tap anywhere or press Play to start music.';});}
function syncEJMusic(term,userAction){activeMusicTerm=term;if(term==='prelims'){++musicAttempt;ejAudio.pause();musicStatus.textContent='';document.querySelector('#music-label').textContent='MIDTERMS SOUNDTRACK · PAUSED';}else{document.querySelector('#music-label').textContent='MIDTERMS SOUNDTRACK';if(userAction)manuallyPaused=false;attemptMusic();}}
musicButton.addEventListener('click',()=>{if(ejAudio.paused){if(activeMusicTerm!=='midterms')selectEJTerm('midterms');manuallyPaused=false;attemptMusic();}else{manuallyPaused=true;++musicAttempt;ejAudio.pause();}});
ejAudio.addEventListener('play',updateMusic);ejAudio.addEventListener('pause',updateMusic);volumeControl.addEventListener('input',()=>ejAudio.volume=Number(volumeControl.value)/100);
function unlockMusic(event){if(event.target?.closest?.('.ej-music')||event.target?.closest?.('[data-select-term]'))return;if(ejAudio.paused)attemptMusic();}
document.addEventListener('pointerdown',unlockMusic,{passive:true});document.addEventListener('keydown',unlockMusic);window.addEventListener('pageshow',()=>{if(ejAudio.paused)attemptMusic();});

const ejTermButtons=[...document.querySelectorAll('[data-select-term]')];
function selectEJTerm(term,write=true){
 if(!['prelims','midterms'].includes(term))term='midterms';
 syncEJMusic(term,write);
 document.querySelectorAll('[data-term]').forEach(p=>p.hidden=p.dataset.term!==term);
 document.querySelectorAll('[data-reflection-term]').forEach(p=>p.hidden=p.dataset.reflectionTerm!==term);
 ejTermButtons.forEach(b=>{const active=b.dataset.selectTerm===term;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
 document.querySelector('.ej-term-status').textContent=`Viewing ${term==='midterms'?'Midterms':'Prelims'} · 2026`;
 document.querySelectorAll('.topnav a,.section-rail a').forEach(a=>{const base=a.getAttribute('href').replace('-midterms','');if(['#learning','#reflection'].includes(base))a.setAttribute('href',term==='midterms'?base+'-midterms':base)});
 updateProgress();
 if(write){const url=new URL(location.href);url.searchParams.set('term',term);history.replaceState(null,'',url)}
}
ejTermButtons.forEach((b,i)=>{
 b.addEventListener('click',()=>selectEJTerm(b.dataset.selectTerm));
 b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?1:1-i;selectEJTerm(ejTermButtons[n].dataset.selectTerm);ejTermButtons[n].focus()});
});
selectEJTerm(new URLSearchParams(location.search).get('term'),false);
window.addEventListener('popstate',()=>selectEJTerm(new URLSearchParams(location.search).get('term'),false));
