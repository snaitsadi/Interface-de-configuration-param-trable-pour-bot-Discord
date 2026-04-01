const API_URL = 'http://localhost:3000/api';

async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/user`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            updateUserInfo(user);
            return true;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
    return false;
}

function updateUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    if (userInfo) {
        userInfo.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${avatarUrl}" class="rounded-circle me-2" width="32" height="32">
                <span class="text-white">${user.username}</span>
            </div>
        `;
    }
    
    if (userAvatar && userName) {
        userAvatar.innerHTML = `<img src="${avatarUrl}" class="rounded-circle" width="32" height="32">`;
        userName.textContent = user.username;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_URL}/auth/login`);
                const data = await response.json();
                window.location.href = data.url;
            } catch (error) {
                console.error('Login failed:', error);
                alert('Failed to initiate login. Please try again.');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = `${API_URL}/auth/logout`;
        });
    }
    
    if (window.location.pathname.includes('dashboard.html')) {
        checkAuth().then(isLoggedIn => {
            if (!isLoggedIn) {
                window.location.href = '/';
            }
        });
    }
});