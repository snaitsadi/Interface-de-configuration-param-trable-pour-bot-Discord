const API_URL = 'http://localhost:3000/api';
let currentGuildId = null;

async function loadConfigSchema(guildId) {
    currentGuildId = guildId;
    const container = document.getElementById('configFields');
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="loading-spinner"></div>
            <p class="mt-2">Loading configuration...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/config/schema`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load configuration schema');
        }
        
        const schema = await response.json();
        generateConfigForm(schema, guildId);
    } catch (error) {
        console.error('Error loading schema:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                Failed to load configuration. Please try again.
            </div>
        `;
    }
}

function generateConfigForm(schema, guildId) {
    const container = document.getElementById('configFields');
    const form = document.getElementById('configForm');
    
    if (!container) return;
    
    container.innerHTML = schema.parameters.map(param => `
        <div class="config-field">
            <label for="${param.id}">${param.label.en}</label>
            <div class="description">${param.description.en}</div>
            ${renderField(param)}
            ${param.required ? '<span class="text-danger ms-1">*</span>' : ''}
        </div>
    `).join('');
    
    schema.parameters.forEach(param => {
        if (param.type === 'image') {
            const input = document.getElementById(param.id);
            if (input) {
                input.addEventListener('change', (e) => handleImagePreview(e, param.id));
            }
        }
    });
    
    detectAndTranslateLabels(schema.parameters);
    
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await generateConfig(guildId);
        };
    }
}

function renderField(param) {
    switch (param.type) {
        case 'forum':
        case 'title':
        case 'text':
            return `<input type="text" class="form-control" id="${param.id}" 
                           name="${param.id}" ${param.required ? 'required' : ''}
                           placeholder="Enter ${param.label.en.toLowerCase()}"
                           value="${param.default?.en || ''}">`;
        
        case 'number':
            return `<input type="number" class="form-control" id="${param.id}" 
                           name="${param.id}" 
                           ${param.min !== undefined ? `min="${param.min}"` : ''}
                           ${param.max !== undefined ? `max="${param.max}"` : ''}
                           ${param.required ? 'required' : ''}
                           value="${param.default || ''}">`;
        
        case 'role':
            return `<select class="form-select" id="${param.id}" name="${param.id}" 
                            ${param.required ? 'required' : ''}>
                        <option value="">Select a role...</option>
                    </select>`;
        
        case 'user':
            return `<select class="form-select" id="${param.id}" name="${param.id}" 
                            ${param.required ? 'required' : ''}>
                        <option value="">Select a user...</option>
                    </select>`;
        
        case 'image':
            return `
                <input type="file" class="form-control" id="${param.id}" 
                       name="${param.id}" accept="${param.accept || 'image/*'}"
                       ${param.required ? 'required' : ''}>
                <div id="${param.id}-preview" class="image-preview"></div>
            `;
        
        default:
            return `<input type="text" class="form-control" id="${param.id}" 
                           name="${param.id}" ${param.required ? 'required' : ''}>`;
    }
}

function handleImagePreview(event, fieldId) {
    const file = event.target.files[0];
    const previewDiv = document.getElementById(`${fieldId}-preview`);
    
    if (file && previewDiv) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewDiv.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded">`;
        };
        reader.readAsDataURL(file);
    } else if (previewDiv) {
        previewDiv.innerHTML = '';
    }
}

async function detectAndTranslateLabels(parameters) {
    try {
        const userLang = navigator.language.split('-')[0];
        
        for (const param of parameters) {
            const labelElement = document.querySelector(`label[for="${param.id}"]`);
            const descriptionElement = document.querySelector(`#${param.id}`)
                ?.parentElement?.querySelector('.description');
            
            if (labelElement && param.label[userLang]) {
                labelElement.textContent = param.label[userLang];
            } else if (labelElement && !param.label[userLang]) {
                try {
                    const response = await fetch(`${API_URL}/config/translate?text=${encodeURIComponent(param.label.en)}&targetLang=${userLang}`, {
                        credentials: 'include'
                    });
                    const data = await response.json();
                    if (data.translated) {
                        labelElement.textContent = data.translated;
                    }
                } catch (err) {
                    console.warn(`Translation failed for label: ${param.label.en}`);
                }
            }
            
            if (descriptionElement && param.description[userLang]) {
                descriptionElement.textContent = param.description[userLang];
            } else if (descriptionElement && !param.description[userLang]) {
                try {
                    const response = await fetch(`${API_URL}/config/translate?text=${encodeURIComponent(param.description.en)}&targetLang=${userLang}`, {
                        credentials: 'include'
                    });
                    const data = await response.json();
                    if (data.translated) {
                        descriptionElement.textContent = data.translated;
                    }
                } catch (err) {
                    console.warn(`Translation failed for description: ${param.description.en}`);
                }
            }
        }
    } catch (error) {
        console.error('Translation error:', error);
    }
}

async function generateConfig(guildId) {
    const form = document.getElementById('configForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Generating...';
    
    try {
        const response = await fetch(`${API_URL}/config/${guildId}/generate`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate configuration');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${guildId}_config.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('configModal'));
        if (modal) {
            modal.hide();
        }
        
        showSuccess('Configuration generated successfully!');
    } catch (error) {
        console.error('Error generating config:', error);
        showError(error.message || 'Failed to generate configuration');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.innerHTML = `
        ✅ ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.innerHTML = `
        ❌ ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}