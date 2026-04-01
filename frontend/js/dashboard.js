const API_URL = 'http://localhost:3000/api';

async function loadServers() {
    const container = document.getElementById('serversList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="loading-spinner"></div>
            <p class="mt-3 text-muted">Loading your servers...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/guilds`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/';
                return;
            }
            throw new Error('Failed to load servers');
        }
        
        const guilds = await response.json();
        displayServers(guilds);
    } catch (error) {
        console.error('Error loading servers:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Failed to load servers. Please try again later.
                </div>
            </div>
        `;
    }
}

function displayServers(guilds) {
    const container = document.getElementById('serversList');
    
    if (!guilds || guilds.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No servers found. Make sure you are in at least one Discord server.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = guilds.map(guild => `
        <div class="col-md-4 mb-4">
            <div class="card server-card h-100" data-guild-id="${guild.id}" data-guild-name="${escapeHtml(guild.name)}">
                <div class="card-body text-center p-4">
                    ${guild.icon ? 
                        `<img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128" 
                              class="server-icon mb-3" alt="${escapeHtml(guild.name)}">` :
                        `<div class="server-icon mb-3 d-flex align-items-center justify-content-center mx-auto" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <span class="display-4 text-white">${escapeHtml(guild.name.charAt(0).toUpperCase())}</span>
                         </div>`
                    }
                    <h5 class="card-title mb-2">${escapeHtml(guild.name)}</h5>
                    <p class="card-text text-muted small mb-3">ID: ${guild.id}</p>
                    ${guild.botInstalled ? 
                        '<span class="badge bg-success mb-3 d-inline-block">✓ Bot Installed</span>' :
                        '<span class="badge bg-warning mb-3 d-inline-block">⚠ Bot Not Installed</span>'
                    }
                    <div class="mt-2">
                        ${!guild.botInstalled ? 
                            `<button class="btn btn-primary btn-sm install-bot w-100 mb-2">
                                 Install Bot
                            </button>` : ''
                        }
                        <button class="btn btn-outline-primary btn-sm configure-bot w-100" 
                                ${!guild.botInstalled ? 'disabled' : ''}>
                             Configure Bot
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.install-bot').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const card = btn.closest('.server-card');
            const guildId = card.dataset.guildId;
            await installBot(guildId);
        });
    });
    
    document.querySelectorAll('.configure-bot').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const card = btn.closest('.server-card');
            const guildId = card.dataset.guildId;
            const guildName = card.dataset.guildName;
            await openConfigModal(guildId, guildName);
        });
    });
}

async function installBot(guildId) {
    try {
        const response = await fetch(`${API_URL}/guilds/${guildId}/install`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            window.open(data.inviteUrl, '_blank');
            alert('Bot installation initiated! Please follow the instructions in the new tab to complete the installation.');
            
            setTimeout(() => {
                loadServers();
            }, 3000);
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Installation failed');
        }
    } catch (error) {
        console.error('Error installing bot:', error);
        alert('Failed to install bot: ' + error.message);
    }
}

async function openConfigModal(guildId, guildName) {
    const modalElement = document.getElementById('configModal');
    if (!modalElement) return;
    
    const modalTitle = modalElement.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = ` Configure Bot for ${guildName}`;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    await loadConfigSchema(guildId);
    modal.show();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_URL}/auth/user`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/';
            return;
        }
        
        const user = await response.json();
        updateUserInfo(user);
        await loadServers();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/';
    }
});