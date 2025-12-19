// auth.js
document.addEventListener('DOMContentLoaded', () => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw9OKBW9joSM_4piyZ8Y0sZ54tXr21_Ir7xyiNzowYxFw48gY63Yc9VRqhUFfFIM1e4/exec";

    function el(id) { return document.getElementById(id) }
    function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    // Crypto Helpers
    function genSalt(len=16) {
        const arr = crypto.getRandomValues(new Uint8Array(len));
        return Array.from(arr).map(b => ("0" + b.toString(16)).slice(-2)).join("");
    }
    async function hashSalted(salt, password) {
        const enc = new TextEncoder();
        const data = enc.encode(salt + password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Toggle Mode
    let mode = 'signup';
    const tabSignup = el('tabSignup');
    const tabLogin = el('tabLogin');

    function setMode(m) {
        mode = m;
        if(m === 'signup') {
            tabSignup.classList.add('active'); tabSignup.style.background = 'var(--primary)'; tabSignup.style.color = '#fff';
            tabLogin.classList.remove('active'); tabLogin.style.background = 'transparent'; tabLogin.style.color = 'var(--text-muted)';
            el('title').textContent = 'Create Account';
            el('nameField').style.display = 'block';
            el('submitBtn').textContent = 'Sign Up';
        } else {
            tabLogin.classList.add('active'); tabLogin.style.background = 'var(--primary)'; tabLogin.style.color = '#fff';
            tabSignup.classList.remove('active'); tabSignup.style.background = 'transparent'; tabSignup.style.color = 'var(--text-muted)';
            el('title').textContent = 'Welcome Back';
            el('nameField').style.display = 'none';
            el('submitBtn').textContent = 'Login';
        }
    }

    if(tabSignup) tabSignup.onclick = () => setMode('signup');
    if(tabLogin) tabLogin.onclick = () => setMode('login');
    
    // Initial UI Set
    setMode('signup');

    // Submit Logic
    el('submitBtn').addEventListener('click', async () => {
        const btn = el('submitBtn');
        const email = el('email').value.trim().toLowerCase();
        const password = el('password').value;
        const name = el('name').value.trim();
        const username = el('username').value.trim();

        if (!email || !password) { showToast('Email and Password required', 'error'); return; }
        if (!isValidEmail(email)) { showToast('Invalid Email format', 'error'); return; }

        btn.disabled = true;
        btn.textContent = 'Processing...';

        try {
            if (mode === 'signup') {
                if (!name) { showToast('Name required', 'error'); btn.disabled=false; return; }
                const salt = genSalt(16);
                const hash = await hashSalted(salt, password);
                
                const res = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'signup', email, name, username, salt, hash })
                });
                const data = await res.json();
                
                if (data.ok) {
                    localStorage.setItem('site_user_email', email);
                    showToast('Account created!');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    showToast(data.message || 'Signup failed', 'error');
                }

            } else {
                // Login
                const saltResp = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'get_salt', email })
                });
                const saltJson = await saltResp.json();
                
                if (!saltJson.ok) { showToast('Account not found', 'error'); btn.disabled=false; btn.textContent='Login'; return; }
                
                const hash = await hashSalted(saltJson.salt, password);
                const res = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'login', email, hash })
                });
                const data = await res.json();
                
                if (data.ok) {
                    localStorage.setItem('site_user_email', email);
                    showToast('Login successful');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    showToast('Invalid credentials', 'error');
                }
            }
        } catch (e) {
            showToast('Network Error', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = mode === 'signup' ? 'Sign Up' : 'Login';
        }
    });

    // Password Toggle
    document.querySelectorAll('.toggle-password').forEach(t => {
        t.addEventListener('click', function() {
            const input = this.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
});