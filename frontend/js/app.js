// Absolute URL so this works no matter how the frontend static files are
// served (double-clicked, Live Server, XAMPP, etc). Run the backend with
// `php artisan serve` (default port 8000) or update this if you use a
// different host/port.
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';

/*
|--------------------------------------------------------------------------
| THEME (LIGHT / DARK MODE)
|--------------------------------------------------------------------------
| Applied as early as possible (before DOMContentLoaded) to avoid a flash
| of the wrong theme. Persisted in localStorage so it sticks across pages.
*/

function applyStoredTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const current = localStorage.getItem('theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
}

applyStoredTheme();

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Perform API request
async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data && (method !== 'GET' && method !== 'HEAD')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Handle unauthorized
        if (response.status === 401 && !window.location.pathname.includes('login.html')) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            return null;
        }

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Logout
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Get the current user's role slug, e.g. "super_admin" or "admin".
function getUserRole() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    if (Array.isArray(user.roles) && user.roles.length > 0) {
        return user.roles[0].name;
    }
    return user.role || null;
}

// There are only 2 roles on the web dashboard: Super Admin and
// Admin (a.k.a. Barangay Admin — same account/role, just a friendlier label).
function getRoleDisplayName(role) {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Barangay Admin';
    return role || 'User';
}

// Where each role should land after logging in / when visiting "home".
function getHomePage(role) {
    return role === 'super_admin' ? 'analytics.html' : 'barangay-overview.html';
}

function loadSidebar() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const role = getUserRole();
    const isSuperAdmin = role === 'super_admin';
    const roleLabel = getRoleDisplayName(role);

    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
        sidebarHeader.innerHTML = '<span class="brand-katok">Katok</span><span class="brand-kalinisan">Kalinis</span>';
    }

    let links = '';

    if (isSuperAdmin) {
        // Super Admin module
        links += `<a href="trucks.html" class="nav-link" id="nav-trucks">Monitor Truck</a>`;
        links += `<a href="analytics.html" class="nav-link" id="nav-analytics">Dashboard Analytics</a>`;
        links += `<a href="employees.html" class="nav-link" id="nav-employees">Employee</a>`;
        links += `<a href="contractors.html" class="nav-link" id="nav-contractors">Contractor</a>`;
        links += `<a href="reports.html" class="nav-link" id="nav-reports">Reports</a>`;
        links += `<a href="schedule.html" class="nav-link" id="nav-schedule">Schedule</a>`;
        links += `<a href="vendors.html" class="nav-link" id="nav-vendors">Vendor</a>`;
        links += `<a href="attendance.html" class="nav-link" id="nav-attendance">Attendance</a>`;
    } else {
        // Admin / Barangay Admin module
        links += `<a href="barangay-overview.html" class="nav-link" id="nav-overview">Barangay Overview</a>`;
        links += `<a href="trucks.html" class="nav-link" id="nav-trucks">Monitor Truck</a>`;
        links += `<a href="residents.html" class="nav-link" id="nav-residents">Resident</a>`;
        links += `<a href="schedule.html" class="nav-link" id="nav-schedule">Collection Schedule</a>`;
        links += `<a href="reports.html" class="nav-link" id="nav-reports">Report &amp; Issues</a>`;
        links += `<a href="attendance.html" class="nav-link" id="nav-attendance">Attendance</a>`;
        links += `<a href="users.html" class="nav-link" id="nav-users">User Profiles</a>`;
        links += `<a href="archives.html" class="nav-link" id="nav-archives">Records</a>`;
    }

    links += `<a href="settings.html" class="nav-link" id="nav-settings">Settings</a>`;

    const navContainer = document.getElementById('sidebar-nav');
    if (navContainer) {
        navContainer.innerHTML = links;
        
        // Highlight active link
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const activeLink = document.querySelector(`.nav-link[href="${currentPath}"]`);
        if(activeLink) activeLink.classList.add('active');
    }

    // Name + role block at the top of the sidebar (matches the wireframe).
    const roleContainer = document.getElementById('sidebar-role');
    if (roleContainer) {
        roleContainer.innerHTML = `<strong>${user.name}</strong>${roleLabel}`;
    }

    const userNameEl = document.getElementById('topbar-user');
    if (userNameEl) {
        userNameEl.textContent = `Welcome, ${user.name} (${roleLabel})`;
    }
}

// Run auth check on load
checkAuth();

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('login.html')) {
        loadSidebar();
    }
});
