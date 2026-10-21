// Service Worker der Dashboard-App: zeigt Mitteilungen. Die Push selbst ist leer, den Text holt er sich mit dem Geräte-Schlüssel.
var EXEC = 'https://script.google.com/macros/s/AKfycbzmQLsCrC7tcVvl4GS2TOqy93NRkj_XcqPWnuu5-VOwvo5hyrpQGKZ_wi3P6FQMXUOO/exec';
function lies(n){ return caches.open('s7').then(function(c){ return c.match('/' + n); }).then(function(r){ return r ? r.text() : ''; }); }
function speicher(n, v){ return caches.open('s7').then(function(c){ return c.put('/' + n, new Response(v)); }); }
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(e){
  e.waitUntil(Promise.all([lies('token'), lies('seit')]).then(function(v){
    return fetch(EXEC + '?action=pushneu&g=' + encodeURIComponent(v[0]) + '&seit=' + encodeURIComponent(v[1])).then(function(r){ return r.json(); });
  }).then(function(j){ return j && j.ok ? j.neu || [] : []; }, function(){ return []; }).then(function(neu){
    if (!neu.length) return self.registration.showNotification('Studio Seven', { body: 'Neues im Dashboard', icon: 'icon-192.png', badge: 'icon-192.png', tag: 's7' });
    return speicher('seit', neu[neu.length - 1].zeit).then(function(){
      return Promise.all(neu.map(function(n){ return self.registration.showNotification(n.titel, { body: n.text, icon: 'icon-192.png', badge: 'icon-192.png', tag: 's7-' + n.id }); }));
    });
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(l){
    for (var i = 0; i < l.length; i++) if ('focus' in l[i]) return l[i].focus();
    return self.clients.openWindow('./');
  }));
});
