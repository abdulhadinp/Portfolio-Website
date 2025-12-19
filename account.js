// account.js
document.addEventListener('DOMContentLoaded', () => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw9OKBW9joSM_4piyZ8Y0sZ54tXr21_Ir7xyiNzowYxFw48gY63Yc9VRqhUFfFIM1e4/exec";
    const userEmail = localStorage.getItem('site_user_email');

    if (!userEmail) { window.location.href = 'auth.html'; return; }

    const nameInput = document.getElementById('acc-name');
    const usernameInput = document.getElementById('acc-username');
    const emailInput = document.getElementById('acc-email');
    const passwordInput = document.getElementById('acc-password');
    const updateBtn = document.getElementById('updateBtn');
    
    emailInput.value = userEmail;

    // Helper functions (duplicated from auth.js to keep files standalone as requested)
    function genSalt(len=16) { const arr = crypto.getRandomValues(new Uint8Array(len)); return Array.from(arr).map(b => ("0" + b.toString(16)).slice(-2)).join(""); }
    async function hashSalted(salt, password) { const enc = new TextEncoder(); const data = enc.encode(salt + password); const hashBuffer = await crypto.subtle.digest('SHA-256', data); return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join(''); }

    // Fetch User Data
    (async () => {
        try {
            const res = await fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'get_user', email: userEmail }) });
            const data = await res.json();
            if (data.ok) {
                nameInput.value = data.userData.name;
                usernameInput.value = data.userData.username;
            }
        } catch(e) { showToast('Failed to load profile', 'error'); }
    })();

    // Update
    updateBtn.addEventListener('click', async () => {
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';
        
        try {
            const payload = { action: 'update_user', email: userEmail, name: nameInput.value, username: usernameInput.value };
            
            if (passwordInput.value) {
                const salt = genSalt(16);
                payload.salt = salt;
                payload.hash = await hashSalted(salt, passwordInput.value);
            }

            const res = await fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload) });
            const data = await res.json();
            
            if (data.ok) showToast('Profile Updated!');
            else showToast('Update Failed', 'error');

        } catch (e) { showToast('Error updating profile', 'error'); }
        finally { updateBtn.disabled = false; updateBtn.textContent = 'Update Profile'; }
    });

    // Delete
    document.getElementById('deleteBtn').addEventListener('click', async () => {
        if (!confirm("Are you sure? Type OK to confirm.")) return;
        
        try {
            const res = await fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify({ action: 'delete_user', email: userEmail }) });
            const data = await res.json();
            if (data.ok) {
                localStorage.removeItem('site_user_email');
                alert('Account Deleted');
                window.location.href = 'index.html';
            }
        } catch(e) { showToast('Delete failed', 'error'); }
    });
    
    // Toggle Password
    document.querySelectorAll('.toggle-password').forEach(t => {
        t.addEventListener('click', function() {
            const input = this.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
});