// firebase-messaging-sw.js
// Service Worker for receiving background Firebase Cloud Messages (FCM)

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker.
// Note: These values must match your Firebase project's credentials.
// For security and portability, you can dynamically update these or use the same client credentials.
firebase.initializeApp({
  apiKey: "mock-api-key-for-build",
  authDomain: "mock-auth-domain-for-build",
  projectId: "mock-project-id-for-build",
  storageBucket: "mock-storage-bucket-for-build",
  messagingSenderId: "mock-sender-id-for-build",
  appId: "mock-app-id-for-build"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'ReCollab Update';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new synergy notification.',
    icon: payload.notification?.image || '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
