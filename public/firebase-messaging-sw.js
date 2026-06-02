importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'FIREBASE_API_KEY_PLACEHOLDER',
  authDomain: 'FIREBASE_AUTH_DOMAIN_PLACEHOLDER',
  projectId: 'FIREBASE_PROJECT_ID_PLACEHOLDER',
  storageBucket: 'FIREBASE_STORAGE_BUCKET_PLACEHOLDER',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER',
  appId: 'FIREBASE_APP_ID_PLACEHOLDER',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'LastBite', {
    body: body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: payload.data || {},
  });
});
