class SocialWall {
    constructor() {
        this.currentUser = null;
        this.onlineUsers = [];
        this.posts = [];
        
        this.initializeEventListeners();
        this.checkAuthStatus();
    }
    
    initializeEventListeners() {
        // Toggle entre login y registro
        document.getElementById('login-tab').addEventListener('click', () => this.showForm('login'));
        document.getElementById('register-tab').addEventListener('click', () => this.showForm('register'));
        
        // Formularios de autenticación
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // Publicar mensaje
        document.getElementById('post-form').addEventListener('submit', (e) => this.handlePost(e));
    }
    
    showForm(formType) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        if (formType === 'login') {
            document.getElementById('login-tab').classList.add('active');
            document.getElementById('login-form').classList.add('active');
        } else {
            document.getElementById('register-tab').classList.add('active');
            document.getElementById('register-form').classList.add('active');
        }
        
        this.clearMessage();
    }
    
    clearMessage() {
        const messageEl = document.getElementById('message');
        messageEl.textContent = '';
        messageEl.className = 'message';
    }
    
    showMessage(message, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
    }
    
    async checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/check');
            const data = await response.json();
            
            if (data.loggedIn) {
                this.currentUser = data.user;
                this.showWall();
            } else {
                this.showAuth();
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            this.showAuth();
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.showWall();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Error de conexión', 'error');
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.showWall();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Error de conexión', 'error');
        }
    }
    
    async handleLogout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            });
            
            this.currentUser = null;
            this.showAuth();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
    
    async handlePost(e) {
        e.preventDefault();
        
        const content = document.getElementById('post-content').value.trim();
        
        if (!content) return;
        
        // En una implementación real, aquí enviarías el post al servidor
        this.addPost({
            id: Date.now(),
            author: this.currentUser.username,
            content: content,
            date: new Date().toLocaleString(),
            likes: 0,
            comments: []
        });
        
        document.getElementById('post-content').value = '';
    }
    
    addPost(post) {
        this.posts.unshift(post);
        this.renderPosts();
    }
    
    showAuth() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('wall-container').classList.add('hidden');
    }
    
    showWall() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('wall-container').classList.remove('hidden');
        
        document.getElementById('current-user').textContent = this.currentUser.username;
        
        // Simular usuarios en línea (en una app real esto vendría del servidor)
        this.onlineUsers = [
            this.currentUser.username,
            'Usuario2',
            'Usuario3',
            'Usuario4'
        ];
        
        this.renderOnlineUsers();
        this.loadSamplePosts();
    }
    
    renderOnlineUsers() {
        const list = document.getElementById('online-users-list');
        list.innerHTML = this.onlineUsers.map(user => 
            `<li>${user}${user === this.currentUser.username ? ' (Tú)' : ''}</li>`
        ).join('');
    }
    
    loadSamplePosts() {
        this.posts = [
            {
                id: 1,
                author: 'Usuario2',
                content: '¡Hola a todos! Este es un ejemplo de publicación en el muro social.',
                date: '2023-10-15 14:30',
                likes: 5,
                comments: []
            },
            {
                id: 2,
                author: 'Usuario3',
                content: 'Me encanta esta nueva plataforma. ¡Es genial poder conectarnos así!',
                date: '2023-10-15 13:45',
                likes: 3,
                comments: []
            }
        ];
        
        this.renderPosts();
    }
    
    renderPosts() {
        const container = document.getElementById('posts-container');
        
        if (this.posts.length === 0) {
            container.innerHTML = '<p>No hay publicaciones aún. ¡Sé el primero en publicar!</p>';
            return;
        }
        
        container.innerHTML = this.posts.map(post => `
            <div class="post">
                <div class="post-header">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${post.date}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="like-btn" onclick="socialWall.likePost(${post.id})">
                        <i class="fas fa-thumbs-up"></i> Me gusta (${post.likes})
                    </button>
                    <button class="comment-btn">
                        <i class="fas fa-comment"></i> Comentar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.likes++;
            this.renderPosts();
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.socialWall = new SocialWall();
});