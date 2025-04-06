// Service Worker สำหรับ Caching พื้นฐาน (Cache First Strategy)

const CACHE_NAME = 'chaowangyen-cafe-cache-v1'; // เปลี่ยนชื่อ Cache ตามต้องการ
const urlsToCache = [
  './', // Cache หน้าหลัก (มักจะหมายถึง index.html ถ้า server ตั้งค่าไว้)
  './index.html',
  './shop.html',
  './payment.html',
  // './style.css', // ถ้าคุณแยกไฟล์ CSS
  // './script.js', // ถ้าคุณแยกไฟล์ JS หลัก
  // './images/logo.png', // เพิ่มไฟล์รูปภาพหลักๆ ที่ใช้บ่อย
  'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Pridi:wght@300;400&display=swap', // Cache Font
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' // Cache Font Awesome CSS
  // เพิ่มไฟล์อื่นๆ ที่จำเป็นสำหรับหน้าตาเว็บหลักที่นี่
];

// Event: Install - ทำตอนติดตั้ง Service Worker ครั้งแรก
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting(); // Activate new worker immediately
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Event: Activate - ทำตอน Service Worker เริ่มทำงาน (หลังจาก install)
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  // ลบ Cache เก่าที่ไม่ต้องการแล้ว (ถ้ามี Cache เวอร์ชันอื่น)
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
         console.log('Service Worker: Activation complete');
         return self.clients.claim(); // Control uncontrolled clients
    })
  );
});

// Event: Fetch - ทำงานทุกครั้งที่มีการเรียกขอไฟล์ (รูปภาพ, CSS, JS, HTML)
self.addEventListener('fetch', event => {
    // ใช้ Cache First Strategy: พยายามหาใน Cache ก่อน ถ้าไม่มีค่อยไปโหลดจาก Network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // ถ้าเจอใน Cache ก็ส่งอันนั้นกลับไปเลย
          if (response) {
            // console.log('Service Worker: Serving from cache:', event.request.url);
            return response;
          }
          // ถ้าไม่เจอใน Cache ก็ไปโหลดจาก Network ตามปกติ
          // console.log('Service Worker: Fetching from network:', event.request.url);
          return fetch(event.request);
        }
      )
      .catch(error => {
          console.error('Service Worker: Fetch failed', error);
          // อาจจะแสดงหน้า Offline fallback ที่นี่ ถ้าต้องการ
          // return caches.match('./offline.html');
      })
    );
});