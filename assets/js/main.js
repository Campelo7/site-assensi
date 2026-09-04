/* Assensi Derm — interactions (vanilla, lightweight) */
(function(){
  "use strict";
  var header = document.getElementById("header");
  var toTop = document.getElementById("toTop");
  var onScroll = function(){
    if(window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    if(toTop){
      if(window.scrollY > 600) toTop.classList.add("show");
      else toTop.classList.remove("show");
    }
  };
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
  if(toTop){
    toTop.addEventListener("click", function(){
      window.scrollTo({top:0, behavior:"smooth"});
    });
  }

  // Mobile menu
  var burger = document.getElementById("burger");
  var mmenu = document.getElementById("mmenu");
  var mclose = document.getElementById("mclose");
  function setMenu(open){
    mmenu.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    burger.setAttribute("aria-expanded", String(open));
    if(open){ mclose.focus(); } else { burger.focus(); }
  }
  burger.addEventListener("click", function(){ setMenu(true); });
  mclose.addEventListener("click", function(){ setMenu(false); });
  mmenu.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ setMenu(false); document.body.style.overflow=""; });
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && mmenu.classList.contains("open")){ setMenu(false); document.body.style.overflow=""; }
  });

  // Reveal on scroll (com fallback se IO indisponível)
  var revealEls = document.querySelectorAll(".reveal,.reveal-img");
  if(!("IntersectionObserver" in window)){
    revealEls.forEach(function(el){ el.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, {threshold:.12, rootMargin:"0px 0px -6% 0px"});
    revealEls.forEach(function(el){ io.observe(el); });
  }

  // Footer year
  var y = document.getElementById("year");
  if(y) y.textContent = String(new Date().getFullYear());

  // Before / After slider
  document.querySelectorAll("[data-ba]").forEach(function(frame){
    var range = frame.querySelector("input[type=range]");
    var after = frame.querySelector(".ba-after");
    var handle = frame.querySelector(".ba-handle");
    var set = function(v){
      after.style.clipPath = "inset(0 0 0 " + v + "%)";
      handle.style.left = v + "%";
    };
    range.addEventListener("input", function(){ set(Number(range.value)); });
    set(Number(range.value || 50));
  });

  // Testimonials carousel
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var dotsWrap = document.getElementById("dots");
  var idx = 0, timer = null;
  function buildDots(){
    dotsWrap.innerHTML = "";
    slides.forEach(function(_,i){
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label","Ver depoimento "+(i+1));
      b.addEventListener("click", function(){ go(i); restart(); });
      dotsWrap.appendChild(b);
    });
  }
  function go(i){
    idx = (i + slides.length) % slides.length;
    slides.forEach(function(s,k){ s.classList.toggle("active", k===idx); });
    Array.prototype.forEach.call(dotsWrap.children, function(d,k){
      d.classList.toggle("active", k===idx);
      if(k===idx) d.setAttribute("aria-current","true");
      else d.removeAttribute("aria-current");
    });
    var live = document.getElementById("car-live");
    if(live) live.textContent = "Depoimento " + (idx+1) + " de " + slides.length;
  }
  function restart(){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if(timer) clearInterval(timer);
    timer = setInterval(function(){ go(idx+1); }, 6500);
  }
  function pause(){ if(timer) clearInterval(timer); timer = null; }
  var prev = document.getElementById("car-prev");
  var next = document.getElementById("car-next");
  if(prev) prev.addEventListener("click", function(){ go(idx-1); restart(); });
  if(next) next.addEventListener("click", function(){ go(idx+1); restart(); });
  if(slides.length){
    buildDots(); go(0); restart();
    var car = document.querySelector(".carousel");
    if(car){
      car.addEventListener("mouseenter", pause);
      car.addEventListener("mouseleave", restart);
      car.addEventListener("focusin", pause);
      car.addEventListener("focusout", restart);
      var touchX = null;
      car.addEventListener("touchstart", function(e){
        if(e.touches.length === 1) touchX = e.touches[0].clientX;
      }, {passive:true});
      car.addEventListener("touchend", function(e){
        if(touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if(Math.abs(dx) < 40) return;
        go(idx + (dx < 0 ? 1 : -1)); restart();
      }, {passive:true});
    }
  }

  // Hero 3D tilt — desktop, respeita reduced-motion e touch
  (function(){
    var media = document.querySelector(".hero-media");
    if(!media) return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if(window.matchMedia("(pointer: coarse)").matches) return;
    var cards = Array.prototype.slice.call(media.querySelectorAll(".hero-arch"));
    if(!cards.length) return;
    var raf = null;
    function onMove(e){
      var r = media.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function(){
        cards.forEach(function(card, i){
          var f = (i % 2 === 0) ? 1 : -1;
          card.style.transform = "perspective(900px) rotateY(" + (x*7*f).toFixed(2) + "deg) rotateX(" + (-y*7*f).toFixed(2) + "deg)";
        });
      });
    }
    function onLeave(){
      if(raf) cancelAnimationFrame(raf);
      raf = null;
      cards.forEach(function(card){ card.style.transform = ""; });
    }
    media.addEventListener("mousemove", onMove);
    media.addEventListener("mouseleave", onLeave);
  })();

  // Treatments rows -> WhatsApp with prefilled text
  var wa = "https://wa.me/5500000000000?text=";
  document.querySelectorAll(".treat-row").forEach(function(row){
    row.addEventListener("click", function(){
      var t = row.getAttribute("data-treatment") || "avaliação personalizada";
      window.open(wa + encodeURIComponent("Olá! Quero agendar uma avaliação sobre: " + t + " — Assensi Derm"), "_blank", "noopener");
    });
    row.addEventListener("keydown", function(e){
      if(e.key==="Enter"||e.key===" "){ e.preventDefault(); row.click(); }
    });
  });

  // About specialists carousel (Vanessa / Thais)
  (function(){
    var slides = Array.prototype.slice.call(document.querySelectorAll(".about-slide"));
    if(!slides.length) return;
    var dotsWrap = document.getElementById("about-dots");
    var prev = document.getElementById("about-prev");
    var next = document.getElementById("about-next");
    var live = document.getElementById("about-live");
    var idx = 0;
    function render(){
      slides.forEach(function(s,k){ s.classList.toggle("active", k===idx); });
      if(dotsWrap){
        Array.prototype.forEach.call(dotsWrap.children, function(d,k){
          d.classList.toggle("active", k===idx);
          if(k===idx) d.setAttribute("aria-current","true");
          else d.removeAttribute("aria-current");
        });
      }
      if(live) live.textContent = "Especialista " + (idx+1) + " de " + slides.length;
    }
    function go(i){ idx = (i + slides.length) % slides.length; render(); }
    if(dotsWrap){
      dotsWrap.innerHTML = "";
      slides.forEach(function(_,i){
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label","Ver especialista "+(i+1));
        b.addEventListener("click", function(){ go(i); });
        dotsWrap.appendChild(b);
      });
    }
    if(prev) prev.addEventListener("click", function(){ go(idx-1); });
    if(next) next.addEventListener("click", function(){ go(idx+1); });
    var car = document.querySelector(".about-carousel");
    if(car){
      var tx = null;
      car.addEventListener("touchstart", function(e){ if(e.touches.length===1) tx = e.touches[0].clientX; }, {passive:true});
      car.addEventListener("touchend", function(e){
        if(tx===null) return;
        var dx = e.changedTouches[0].clientX - tx; tx = null;
        if(Math.abs(dx) < 40) return;
        go(idx + (dx < 0 ? 1 : -1));
      }, {passive:true});
    }
    render();
  })();
})();
