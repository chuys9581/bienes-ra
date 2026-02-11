// ============================================================
//  Admin Dashboard - Propiedades + Agentes
// ============================================================

const API_URL = window.location.port === '8000' ? '../api' : 'http://localhost:8000/api';
let currentUser = null;
let propiedades = [];
let agentes = [];
let editingPropertyId = null;
let editingAgentId = null;
let currentAssignAgentId = null;

// ==================== INIT ====================
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    loadProperties();
    initNavigation();
});

// ==================== AUTH ====================
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth.php?action=check`);
        const data = await response.json();
        if (!data.success) { window.location.href = 'index.html'; return; }
        currentUser = data.data;
        updateUserInfo();
    } catch (error) {
        window.location.href = 'index.html';
    }
}

function updateUserInfo() {
    document.getElementById('userName').textContent = currentUser.nombre;
    document.getElementById('userRole').textContent = currentUser.rol;
    const initials = currentUser.nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
    document.getElementById('userAvatar').textContent = initials.toUpperCase();
}

document.getElementById('btnLogout').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/auth.php?action=logout`, { method: 'POST' });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
});

// ==================== NAVIGATION ====================
function initNavigation() {
    const menuLinks = document.querySelectorAll('.sidebar-menu a[data-section]');
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });

    // Check hash on load
    const hash = window.location.hash.replace('#', '');
    if (hash === 'agentes') {
        switchSection('agentes');
    }
}

function switchSection(sectionName) {
    // Update sidebar active
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`a[data-section="${sectionName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Toggle sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));

    if (sectionName === 'agentes') {
        document.getElementById('sectionAgentes').classList.add('active');
        loadAgentes();
        document.getElementById('searchInput').placeholder = 'Buscar agentes...';
    } else {
        document.getElementById('sectionDashboard').classList.add('active');
        document.getElementById('searchInput').placeholder = 'Buscar propiedades...';
    }
}

// ==================== SEARCH ====================
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const activeSection = document.querySelector('.admin-section.active');

    if (activeSection && activeSection.id === 'sectionAgentes') {
        const filtered = agentes.filter(a =>
            `${a.nombre} ${a.apellido}`.toLowerCase().includes(term) ||
            (a.email && a.email.toLowerCase().includes(term)) ||
            (a.cargo && a.cargo.toLowerCase().includes(term))
        );
        renderAgentes(filtered);
    } else {
        const filtered = propiedades.filter(prop =>
            prop.titulo.toLowerCase().includes(term) ||
            prop.ciudad.toLowerCase().includes(term) ||
            prop.estado.toLowerCase().includes(term)
        );
        renderProperties(filtered);
    }
});

// ============================================================
//  PROPIEDADES
// ============================================================

async function loadProperties() {
    try {
        const response = await fetch(`${API_URL}/propiedades.php`);
        const data = await response.json();
        if (data.success) {
            propiedades = data.data;
            renderProperties(propiedades);
        }
    } catch (error) {
        console.error('Error cargando propiedades:', error);
        document.getElementById('propertiesTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #EF4444;">
                    Error al cargar propiedades. Verifique la conexión a la base de datos.
                </td>
            </tr>
        `;
    }
}

function renderProperties(props) {
    const tbody = document.getElementById('propertiesTableBody');
    if (props.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #64748B;">No hay propiedades registradas</td></tr>`;
        return;
    }
    tbody.innerHTML = props.map(prop => `
        <tr>
            <td>${prop.id}</td>
            <td>
                <div class="property-title">${prop.titulo}</div>
                <div class="property-location">${prop.ciudad}, ${prop.estado}</div>
            </td>
            <td>${prop.tipo_nombre || 'N/A'}</td>
            <td>$${formatPrice(prop.precio)}</td>
            <td><span class="status-badge status-${prop.estado_propiedad}">${prop.estado_propiedad}</span></td>
            <td>${prop.destacada == 1 ? '<span class="material-icons" style="color: #F59E0B;">star</span>' : '-'}</td>
            <td>${prop.en_carousel == 1 ? '<span class="material-icons" style="color: #10B981;">check_circle</span>' : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon edit" onclick="editProperty(${prop.id})"><span class="material-icons">edit</span></button>
                    <button class="btn-icon delete" onclick="deleteProperty(${prop.id})"><span class="material-icons">delete</span></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-MX').format(price);
}

// --- Property Modal ---
const modal = document.getElementById('propertyModal');
const modalTitle = document.getElementById('modalTitle');
const propertyForm = document.getElementById('propertyForm');

document.getElementById('btnAddProperty').addEventListener('click', () => openModal());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

function openModal(property = null) {
    editingPropertyId = property ? property.id : null;
    modalTitle.textContent = property ? 'Editar Propiedad' : 'Agregar Propiedad';

    if (property) {
        document.getElementById('propertyId').value = property.id;
        document.getElementById('titulo').value = property.titulo;
        document.getElementById('descripcion').value = property.descripcion || '';
        document.getElementById('tipo_propiedad_id').value = property.tipo_propiedad_id;
        document.getElementById('precio').value = property.precio;
        document.getElementById('direccion').value = property.direccion;
        document.getElementById('ciudad').value = property.ciudad;
        document.getElementById('estado').value = property.estado;
        document.getElementById('habitaciones').value = property.habitaciones || '';
        document.getElementById('banos').value = property.banos || '';
        document.getElementById('estacionamientos').value = property.estacionamientos || '';
        document.getElementById('metros_cuadrados').value = property.metros_cuadrados || '';
        document.getElementById('estado_propiedad').value = property.estado_propiedad;
        document.getElementById('destacada').checked = property.destacada == 1;
        document.getElementById('en_carousel').checked = property.en_carousel == 1;
        document.getElementById('mejor_venta').checked = property.mejor_venta == 1;
        document.getElementById('imagen_principal').value = property.imagen_principal || '';
    } else {
        propertyForm.reset();
    }

    // Image preview
    if (property && property.imagen_principal) {
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('currentImagePreview');
        const src = property.imagen_principal.startsWith('http')
            ? property.imagen_principal
            : `${API_URL}/imagenes/${property.imagen_principal}`;
        previewImg.src = src;
        previewContainer.style.display = 'block';
    } else {
        document.getElementById('imagePreviewContainer').style.display = 'none';
        if (!property) {
            propertyForm.reset();
            document.getElementById('propertyId').value = '';
        }
    }

    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    propertyForm.reset();
    editingPropertyId = null;
}

window.editProperty = async function (id) {
    const property = propiedades.find(p => p.id == id);
    if (property) openModal(property);
};

window.deleteProperty = async function (id) {
    const confirmed = await showConfirmationModal('¿Eliminar propiedad?', 'Esta acción eliminará la propiedad permanentemente y no se puede deshacer.');
    if (!confirmed) return;
    try {
        const response = await fetch(`${API_URL}/propiedades.php?id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showSuccessModal('Propiedad eliminada exitosamente'); loadProperties(); }
        else { alert('Error al eliminar propiedad: ' + data.message); }
    } catch (error) { alert('Error al conectar con el servidor'); }
};

// Save Property
propertyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('tipo_propiedad_id', document.getElementById('tipo_propiedad_id').value);
    formData.append('precio', document.getElementById('precio').value);
    formData.append('direccion', document.getElementById('direccion').value);
    formData.append('ciudad', document.getElementById('ciudad').value);
    formData.append('estado', document.getElementById('estado').value);
    formData.append('habitaciones', document.getElementById('habitaciones').value || 0);
    formData.append('banos', document.getElementById('banos').value || 0);
    formData.append('estacionamientos', document.getElementById('estacionamientos').value || 0);
    formData.append('metros_cuadrados', document.getElementById('metros_cuadrados').value || 0);
    formData.append('estado_propiedad', document.getElementById('estado_propiedad').value);
    formData.append('destacada', document.getElementById('destacada').checked ? 1 : 0);
    formData.append('en_carousel', document.getElementById('en_carousel').checked ? 1 : 0);
    formData.append('mejor_venta', document.getElementById('mejor_venta').checked ? 1 : 0);

    const fileInput = document.getElementById('imagen_file');
    if (fileInput.files.length > 0) {
        formData.append('imagen', fileInput.files[0]);
    } else {
        formData.append('imagen_principal', document.getElementById('imagen_principal').value);
    }

    try {
        let url = `${API_URL}/propiedades.php`;
        if (editingPropertyId) formData.append('id', editingPropertyId);

        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();

        if (data.success) {
            showSuccessModal('Propiedad guardada exitosamente');
            closeModal();
            loadProperties();
        } else { alert('Error: ' + data.message); }
    } catch (error) { alert('Error al conectar con el servidor: ' + error.message); }
});

// ============================================================
//  AGENTES
// ============================================================

async function loadAgentes() {
    try {
        const response = await fetch(`${API_URL}/agentes.php`);
        const data = await response.json();
        if (data.success) {
            agentes = data.data;
            renderAgentes(agentes);
        }
    } catch (error) {
        console.error('Error cargando agentes:', error);
        document.getElementById('agentsGrid').innerHTML = `
            <div class="loading-placeholder" style="color:#EF4444;">
                <span class="material-icons" style="font-size:3rem;">error</span>
                <p>Error al cargar agentes</p>
            </div>`;
    }
}

function renderAgentes(list) {
    const grid = document.getElementById('agentsGrid');
    if (list.length === 0) {
        grid.innerHTML = `
            <div class="loading-placeholder">
                <span class="material-icons" style="font-size:3rem;color:#64748B;">people_outline</span>
                <p>No hay agentes registrados</p>
            </div>`;
        return;
    }

    grid.innerHTML = list.map(agent => {
        const initials = `${(agent.nombre || '')[0] || ''}${(agent.apellido || '')[0] || ''}`.toUpperCase();
        const statusClass = agent.activo == 1 ? 'active' : 'inactive';
        const statusText = agent.activo == 1 ? 'Activo' : 'Inactivo';

        return `
        <div class="agent-card" data-id="${agent.id}">
            <div class="agent-card-header">
                <div class="agent-avatar">${initials}</div>
                <div class="agent-info">
                    <h3 class="agent-name">${agent.nombre} ${agent.apellido}</h3>
                    <span class="agent-cargo">${agent.cargo || 'Sin cargo'}</span>
                </div>
                <span class="agent-status agent-status-${statusClass}">${statusText}</span>
            </div>
            <div class="agent-card-body">
                <div class="agent-detail"><span class="material-icons">email</span> ${agent.email}</div>
                <div class="agent-detail"><span class="material-icons">phone</span> ${agent.telefono || 'N/A'}</div>
                <div class="agent-detail"><span class="material-icons">home_work</span> ${agent.total_propiedades || 0} propiedades asignadas</div>
            </div>
            <div class="agent-card-actions">
                <button class="btn-agent-action btn-assign" onclick="openAssignModal(${agent.id})">
                    <span class="material-icons">assignment</span> Propiedades
                </button>
                <button class="btn-agent-action btn-edit" onclick="editAgent(${agent.id})">
                    <span class="material-icons">edit</span>
                </button>
                <button class="btn-agent-action btn-delete" onclick="deleteAgent(${agent.id})">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// --- Agent Modal ---
const agentModal = document.getElementById('agentModal');
const agentForm = document.getElementById('agentForm');

document.getElementById('btnAddAgent').addEventListener('click', () => openAgentModal());
document.getElementById('closeAgentModal').addEventListener('click', closeAgentModal);
document.getElementById('cancelAgentModal').addEventListener('click', closeAgentModal);

function openAgentModal(agent = null) {
    editingAgentId = agent ? agent.id : null;
    document.getElementById('agentModalTitle').textContent = agent ? 'Editar Agente' : 'Agregar Agente';

    if (agent) {
        document.getElementById('agentId').value = agent.id;
        document.getElementById('agentNombre').value = agent.nombre;
        document.getElementById('agentApellido').value = agent.apellido;
        document.getElementById('agentEmail').value = agent.email;
        document.getElementById('agentTelefono').value = agent.telefono || '';
        document.getElementById('agentCargo').value = agent.cargo || '';
        document.getElementById('agentAntiguedad').value = agent.antiguedad || '';
        document.getElementById('agentActivo').checked = agent.activo == 1;
    } else {
        agentForm.reset();
        document.getElementById('agentActivo').checked = true;
        document.getElementById('agentId').value = '';
    }

    agentModal.style.display = 'flex';
}

function closeAgentModal() {
    agentModal.style.display = 'none';
    agentForm.reset();
    editingAgentId = null;
}

window.editAgent = function (id) {
    const agent = agentes.find(a => a.id == id);
    if (agent) openAgentModal(agent);
};

window.deleteAgent = async function (id) {
    const confirmed = await showConfirmationModal('¿Eliminar agente?', 'Esta acción eliminará al agente y todas sus asignaciones de propiedades.');
    if (!confirmed) return;
    try {
        const response = await fetch(`${API_URL}/agentes.php?id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) { showSuccessModal('Agente eliminado exitosamente'); loadAgentes(); }
        else { alert('Error al eliminar agente: ' + data.message); }
    } catch (error) { alert('Error al conectar con el servidor'); }
};

// Save Agent
agentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nombre: document.getElementById('agentNombre').value,
        apellido: document.getElementById('agentApellido').value,
        email: document.getElementById('agentEmail').value,
        telefono: document.getElementById('agentTelefono').value,
        cargo: document.getElementById('agentCargo').value,
        antiguedad: document.getElementById('agentAntiguedad').value,
        activo: document.getElementById('agentActivo').checked ? 1 : 0
    };

    if (editingAgentId) payload.id = editingAgentId;

    try {
        const response = await fetch(`${API_URL}/agentes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.success) {
            showSuccessModal(editingAgentId ? 'Agente actualizado exitosamente' : 'Agente creado exitosamente');
            closeAgentModal();
            loadAgentes();
        } else { alert('Error: ' + data.message); }
    } catch (error) { alert('Error al conectar con el servidor: ' + error.message); }
});

// ============================================================
//  ASSIGN PROPERTIES MODAL
// ============================================================

const assignModal = document.getElementById('assignModal');
document.getElementById('closeAssignModal').addEventListener('click', closeAssignModal);
document.getElementById('cancelAssignModal').addEventListener('click', closeAssignModal);

window.openAssignModal = async function (agentId) {
    currentAssignAgentId = agentId;
    const agent = agentes.find(a => a.id == agentId);
    document.getElementById('assignModalTitle').textContent = `Propiedades de ${agent ? agent.nombre + ' ' + agent.apellido : 'Agente'}`;
    document.getElementById('assignSubtitle').textContent = 'Solo se muestran propiedades disponibles (no asignadas a otros agentes)';
    document.getElementById('assignSearchInput').value = '';

    assignModal.style.display = 'flex';
    document.getElementById('assignPropertiesList').innerHTML = '<p style="text-align:center;color:#64748B;padding:2rem;">Cargando...</p>';

    await loadAvailableProperties();
};

async function loadAvailableProperties(searchTerm = '') {
    try {
        const res = await fetch(`${API_URL}/agentes.php?action=get_properties&agente_id=${currentAssignAgentId}`);
        const data = await res.json();
        let availableProps = data.success ? data.data : [];

        if (searchTerm) {
            availableProps = availableProps.filter(p =>
                p.titulo.toLowerCase().includes(searchTerm) ||
                p.ciudad.toLowerCase().includes(searchTerm) ||
                (p.tipo_nombre && p.tipo_nombre.toLowerCase().includes(searchTerm))
            );
        }

        renderAssignList(availableProps);
    } catch (error) {
        document.getElementById('assignPropertiesList').innerHTML = '<p style="text-align:center;color:#EF4444;">Error al cargar</p>';
    }
}

function renderAssignList(props) {
    const container = document.getElementById('assignPropertiesList');

    if (props.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#64748B;padding:2rem;">No hay propiedades disponibles</p>';
        return;
    }

    container.innerHTML = props.map(prop => {
        const isAssigned = prop.asignada == 1;
        return `
        <div class="assign-property-item ${isAssigned ? 'assigned' : ''}" data-prop-id="${prop.id}">
            <label class="assign-checkbox-label">
                <input type="checkbox" class="assign-checkbox" data-prop-id="${prop.id}" ${isAssigned ? 'checked' : ''}>
                <div class="assign-property-info">
                    <div class="assign-property-title">${prop.titulo}</div>
                    <div class="assign-property-meta">
                        <span>${prop.tipo_nombre || 'N/A'}</span>
                        <span>•</span>
                        <span>${prop.ciudad}, ${prop.estado}</span>
                        <span>•</span>
                        <span>$${formatPrice(prop.precio)}</span>
                    </div>
                </div>
                <span class="assign-status-badge status-${prop.estado_propiedad}">${prop.estado_propiedad}</span>
            </label>
        </div>`;
    }).join('');

    // Bind checkbox events
    container.querySelectorAll('.assign-checkbox').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const propId = e.target.dataset.propId;
            const item = e.target.closest('.assign-property-item');

            e.target.disabled = true;
            try {
                const action = e.target.checked ? 'assign_property' : 'unassign_property';
                const res = await fetch(`${API_URL}/agentes.php?action=${action}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agente_id: currentAssignAgentId, propiedad_id: propId })
                });
                const data = await res.json();

                if (data.success) {
                    item.classList.toggle('assigned', e.target.checked);
                } else {
                    e.target.checked = !e.target.checked;
                    alert('Error: ' + data.message);
                }
            } catch (err) {
                e.target.checked = !e.target.checked;
                alert('Error de conexión');
            }
            e.target.disabled = false;
        });
    });
}

// Search within assign modal
document.getElementById('assignSearchInput').addEventListener('input', async (e) => {
    const term = e.target.value.toLowerCase();
    await loadAvailableProperties(term);
});

function closeAssignModal() {
    assignModal.style.display = 'none';
    currentAssignAgentId = null;
    loadAgentes(); // Refresh to update count
}

// ============================================================
//  SHARED: Confirmation & Success Modals
// ============================================================

const confirmationModal = document.getElementById('confirmationModal');
const btnConfirmCancel = document.getElementById('btnConfirmCancel');
const btnConfirmAction = document.getElementById('btnConfirmAction');
let confirmResolve = null;

function showConfirmationModal(title, message) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmationModal.style.display = 'flex';
    return new Promise((resolve) => { confirmResolve = resolve; });
}

if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
        if (confirmResolve) confirmResolve(false);
    });
}

if (btnConfirmAction) {
    btnConfirmAction.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
        if (confirmResolve) confirmResolve(true);
    });
}

if (confirmationModal) {
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none';
            if (confirmResolve) confirmResolve(false);
        }
    });
}

// Success Modal
const successModal = document.getElementById('successModal');
const btnSuccessClose = document.getElementById('btnSuccessClose');

function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    successModal.style.display = 'flex';
}

if (btnSuccessClose) {
    btnSuccessClose.addEventListener('click', () => { successModal.style.display = 'none'; });
}
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) successModal.style.display = 'none';
});
