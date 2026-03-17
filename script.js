import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDLtJBvw327412AhWb1Bve9HuPYtkfnr4Q",
  authDomain: "sherif-ceb45.firebaseapp.com",
  projectId: "sherif-ceb45",
  storageBucket: "sherif-ceb45.firebasestorage.app",
  messagingSenderId: "707625325547",
  appId: "1:707625325547:web:60c19572a75087b4803fae",
  measurementId: "G-4DNPDQ53P3"
};

// Initialize Firebase
let app, db, analytics;

// Initialize Firebase when DOM is loaded
const initializeFirebase = async () => {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js");
    const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js");
    const { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js");
    
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    
    console.log('Firebase initialized successfully');
    return { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

// --- Supabase Configuration (Placeholder) ---
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Firebase Firestore functions
let firestoreFunctions = null;

async function getData(key) {
  // Try Firebase first
  if (firestoreFunctions && db) {
    try {
      const { doc, getDoc } = firestoreFunctions;
      const docRef = doc(db, 'site_data', key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e) { 
      console.error('Firebase Error:', e); 
    }
  }
  
  // Fallback to Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase.from('site_data').select('value').eq('key', key).single();
      if (!error && data) return JSON.parse(data.value);
    } catch (e) { console.error('Supabase Error:', e); }
  }
  
  // Fallback to localStorage
  const local = localStorage.getItem(key);
  if (local) return JSON.parse(local);
  return (key.includes('comments') || key.includes('projects') || key.includes('reviews') || key.includes('moments')) ? [] : null;
}

async function setData(key, value) {
  // Try Firebase first
  if (firestoreFunctions && db) {
    try {
      const { doc, setDoc } = firestoreFunctions;
      await setDoc(doc(db, 'site_data', key), value);
      console.log('Data saved to Firebase:', key);
    } catch (e) { 
      console.error('Firebase Error:', e); 
    }
  }
  
  // Fallback to Supabase
  if (supabase) {
    try {
      await supabase.from('site_data').upsert({ key, value: JSON.stringify(value) });
    } catch (e) { console.error('Supabase Error:', e); }
  }
  
  // Always save to localStorage as backup
  localStorage.setItem(key, JSON.stringify(value));
}

// Section cache
const sectionCache = {};

// Function to load section HTML
async function loadSection(path) {
  if (sectionCache[path]) {
    return sectionCache[path];
  }
  
  try {
    const response = await fetch(path);
    const html = await response.text();
    sectionCache[path] = html;
    return html;
  } catch (error) {
    console.error('Error loading section:', path, error);
    return `<div>Error loading section: ${path}</div>`;
  }
}

// Initialize sections
let navbar, hero, about, services, projects, reviews, happyMoments, serviceDetails, serviceWedding, serviceValentine, serviceBirthday, serviceMemory, comments, admin, cta, footer, navColumn;

// Load all sections
async function loadAllSections() {
  navbar = await loadSection('/src/sections/navbar.html');
  hero = await loadSection('/src/sections/hero.html');
  about = await loadSection('/src/sections/about.html');
  services = await loadSection('/src/sections/services.html');
  projects = await loadSection('/src/sections/projects.html');
  reviews = await loadSection('/src/sections/reviews.html');
  happyMoments = await loadSection('/src/sections/happy-moments.html');
  serviceDetails = await loadSection('/src/sections/service-details.html');
  serviceWedding = await loadSection('/src/sections/service-wedding.html');
  serviceValentine = await loadSection('/src/sections/service-valentine.html');
  serviceBirthday = await loadSection('/src/sections/service-birthday.html');
  serviceMemory = await loadSection('/src/sections/service-memory.html');
  comments = await loadSection('/src/sections/comments.html');
  admin = await loadSection('/src/sections/admin.html');
  cta = await loadSection('/src/sections/cta.html');
  footer = await loadSection('/src/sections/footer.html');
  navColumn = await loadSection('/src/sections/nav-column.html');
  
  console.log('All sections loaded');
}

// Map Routes to Components (will be updated after sections load)
let routes = {};

// Update routes after sections are loaded
function updateRoutes() {
  routes = {
    'home': hero,
    'about': about,
    'services': services,
    'service-details': serviceDetails,
    'service-wedding': serviceWedding,
    'service-valentine': serviceValentine,
    'service-birthday': serviceBirthday,
    'service-memory': serviceMemory,
    'projects': projects,
    'reviews': reviews,
    'happy-moments': happyMoments,
    'comments': comments,
    'admin': admin,
    'contact': footer
  };
  console.log('Routes updated:', Object.keys(routes));
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Firebase first
  firestoreFunctions = await initializeFirebase();
  
  const app = document.getElementById('app');
  
  // Debug: Check if app element exists
  if (!app) {
    console.error('App container not found!');
    return;
  }

  // Show loading state
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-[#120814]">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-romantic-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-romantic-accent text-xl font-bold">جاري التحميل...</p>
      </div>
    </div>
  `;

  // Load all sections first
  console.log('Starting to load sections...');
  await loadAllSections();
  console.log('Sections loaded successfully');
  
  // Update routes with loaded sections
  updateRoutes();

  const renderPage = async (pageName) => {
    console.log('Rendering page:', pageName);
    window.scrollTo(0, 0);
    const content = routes[pageName] || routes['home'];
    
    // Debug: Check if content exists
    if (!content) {
      console.error('No content found for page:', pageName);
      app.innerHTML = `<div class="min-h-screen flex items-center justify-center"><p class="text-red-500">Error: No content found for page ${pageName}</p></div>`;
      return;
    }
    
    let pageHTML = `
      ${navbar}
      <main class="min-h-screen pt-20 transition-opacity duration-500 opacity-0" id="main-content">
        ${content}
        ${(pageName !== 'contact' && pageName !== 'admin') ? navColumn : ''} 
      </main>
    `;

    if (pageName === 'contact') {
        pageHTML = `
            ${navbar}
            <main class="min-h-screen pt-20 transition-opacity duration-500 opacity-0" id="main-content">
                ${footer}
            </main>
        `;
    }

    console.log('Setting innerHTML...');
    app.innerHTML = pageHTML;
    const mainContent = document.getElementById('main-content');
    requestAnimationFrame(() => {
        if (mainContent) mainContent.classList.remove('opacity-0');
    });

    initScripts();
    if (pageName === 'comments') initComments();
    if (pageName === 'admin') initAdmin();
    
    await loadDynamicContent();
  };

  const handleRouting = () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    renderPage(hash);
  };

  window.addEventListener('hashchange', handleRouting);
  const adminTrigger = document.getElementById('admin-trigger');
  if (adminTrigger) {
    adminTrigger.addEventListener('click', () => { window.location.hash = '#admin'; });
  }
  handleRouting();
});

const loadDynamicContent = async () => {
  const siteTitle = await getData('basma_site_title');
  if (siteTitle) {
    document.title = siteTitle;
    const navLogo = document.querySelector('nav .text-2xl span:nth-child(2)');
    if (navLogo) navLogo.textContent = siteTitle;
  }

  const whatsapp = await getData('basma_whatsapp');
  if (whatsapp) {
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
      link.setAttribute('href', "https://wa.me/" + whatsapp.replace(/\s+/g, ''));
    });
  }

  const tiktok = await getData('basma_tiktok');
  if (tiktok) {
    document.querySelectorAll('a[href*="tiktok.com"]').forEach(link => link.setAttribute('href', tiktok));
  }

  const aboutText = await getData('basma_about_text');
  if (aboutText) {
    const aboutDesc = document.querySelector('#about p.text-gray-400');
    if (aboutDesc) aboutDesc.textContent = aboutText;
  }

  const projectsData = await getData('basma_projects');
  if (projectsData && projectsData.length > 0) {
    const grid = document.querySelector('#projects .grid');
    if (grid) {
      grid.innerHTML = projectsData.map(p => `
        <div class="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:border-romantic-primary/30 transition-all duration-500">
          <div class="aspect-video overflow-hidden">
            <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-white mb-2">${p.title}</h3>
            <a href="${p.link}" target="_blank" class="text-romantic-accent text-sm font-bold flex items-center gap-2">
              معاينة المشروع <i class="ri-external-link-line"></i>
            </a>
          </div>
        </div>`).join('');
    }
  }

  const reviewsData = await getData('basma_reviews');
  if (reviewsData && reviewsData.length > 0) {
    const grid = document.querySelector('#reviews .grid');
    if (grid) {
      grid.innerHTML = reviewsData.map(img => `
        <div class="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 hover:border-romantic-gold/30 transition-all">
          <img src="${img}" class="w-full h-full object-cover" alt="Review">
        </div>`).join('');
    }
  }

  const momentsData = await getData('basma_moments');
  if (momentsData && momentsData.length > 0) {
    const grid = document.querySelector('#happy-moments .grid');
    if (grid) {
      grid.innerHTML = momentsData.map(m => `
        <div class="aspect-square rounded-3xl overflow-hidden border-2 border-white/5 hover:border-romantic-primary/30 transition-all group">
          <img src="${m}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Moment">
        </div>`).join('');
    }
  }
};

function initComments() {
  const form = document.getElementById('comment-form');
  const list = document.getElementById('comments-list');
  const stars = document.querySelectorAll('#rating-stars i');
  const ratingInput = document.getElementById('comment-rating');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = star.getAttribute('data-value');
      ratingInput.value = val;
      stars.forEach(s => {
        const sVal = s.getAttribute('data-value');
        s.classList.toggle('ri-star-fill', sVal <= val);
        s.classList.toggle('ri-star-line', sVal > val);
      });
    });
  });

  const loadComments = async () => {
    const commentsData = await getData('basma_comments') || [];
    if (commentsData.length === 0) {
      const no = document.getElementById('no-comments');
      if (no) no.classList.remove('hidden');
      if (list) list.innerHTML = '';
      return;
    }
    const no = document.getElementById('no-comments');
    if (no) no.classList.add('hidden');
    if (list) list.innerHTML = commentsData.map(c => `
      <div class="p-6 rounded-3xl bg-white/5 border border-white/10">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-white font-bold">${c.name}</h4>
            <div class="flex text-romantic-gold text-xs mt-1">
              ${Array(5).fill(0).map((_, i) => `<i class="${i < c.rating ? 'ri-star-fill' : 'ri-star-line'}"></i>`).join('')}
            </div>
          </div>
          <span class="text-xs text-gray-500">${new Date(c.date).toLocaleDateString('ar-EG')}</span>
        </div>
        <p class="text-gray-400 text-sm leading-relaxed">${c.text}</p>
        ${c.reply ? `<div class="mt-4 p-4 rounded-2xl bg-romantic-primary/10 border border-romantic-primary/20"><p class="text-xs font-bold text-romantic-primary mb-1">رد بصمة ديزاين:</p><p class="text-gray-300 text-sm italic">${c.reply}</p></div>` : ''}
      </div>
    `).reverse().join('');
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newC = { id: Date.now(), name: document.getElementById('comment-name').value, text: document.getElementById('comment-text').value, rating: parseInt(ratingInput.value), date: new Date().toISOString(), reply: null };
      const current = await getData('basma_comments') || [];
      current.push(newC);
      await setData('basma_comments', current);
      form.reset();
      loadComments();
    });
  }
  loadComments();
}

function initAdmin() {
  const loginSection = document.getElementById('admin-login');
  const dashboard = document.getElementById('admin-dashboard');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout');
  
  const checkAuth = async () => {
    if (sessionStorage.getItem('basma_admin_auth') === 'true') {
      if (loginSection) loginSection.classList.add('hidden');
      if (dashboard) dashboard.classList.remove('hidden');
      renderAdminComments();
      renderAdminProjects();
      renderAdminReviews();
      renderAdminMoments();
      const abTxt = await getData('basma_about_text');
      if (document.getElementById('admin-about-text')) document.getElementById('admin-about-text').value = abTxt || '';
    }
  };

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (document.getElementById('admin-password').value === '11543211') {
        sessionStorage.setItem('basma_admin_auth', 'true');
        checkAuth();
      } else { alert('كلمة مرور خاطئة!'); }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('basma_admin_auth'); location.reload(); });
  }

  window.switchAdminTab = (tabId) => {
    document.querySelectorAll('.admin-content-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('active', 'bg-romantic-primary', 'text-white');
      btn.classList.add('bg-white/5', 'text-gray-400');
    });
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('active', 'bg-romantic-primary', 'text-white');
    }
  };

  window.updateGeneralSettings = async () => {
    await setData('basma_site_title', document.getElementById('admin-site-title').value);
    await setData('basma_whatsapp', document.getElementById('admin-whatsapp').value);
    await setData('basma_tiktok', document.getElementById('admin-tiktok').value);
    alert('تم التحديث!'); loadDynamicContent();
  };

  window.updateAboutContent = async () => {
    await setData('basma_about_text', document.getElementById('admin-about-text').value);
    alert('تم التحديث!');
  };

  window.addNewProject = async () => {
    const p = { 
      title: document.getElementById('new-project-title').value, 
      image: document.getElementById('new-project-image').value, 
      link: document.getElementById('new-project-link').value, 
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const current = await getData('basma_projects') || [];
    current.push(p); 
    await setData('basma_projects', current);
    renderAdminProjects(); 
    alert('تم الإضافة!');
    
    // Clear form
    document.getElementById('new-project-title').value = '';
    document.getElementById('new-project-image').value = '';
    document.getElementById('new-project-link').value = '';
  };

  window.addNewReview = async () => {
    const imageUrl = document.getElementById('new-review-image').value;
    if (!imageUrl) {
      alert('يرجى إدخال رابط الصورة');
      return;
    }
    const current = await getData('basma_reviews') || [];
    current.push(imageUrl); 
    await setData('basma_reviews', current);
    renderAdminReviews(); 
    alert('تم إضافة السكرين شوت!');
    
    // Clear form
    document.getElementById('new-review-image').value = '';
  };

  window.addNewMoment = async () => {
    const momentUrl = document.getElementById('new-moment-url').value;
    if (!momentUrl) {
      alert('يرجى إدخال رابط الصورة أو الفيديو');
      return;
    }
    const current = await getData('basma_moments') || [];
    current.push(momentUrl); 
    await setData('basma_moments', current);
    renderAdminMoments(); 
    alert('تمت الإضافة للحظات فرح!');
    
    // Clear form
    document.getElementById('new-moment-url').value = '';
  };

  const renderAdminComments = async () => {
    const commentsData = await getData('basma_comments') || [];
    const list = document.getElementById('admin-comments-list');
    if (list) {
      list.innerHTML = commentsData.map(c => `
        <div class="p-6 hover:bg-white/5 transition-colors">
          <div class="flex justify-between mb-2"><span class="text-white font-bold">${c.name}</span><button onclick="deleteItem('comments', ${c.id})" class="text-red-400">حذف</button></div>
          <p class="text-gray-400 text-sm mb-4">${c.text}</p>
          <div class="flex gap-2"><input type="text" id="reply-${c.id}" placeholder="الرد..." class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm" value="${c.reply || ''}"><button onclick="saveReply(${c.id})" class="bg-romantic-primary px-4 rounded-xl text-xs font-bold">رد</button></div>
        </div>`).reverse().join('');
    }
  };

  const renderAdminProjects = async () => {
    const projectsData = await getData('basma_projects') || [];
    const list = document.getElementById('admin-projects-list');
    if (list) list.innerHTML = projectsData.map(p => `<div class="flex justify-between p-4 bg-white/5 rounded-xl mb-2"><span class="text-white">${p.title}</span><button onclick="deleteItem('projects', ${p.id})" class="text-red-400">حذف</button></div>`).join('');
  };

  const renderAdminReviews = async () => {
    const reviewsData = await getData('basma_reviews') || [];
    const list = document.getElementById('admin-reviews-list');
    if (list) list.innerHTML = reviewsData.map((img, i) => `<div class="relative aspect-square"><img src="${img}" class="w-full h-full object-cover rounded-lg"><button onclick="deleteItem('reviews', ${i})" class="absolute inset-0 bg-red-500/50 opacity-0 hover:opacity-100 flex items-center justify-center">حذف</button></div>`).join('');
  };

  const renderAdminMoments = async () => {
    const momentsData = await getData('basma_moments') || [];
    const list = document.getElementById('admin-moments-list');
    if (list) list.innerHTML = momentsData.map((m, i) => `<div class="relative aspect-square"><img src="${m}" class="w-full h-full object-cover rounded-lg"><button onclick="deleteItem('moments', ${i})" class="absolute inset-0 bg-red-500/50 opacity-0 hover:opacity-100 flex items-center justify-center">حذف</button></div>`).join('');
  };

  window.deleteItem = async (type, id) => {
    if (!confirm('متأكد؟')) return;
    let data = await getData(`basma_${type}`) || [];
    if (type === 'projects' || type === 'comments') data = data.filter(x => x.id !== id);
    else data.splice(id, 1);
    await setData(`basma_${type}`, data);
    if (type === 'comments') renderAdminComments();
    if (type === 'projects') renderAdminProjects();
    if (type === 'reviews') renderAdminReviews();
    if (type === 'moments') renderAdminMoments();
    
    // Log to Firebase Analytics if available
    if (analytics) {
      try {
        const { logEvent } = await import("https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js");
        logEvent(analytics, 'admin_delete_item', { item_type: type, item_id: id });
      } catch (e) {
        console.log('Analytics logging failed:', e);
      }
    }
  };

  window.saveReply = async (id) => {
    const target = document.getElementById('reply-' + id);
    if (!target) return;
    const r = target.value;
    const current = await getData('basma_comments') || [];
    const idx = current.findIndex(x => x.id === id);
    if (idx !== -1) { 
      current[idx].reply = r; 
      current[idx].repliedAt = new Date().toISOString();
      await setData('basma_comments', current); 
      renderAdminComments(); 
      alert('تم الرد!'); 
    }
  };

  checkAuth();
}

function initScripts() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if(menuBtn && mobileMenu) {
    menuBtn.onclick = () => mobileMenu.classList.toggle('hidden');
  }

  // Background Music Control
  const backgroundMusic = document.getElementById('background-music');
  if (backgroundMusic) {
    // Create music control button
    const musicControl = document.createElement('button');
    musicControl.id = 'music-control';
    musicControl.className = 'fixed bottom-24 right-6 z-40 w-12 h-12 bg-romantic-primary/20 backdrop-blur-md rounded-full border border-romantic-primary/30 flex items-center justify-center hover:bg-romantic-primary/30 transition-all group';
    musicControl.innerHTML = '<i class="ri-music-2-line text-white text-xl"></i>';
    document.body.appendChild(musicControl);

    let isPlaying = false;
    
    // Try to play music on first user interaction
    const playMusic = () => {
      backgroundMusic.play().then(() => {
        isPlaying = true;
        musicControl.innerHTML = '<i class="ri-pause-line text-white text-xl"></i>';
        musicControl.classList.add('bg-romantic-primary/40');
      }).catch(e => {
        console.log('Music autoplay blocked:', e);
      });
    };

    // Music control toggle
    musicControl.onclick = () => {
      if (isPlaying) {
        backgroundMusic.pause();
        musicControl.innerHTML = '<i class="ri-music-2-line text-white text-xl"></i>';
        musicControl.classList.remove('bg-romantic-primary/40');
        isPlaying = false;
      } else {
        playMusic();
      }
    };

    // Try to play on first interaction
    const firstInteraction = () => {
      if (!isPlaying) {
        playMusic();
      }
      document.removeEventListener('click', firstInteraction);
      document.removeEventListener('touchstart', firstInteraction);
    };
    
    document.addEventListener('click', firstInteraction);
    document.addEventListener('touchstart', firstInteraction);
  } 
  mobileMenu.querySelectorAll('a').forEach(l => l.onclick = () => mobileMenu.classList.add('hidden'));
  document.querySelectorAll('section').forEach(s => {
    gsap.from(s.children, { scrollTrigger: { trigger: s, start: 'top 80%' }, y: 30, opacity: 0, duration: 0.6, stagger: 0.1 });
  });
}
