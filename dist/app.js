const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label',open?'Close navigation':'Open navigation'); nav.classList.toggle('open',open); });
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));}); const filter=button.dataset.filter;document.querySelectorAll('[data-category]').forEach(item=>item.hidden=filter!=='all'&&item.dataset.category!==filter);document.querySelector('.project-grid').hidden=!['all','shopify','wordpress'].includes(filter);}));
const viewer=document.querySelector('#image-viewer');
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{viewer.querySelector('img').src=button.dataset.image;viewer.querySelector('img').alt=button.querySelector('img').alt;viewer.classList.toggle('email-viewer',Boolean(button.dataset.caption));viewer.querySelector('.viewer-caption').textContent=button.dataset.caption||'';viewer.showModal();}));
viewer.querySelector('button').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{const selected=[...document.querySelectorAll('input[name=services]')].find(i=>i.value===a.dataset.service);if(selected)selected.checked=true;}));
document.querySelector('#year').textContent=new Date().getFullYear();
const form=document.querySelector('#project-form');
const submitContent=form.querySelector('[type=submit]').innerHTML;
form.addEventListener('submit',async e=>{e.preventDefault();const status=form.querySelector('.form-status');const button=form.querySelector('[type=submit]');const data=new FormData(form);const services=data.getAll('services');status.classList.remove('error');if(!services.length){status.textContent='Please choose at least one service so I can point you in the right direction.';status.classList.add('error');form.querySelector('[name=services]').focus();return;}if(data.get('botcheck'))return;button.disabled=true;button.textContent='Sending your inquiry…';status.textContent='';try{const response=await fetch('https://api.web3forms.com/submit',{method:'POST',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json'},body:JSON.stringify({access_key:'2a819052-4ce1-426e-92ed-7fdc71a7ff6e',subject:'New project inquiry from '+data.get('name'),from_name:data.get('name'),name:data.get('name'),email:data.get('email'),services:services.join(', '),message:data.get('message')})});const result=await response.json();if(!response.ok||!result.success)throw new Error('Submission failed');status.textContent='Thanks for reaching out! Your inquiry has been sent. I’ll get back to you soon.';form.reset();}catch(error){status.classList.add('error');status.textContent='Your inquiry could not be sent. Please try again, or reach me through LinkedIn.';}finally{button.disabled=false;button.innerHTML=submitContent;}});

const moreDesigns=document.querySelector("#more-designs");moreDesigns.addEventListener("click",()=>{const open=moreDesigns.getAttribute("aria-expanded")!=="true";moreDesigns.setAttribute("aria-expanded",String(open));document.querySelectorAll(".extra-design").forEach(e=>e.hidden=!open);moreDesigns.innerHTML=open?"Show fewer designs <span>−</span>":"View more designs <span>+</span>";});

// Mirror the original navigation: a stronger glass halo after the first scroll.
(() => {
  const header = document.querySelector('.header');
  let frame = 0;
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
    frame = 0;
  };
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(updateHeader);
  }, { passive: true });
  window.addEventListener('pageshow', updateHeader);
  updateHeader();
})();
