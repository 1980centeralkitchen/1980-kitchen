var CACHE_NAME = 'ck1980-v2';
var ASSETS = ['./', './index.html'];

self.addEventListener('install', function(e){
  self.skipWaiting(); // فعّل النسخة الجديدة فوراً من غير ما تنتظر إقفال كل التابات
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); }) // خد السيطرة على الصفحات المفتوحة فوراً
  );
});

self.addEventListener('fetch', function(e){
  // الشبكة أولاً عشان أي تحديث جديد يوصل فوراً؛ لو مفيش نت يرجع لآخر نسخة محفوظة
  e.respondWith(
    fetch(e.request).then(function(resp){
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function(c){ c.put(e.request, copy); });
      return resp;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
