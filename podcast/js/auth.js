// Auth UI Elements
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const modalTitle = document.getElementById('modalTitle');
const switchMode = document.getElementById('switchMode');
const closeBtn = authModal.querySelector('.close');

// Auth Buttons
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userHello = document.getElementById('userHello');

let isLoginMode = true;

// --- User Persistence Functions ---

// 1. Initial Mock User Data
const INITIAL_USERS = {
    'test@example.com': { password: 'password', name: 'Ji' }
};

// 2. Load users from localStorage or return initial data
function loadUsers() {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    // Save initial users to storage for the first time
    saveUsers(INITIAL_USERS);
    return INITIAL_USERS;
}

// 3. Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('mockUsers', JSON.stringify(users));
}

let mockUsers = loadUsers(); // Load the persisted users on script start

// --- User Session Management ---

function setCurrentUser(email, name) {
    localStorage.setItem('currentUser', JSON.stringify({ email, name }));
    updateAuthUI();
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
    // Re-render list to ensure UI updates after logout
    if (typeof renderList === 'function' && typeof PODCASTS !== 'undefined') {
        renderList(PODCASTS);
    }
}

// --- UI Logic ---
function updateAuthUI() {
    const user = getCurrentUser();
    if (user) {
        // Logged in state
        loginBtn.classList.add('hidden');
        signupBtn.classList.add('hidden');
        userHello.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        userHello.textContent = `${user.name}님, 환영합니다!`;
    } else {
        // Logged out state
        loginBtn.classList.remove('hidden');
        signupBtn.classList.remove('hidden');
        userHello.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        userHello.textContent = '';
    }
}

function showModal(mode) {
    isLoginMode = mode === 'login';
    modalTitle.textContent = isLoginMode ? '로그인' : '회원가입';
    switchMode.innerHTML = isLoginMode 
        ? '계정이 없으신가요? <b>회원가입</b>' 
        : '이미 계정이 있으신가요? <b>로그인</b>';
    authForm.reset();
    authModal.classList.remove('hidden');
}

// --- Event Listeners ---
loginBtn.addEventListener('click', () => showModal('login'));
signupBtn.addEventListener('click', () => showModal('signup'));
logoutBtn.addEventListener('click', logout);
closeBtn.addEventListener('click', () => authModal.classList.add('hidden'));

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.add('hidden');
    }
});

// Switch between login and signup modes
switchMode.addEventListener('click', () => {
    showModal(isLoginMode ? 'signup' : 'login');
});

// Form submission handler
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authForm.email.value;
    const password = authForm.password.value;
    
    // Check if the user exists in the currently loaded mockUsers
    const user = mockUsers[email];

    if (isLoginMode) {
        // Login Logic
        if (user && user.password === password) {
            setCurrentUser(email, user.name);
            authModal.classList.add('hidden');
            alert(`${user.name}님, 로그인 성공!`);
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    } else {
        // Signup Logic
        if (user) {
            alert('이미 존재하는 이메일입니다.');
        } else {
            // Add new user to the mockUsers object
            const newName = email.split('@')[0];
            mockUsers[email] = { password, name: newName };
            
            // IMPORTANT: Save the updated mockUsers object to localStorage
            saveUsers(mockUsers);
            
            // Log the new user in
            setCurrentUser(email, newName);
            authModal.classList.add('hidden');
            alert(`${newName}님, 회원가입 및 로그인 성공!`);
        }
    }
});

// Initialize UI state on page load
updateAuthUI();