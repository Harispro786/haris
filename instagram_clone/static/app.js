document.addEventListener('DOMContentLoaded', async () => {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const feed = document.getElementById('feed');
    const photoInput = document.getElementById('photo-input');
    const uploadBtn = document.getElementById('upload-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');

    const checkLoginStatus = async () => {
        try {
            const response = await fetch('/dashboard');
            return response.ok;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    };

    const fetchFeed = async () => {
        try {
            const response = await fetch('/feed');
            console.log('Feed response status:', response.status);
            if (!response.ok) {
                console.error('Failed to fetch feed.');
                return;
            }
            const photos = await response.json();
            console.log('Photos from feed:', photos);
            feed.innerHTML = '';
            photos.forEach(photo => {
                const container = document.createElement('div');
                container.className = 'photo-card';
                const user = document.createElement('p');
                user.textContent = photo.user;
                const img = document.createElement('img');
                img.src = `/uploads/${photo.filename}`;
                container.appendChild(user);
                container.appendChild(img);
                feed.appendChild(container);
            });
        } catch (error) {
            console.error('Error fetching feed:', error);
        }
    };

    if (authContainer && appContainer) {
        const loggedIn = await checkLoginStatus();
        if (loggedIn) {
            authContainer.style.display = 'none';
            appContainer.style.display = 'block';
            fetchFeed();
        } else {
            authContainer.style.display = 'block';
            appContainer.style.display = 'none';
        }
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                window.location.href = '/login';
            } else {
                alert('Signup failed.');
            }
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Login failed.');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch('/logout');
            window.location.href = '/login';
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            const file = photoInput.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('photo', file);
                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    console.log('Upload response status:', response.status);
                    if (response.ok) {
                        console.log('Upload successful, fetching feed.');
                        fetchFeed();
                        photoInput.value = '';
                    } else {
                        console.error('Upload failed with status:', response.status);
                        alert('Upload failed.');
                    }
                } catch (error) {
                    console.error('Error during upload:', error);
                    alert('Upload failed due to a network error.');
                }
            }
        });
    }
});
