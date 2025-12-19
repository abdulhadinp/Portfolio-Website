/* --- script.js --- */
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. DYNAMIC HEADER/FOOTER ---
    const headerHTML = `
        <nav class="navbar container">
            <a href="index.html" class="nav-logo">Abdul <span class="gradient-text">Hadi</span></a>
            <ul class="nav-menu">
                <li><a href="index.html" class="nav-link">Home</a></li>
                <li><a href="about.html" class="nav-link">About</a></li>
                <li><a href="services.html" class="nav-link">Services</a></li>
                <li><a href="projects.html" class="nav-link">Projects</a></li>
                <li><a href="contact.html" class="nav-link">Contact</a></li>
                <li id="account-link-li" style="display: none;"><a href="account.html" class="nav-link">Account</a></li>
                <li><a href="auth.html" id="auth-link" class="btn btn-secondary" style="padding: 0.5rem 1.5rem; border-radius: 20px;">Sign in</a></li>
            </ul>
            <div class="nav-toggle"><i class="fas fa-bars"></i></div>
        </nav>
    `;

    const footerHTML = `
        <div class="container">
            <div class="footer-socials">
                <a href="https://github.com/abdulhadi-cyberai" target="_blank"><i class="fab fa-github"></i></a>
                <a href="https://np.linkedin.com/in/abdulhadi-cyberai" target="_blank"><i class="fab fa-linkedin"></i></a>
                <a href="https://www.instagram.com/abdulhadinp/" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com/abdulhadinpl" target="_blank"><i class="fab fa-facebook"></i></a>
            </div>
            <p class="copyright">&copy; ${new Date().getFullYear()} Abdul Hadi. Engineered for Security & Intelligence.</p>
        </div>
        <div id="toast-box"></div>
    `;

    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');
    if (header) header.innerHTML = headerHTML;
    if (footer) footer.innerHTML = footerHTML;

    // --- 2. AUTH STATE ---
    const email = localStorage.getItem('site_user_email');
    const authLink = document.getElementById('auth-link');
    const accountLinkLi = document.getElementById('account-link-li');

    if (email) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        accountLinkLi.style.display = 'block';
        
        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('site_user_email');
            showToast('Logged out successfully', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        };
    }

    // --- 3. MOBILE MENU & ACTIVE LINKS ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
        link.addEventListener('click', () => navMenu.classList.remove('active'));
    });

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // --- 4. SCROLL ANIMATIONS (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // --- 5. TYPED.JS ---
    if (document.querySelector("#typed-element") && typeof Typed !== 'undefined') {
        new Typed('#typed-element', {
            strings: ['Cybersecurity Specialist', 'AI Architect', 'Ethical Hacker', 'Full Stack Dev'],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true
        });
    }

    // --- 6. ANALYTICS ---
    (async function trackVisitor(){
        const visited = sessionStorage.getItem('analytics_sent');
        if(visited) return; // Prevent spamming per session

        const payload = {
            action: "analytics",
            page: window.location.href,
            referrer: document.referrer,
            email: localStorage.getItem('site_user_email') || "Guest",
            screen: `${window.screen.width}x${window.screen.height}`,
            userAgent: navigator.userAgent
        };
        try {
            await fetch("https://script.google.com/macros/s/AKfycbw9OKBW9joSM_4piyZ8Y0sZ54tXr21_Ir7xyiNzowYxFw48gY63Yc9VRqhUFfFIM1e4/exec", {
                method: "POST",
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });
            sessionStorage.setItem('analytics_sent', 'true');
        } catch(e) {}
    })();
});

// --- GLOBAL TOAST NOTIFICATION FUNCTION ---
window.showToast = function(msg, type = 'success') {
    const box = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="margin-right:10px"></i> ${msg}`;
    box.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};