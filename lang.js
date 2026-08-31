/* Bilingual controller — English is the default; Arabic is an optional view.
   Markup contract:  <el data-en="English copy" data-ar="النص العربي">
   Attributes:       <el data-en-attr="aria-label|English" data-ar-attr="aria-label|عربي">  */
(function(){
  const KEY = "alrayan:lang";
  const listeners = [];

  const read = () => { try{ return localStorage.getItem(KEY); }catch{ return null; } };
  const write = v => { try{ localStorage.setItem(KEY, v); }catch{} };

  function apply(lang){
    const ar = lang === "ar";
    const root = document.documentElement;
    root.lang = ar ? "ar" : "en";
    root.dir  = ar ? "rtl" : "ltr";

    document.querySelectorAll("[data-en]").forEach(el => {
      const v = el.getAttribute(ar ? "data-ar" : "data-en");
      if(v !== null) el.textContent = v;
    });
    document.querySelectorAll("[data-en-attr]").forEach(el => {
      const v = el.getAttribute(ar ? "data-ar-attr" : "data-en-attr");
      if(v === null) return;
      const i = v.indexOf("|");
      if(i > 0) el.setAttribute(v.slice(0, i), v.slice(i + 1));
    });

    const desc = document.querySelector('meta[name="description"]');
    if(desc && desc.dataset.en) desc.content = ar ? desc.dataset.ar : desc.dataset.en;

    write(lang);
    listeners.forEach(fn => { try{ fn(lang); }catch{} });
  }

  const param = new URLSearchParams(location.search).get("lang");
  const initial = (param === "ar" || param === "en") ? param
                : (read() === "ar" ? "ar" : "en");   // English by default

  window.Lang = {
    get current(){ return document.documentElement.lang === "ar" ? "ar" : "en"; },
    is(l){ return this.current === l; },
    set(l){ apply(l === "ar" ? "ar" : "en"); },
    toggle(){ this.set(this.current === "ar" ? "en" : "ar"); },
    onChange(fn){ listeners.push(fn); },
    t(en, ar){ return this.current === "ar" ? ar : en; },
    init(){ apply(initial); }
  };
})();
