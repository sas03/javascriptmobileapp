// Eventlistener for the install request - wait until the promise is settled before installing
self.addEventListener("install", event => {
    event.waitUntil(
        //promise
        caches.open("static").then(cache => {
            // add elements in the array(cache)
            return cache.addAll(["./", "./images/WGFavicon.png"]);
        })
    );
});

// Eventlistener for the fetch request, which allows the application to be installed
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            //fetch first, if nothing, go to the network
            return response || fetch(event.request);
        })
    );
});