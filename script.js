// Hobby data with colors and icons
const hobbies = [
    { name: '뜨개질', icon: '🧶', color: '#FF6B6B', count: 90 },
    { name: '독서', icon: '📚', color: '#4ECDC4', count: 280 },
    { name: '필사', icon: '✍️', color: '#45B7D1', count: 50 },
    { name: '다이어리 꾸미기', icon: '📔', color: '#FFA07A', count: 150 },
    { name: '헬스', icon: '💪', color: '#98D8C8', count: 220 },
    { name: '요가', icon: '🧘', color: '#F7DC6F', count: 130 },
    { name: '수영', icon: '🏊', color: '#BB8FCE', count: 80 },
    { name: '자격증 취득', icon: '📜', color: '#F1C40F', count: 110 }
];

const totalMembers = hobbies.reduce((sum, hobby) => sum + hobby.count, 0);

// Initialize charts
let barChart, pieChart;

// Load comments from localStorage
function loadComments() {
    const saved = localStorage.getItem('hobbyComments');
    return saved ? JSON.parse(saved) : {};
}

// Save comments to localStorage
function saveComments(comments) {
    localStorage.setItem('hobbyComments', JSON.stringify(comments));
}

// Load attendance from localStorage
function loadAttendance() {
    const saved = localStorage.getItem('hobbyAttendance');
    // Ensure we reset attendance if it's a new day (optional, but good for daily attendance)
    // For this demo, we'll keep it simple and just load all
    return saved ? JSON.parse(saved) : [];
}

// Save attendance to localStorage
function saveAttendance(attendance) {
    localStorage.setItem('hobbyAttendance', JSON.stringify(attendance));
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateVisitorCount();
    updateTotalMembers();
    createHobbyCards();
    createTabs();
    createCharts();
    updateTotalPosts();
    initAttendance();
});

// Update visitor count
function updateVisitorCount() {
    let count = localStorage.getItem('visitorCount');
    if (!count) count = 0;

    // Increment visitor count (in a real app, you'd check session to avoid spamming)
    // Simple implementation: increment on every load
    count = parseInt(count) + 1;
    localStorage.setItem('visitorCount', count);

    const counterElement = document.getElementById('visitor-count');
    if (counterElement) {
        counterElement.textContent = count.toLocaleString();
    }
}

// Initialize attendance section
function initAttendance() {
    const form = document.getElementById('attendance-form');
    if (form) {
        form.addEventListener('submit', handleAttendanceSubmit);
    }
    updateAttendanceDisplay();
}

// Handle attendance submit
function handleAttendanceSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('attendance-name');
    const name = nameInput.value.trim();

    if (!name) return;

    const attendanceList = loadAttendance();

    // Check if already checked in today (simple name check)
    const today = new Date().toLocaleDateString();
    /* 
       For simplicity in this demo, we allow multiple check-ins.
       Uncomment to restrict:
       const alreadyCheckedIn = attendanceList.some(item => 
           item.name === name && new Date(item.date).toLocaleDateString() === today
       );
       if (alreadyCheckedIn) {
           alert('이미 오늘 출석하셨습니다!');
           return;
       }
    */

    const newAttendance = {
        id: Date.now(),
        name: name,
        date: new Date().toISOString()
    };

    attendanceList.unshift(newAttendance); // Add to top
    saveAttendance(attendanceList);

    nameInput.value = '';

    // Show success feedback on button
    const button = e.target.querySelector('.submit-button');
    const originalText = button.textContent;
    button.textContent = '✓ 완료!';
    button.style.backgroundColor = '#4ECDC4';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);

    updateAttendanceDisplay();
}

// Update attendance display
function updateAttendanceDisplay() {
    const list = loadAttendance();
    const container = document.getElementById('attendance-list');
    const todayCountEl = document.getElementById('today-attendance');
    const totalCountEl = document.getElementById('total-attendance');

    if (!container) return;

    // Calculate stats
    const today = new Date().toLocaleDateString();
    const todayCount = list.filter(item => new Date(item.date).toLocaleDateString() === today).length;

    if (todayCountEl) todayCountEl.textContent = todayCount.toLocaleString();
    if (totalCountEl) totalCountEl.textContent = list.length.toLocaleString();

    // Render list (show last 50)
    if (list.length === 0) {
        container.innerHTML = '<div class="no-attendance">오늘 첫 번째로 출석해보세요! 👋</div>';
        return;
    }

    container.innerHTML = list.slice(0, 50).map(item => {
        const date = new Date(item.date);
        const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

        // Show "Today" or date
        const displayDate = date.toLocaleDateString() === today ? '오늘' : dateStr;

        return `
            <div class="attendance-item">
                <span class="attendance-name">${escapeHtml(item.name)}</span>
                <span class="attendance-time">${displayDate} ${timeStr}</span>
            </div>
        `;
    }).join('');
}

// Update total members display
function updateTotalMembers() {
    const el = document.getElementById('total-members');
    if (el) el.textContent = totalMembers.toLocaleString();
}

// Update total posts count
function updateTotalPosts() {
    const comments = loadComments();
    const totalPosts = Object.values(comments).reduce((sum, arr) => sum + arr.length, 0);
    const el = document.getElementById('total-posts');
    if (el) el.textContent = totalPosts.toLocaleString();
}

// Create hobby cards
function createHobbyCards() {
    const container = document.getElementById('hobby-cards');

    hobbies.forEach(hobby => {
        const percentage = ((hobby.count / totalMembers) * 100).toFixed(1);

        const card = document.createElement('div');
        card.className = 'hobby-card';
        card.style.borderColor = hobby.color + '40';

        card.innerHTML = `
            <div class="hobby-icon">${hobby.icon}</div>
            <div class="hobby-name">${hobby.name}</div>
            <div class="hobby-count" style="color: ${hobby.color}">${hobby.count.toLocaleString()}명</div>
            <div class="hobby-percentage">${percentage}%</div>
        `;

        card.addEventListener('click', () => {
            document.getElementById('community').scrollIntoView({ behavior: 'smooth' });
            switchTab(hobby.name);
        });

        container.appendChild(card);
    });
}

// Create tabs
function createTabs() {
    const tabsContainer = document.getElementById('hobby-tabs');
    const contentContainer = document.getElementById('tab-content');

    hobbies.forEach((hobby, index) => {
        // Create tab button
        const button = document.createElement('button');
        button.className = 'tab-button';
        button.id = `tab-${hobby.name}`;
        button.textContent = `${hobby.icon} ${hobby.name}`;
        button.style.borderColor = hobby.color + '40';

        if (index === 0) {
            button.classList.add('active');
            button.style.borderColor = hobby.color;
            button.style.background = hobby.color + '20';
        }

        button.addEventListener('click', () => switchTab(hobby.name));
        tabsContainer.appendChild(button);

        // Create tab panel
        const panel = document.createElement('div');
        panel.className = 'tab-panel';
        panel.id = `panel-${hobby.name}`;

        if (index === 0) {
            panel.classList.add('active');
        }

        panel.innerHTML = createTabContent(hobby);
        contentContainer.appendChild(panel);
    });

    // Add event listeners for comment forms
    hobbies.forEach(hobby => {
        const form = document.getElementById(`form-${hobby.name}`);
        form.addEventListener('submit', (e) => handleCommentSubmit(e, hobby.name));
    });

    // Load and display existing comments
    displayAllComments();
}

// Create tab content HTML
function createTabContent(hobby) {
    const percentage = ((hobby.count / totalMembers) * 100).toFixed(1);

    // Image gallery for Knitting tab
    let galleryHtml = '';
    if (hobby.name === '뜨개질') {
        let imagesHtml = '';
        // Try to load up to 20 images
        for (let i = 1; i <= 20; i++) {
            // Flexible loading: supports 'image 1.png', 'image 1.jpg', 'image1.png', 'image1.jpg'
            imagesHtml += `
                <div class="gallery-item" style="display: none;" id="gallery-item-${i}" onclick="openImageModal(${i})">
                    <!-- PNG with space -->
                    <img src="image/image ${i}.png" style="display:none"
                         onload="this.style.display='block'; document.getElementById('gallery-item-${i}').style.display='flex'" 
                         onerror="this.remove()">
                         
                    <!-- JPG with space -->
                    <img src="image/image ${i}.jpg" style="display:none"
                         onload="this.style.display='block'; document.getElementById('gallery-item-${i}').style.display='flex'" 
                         onerror="this.remove()">

                    <!-- PNG no space -->
                    <img src="image/image${i}.png" style="display:none"
                         onload="this.style.display='block'; document.getElementById('gallery-item-${i}').style.display='flex'" 
                         onerror="this.remove()">
                         
                    <!-- JPG no space -->
                    <img src="image/image${i}.jpg" style="display:none"
                         onload="this.style.display='block'; document.getElementById('gallery-item-${i}').style.display='flex'" 
                         onerror="this.remove()">
                         
                    <div class="gallery-overlay" style="position: absolute; inset:0; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; opacity:0; transition:0.3s; color:white; font-weight:bold; cursor:pointer;">
                        💬 댓글 남기기
                    </div>
                </div>
            `;
        }

        galleryHtml = `
            <style>
                .gallery-item { position: relative; }
                .gallery-item:hover .gallery-overlay { opacity: 1 !important; }
            </style>
            <div class="gallery-section">
                <h3 class="gallery-title">🧶 뜨개질 작품 갤러리</h3>
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1rem;">사진을 클릭하여 작품에 대해 이야기를 나눠보세요!</p>
                <div class="gallery-grid">
                    ${imagesHtml}
                </div>
                <div class="gallery-note" style="margin-top: 10px;">
                    <p>💡 <b>사진 추가 방법</b></p>
                    <p><code>h.w/image</code> 폴더에 <code>image 1.jpg</code>, <code>image 2.jpg</code> ... 와 같이 이름을 저장하면 자동으로 나타납니다. (띄어쓰기 주의)</p>
                </div>
                
                <div class="video-link-wrapper">
                    <a href="https://youtu.be/xa0nTVffjYs?si=JWkXfV0jOYXcxsqe" target="_blank" class="video-link-button">
                        <span class="video-icon">🧶</span> 대바늘 기초 추천 영상
                    </a>
                    <a href="https://youtu.be/KkOPjZ06JmU?si=7q52zLrl_vfkzwBs" target="_blank" class="video-link-button" style="background: #FF6B6B;">
                        <span class="video-icon">🧵</span> 코바늘 기초 추천 영상
                    </a>
                </div>
                <div class="video-link-wrapper" style="margin-top: 1rem;">
                    <a href="https://www.instagram.com/p/C_RvKPnPOkA/?img_index=1" target="_blank" class="video-link-button insta-link-button">
                        <span class="video-icon">★</span> 이번 주 추천 도안 살펴보기
                    </a>
                </div>
            </div>
        `;
    }

    return `
        <div class="community-header" style="border-color: ${hobby.color}40">
            <div class="community-title" style="color: ${hobby.color}">
                ${hobby.icon} ${hobby.name} 커뮤니티
            </div>
            <div class="community-description">
                ${hobby.count.toLocaleString()}명 (${percentage}%)의 회원이 ${hobby.name}을(를) 즐기고 있습니다
            </div>
            ${galleryHtml}
        </div>
        
        <div class="comments-section">
            <h3 class="comments-title">💬 게시글</h3>
            <div class="comments-list" id="comments-${hobby.name}">
                <!-- Comments will be inserted here -->
            </div>
            
            <form class="comment-form" id="form-${hobby.name}">
                <div class="form-group">
                    <label class="form-label" for="name-${hobby.name}">이름</label>
                    <input 
                        type="text" 
                        class="form-input" 
                        id="name-${hobby.name}" 
                        placeholder="이름을 입력하세요"
                        required
                    >
                </div>
                <div class="form-group">
                    <label class="form-label" for="comment-${hobby.name}">댓글</label>
                    <textarea 
                        class="form-textarea" 
                        id="comment-${hobby.name}" 
                        placeholder="${hobby.name}에 대한 생각을 공유해주세요..."
                        required
                    ></textarea>
                </div>
                <button type="submit" class="submit-button" style="background: linear-gradient(135deg, ${hobby.color} 0%, ${adjustColor(hobby.color, -30)} 100%)">
                    댓글 작성
                </button>
            </form>
        </div>
    `;
}

// Switch tab
function switchTab(hobbyName) {
    const hobby = hobbies.find(h => h.name === hobbyName);

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        const btnHobby = hobbies.find(h => btn.id === `tab-${h.name}`);
        if (btnHobby) {
            btn.style.borderColor = btnHobby.color + '40';
            btn.style.background = 'var(--bg-glass)';
        }
    });

    const activeButton = document.getElementById(`tab-${hobbyName}`);
    activeButton.classList.add('active');
    activeButton.style.borderColor = hobby.color;
    activeButton.style.background = hobby.color + '20';

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    document.getElementById(`panel-${hobbyName}`).classList.add('active');
}

// Handle comment submission
function handleCommentSubmit(e, hobbyName) {
    e.preventDefault();

    const nameInput = document.getElementById(`name-${hobbyName}`);
    const commentInput = document.getElementById(`comment-${hobbyName}`);

    const name = nameInput.value.trim();
    const text = commentInput.value.trim();

    if (!name || !text) return;

    // Load existing comments
    const allComments = loadComments();
    if (!allComments[hobbyName]) {
        allComments[hobbyName] = [];
    }

    // Add new comment
    const newComment = {
        id: Date.now(),
        author: name,
        text: text,
        date: new Date().toISOString()
    };

    allComments[hobbyName].unshift(newComment);

    // Save to localStorage
    saveComments(allComments);

    // Clear form
    nameInput.value = '';
    commentInput.value = '';

    // Update display
    displayComments(hobbyName);
    updateTotalPosts();

    // Show success animation
    const button = e.target.querySelector('.submit-button');
    const originalText = button.textContent;
    button.textContent = '✓ 작성 완료!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Display comments for a specific hobby
function displayComments(hobbyName) {
    const container = document.getElementById(`comments-${hobbyName}`);
    const allComments = loadComments();
    const comments = allComments[hobbyName] || [];

    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments">아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요! 🎉</div>';
        return;
    }

    container.innerHTML = comments.map(comment => {
        const date = new Date(comment.date);
        const formattedDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.author)}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
            </div>
        `;
    }).join('');
}

// Display all comments
function displayAllComments() {
    hobbies.forEach(hobby => {
        displayComments(hobby.name);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create charts
function createCharts() {
    const labels = hobbies.map(h => h.name);
    const data = hobbies.map(h => h.count);
    const colors = hobbies.map(h => h.color);

    // Bar Chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '인원',
                data: data,
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#2d3748',
                    bodyColor: '#4a5568',
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function (context) {
                            const percentage = ((context.parsed.y / totalMembers) * 100).toFixed(1);
                            return `${context.parsed.y}명 (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(102, 126, 234, 0.1)'
                    },
                    ticks: {
                        color: '#4a5568'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#4a5568'
                    }
                }
            }
        }
    });

    // Pie Chart
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#4a5568',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#2d3748',
                    bodyColor: '#4a5568',
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function (context) {
                            const percentage = ((context.parsed / totalMembers) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed}명 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Adjust color brightness
function adjustColor(color, amount) {
    const clamp = (val) => Math.min(Math.max(val, 0), 255);
    const num = parseInt(color.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }

    });
});

// ===== Image Modal Logic =====

let currentImageId = null;

function openImageModal(index) {
    const modal = document.getElementById('image-modal') || createImageModal();
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');

    // Find the visible image source from the gallery item
    const galleryItem = document.getElementById(`gallery-item-${index}`);
    const visibleImg = galleryItem.querySelector('img[style*="block"]');

    if (visibleImg) {
        modalImg.src = visibleImg.src;
        modalTitle.textContent = `뜨개질 작품 #${index}`;
        currentImageId = `image_${index}`;

        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);

        loadImageComments(currentImageId);
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

function createImageModal() {
    const modalHtml = `
        <div id="image-modal" class="modal">
            <div class="modal-content">
                <div class="modal-image-container">
                    <img id="modal-image" src="" alt="Zoomed Image">
                    <button class="like-button-overlay" onclick="toggleImageLike()">
                        <span class="heart-icon">🤍</span> <span id="like-count">0</span>
                    </button>
                </div>
                <div class="modal-sidebar">
                    <div class="modal-header">
                        <h3 class="modal-title" id="modal-title">작품 제목</h3>
                        <button class="close-modal" onclick="closeImageModal()">&times;</button>
                    </div>
                    <div class="modal-comments" id="modal-comments-list">
                        <!-- Comments go here -->
                    </div>
                    <div class="modal-footer">
                        <form class="comment-form" onsubmit="event.preventDefault(); handleImageCommentSubmit();">
                            <div class="form-group">
                                <input type="text" class="form-input" id="modal-comment-name" placeholder="이름" required style="margin-bottom: 0.5rem">
                                <textarea class="form-textarea" id="modal-comment-text" placeholder="작품에 대해 이야기해보세요..." required style="min-height: 80px"></textarea>
                            </div>
                            <button type="submit" class="submit-button" style="width: 100%; margin-top: 0.5rem">댓글 남기기</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Close on click outside
    document.getElementById('image-modal').addEventListener('click', (e) => {
        if (e.target.id === 'image-modal') closeImageModal();
    });

    return document.getElementById('image-modal');
}

function loadImageComments(imgId) {
    // Load Comments
    const allComments = JSON.parse(localStorage.getItem('galleryComments') || '{}');
    const comments = allComments[imgId] || [];
    const container = document.getElementById('modal-comments-list');

    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments">이 작품에 대한 첫 번째 코멘트를 남겨보세요! ✨</div>';
    } else {
        container.innerHTML = comments.map(c => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(c.author)}</span>
                    <span class="comment-date">${new Date(c.date).toLocaleDateString()}</span>
                </div>
                <div class="comment-text">${escapeHtml(c.text)}</div>
            </div>
        `).join('');
    }

    // Load Likes
    const allLikes = JSON.parse(localStorage.getItem('galleryLikes') || '{}');
    const likeCount = allLikes[imgId] || 0;

    const myLikes = JSON.parse(localStorage.getItem('myLikedImages') || '[]');
    const isLiked = myLikes.includes(imgId);

    updateLikeUI(likeCount, isLiked);
}

function updateLikeUI(count, isLiked) {
    const heartIcon = document.querySelector('.heart-icon');
    const likeCountSpan = document.getElementById('like-count');
    const likeButton = document.querySelector('.like-button-overlay');

    if (heartIcon && likeCountSpan) {
        heartIcon.textContent = isLiked ? '❤️' : '🤍';
        likeCountSpan.textContent = count;

        if (isLiked) {
            likeButton.classList.add('liked');
        } else {
            likeButton.classList.remove('liked');
        }
    }
}

function toggleImageLike() {
    if (!currentImageId) return;

    const allLikes = JSON.parse(localStorage.getItem('galleryLikes') || '{}');
    let currentCount = allLikes[currentImageId] || 0;

    const myLikes = JSON.parse(localStorage.getItem('myLikedImages') || '[]');
    const index = myLikes.indexOf(currentImageId);
    const isLiked = index !== -1;

    if (isLiked) {
        // Unlike
        currentCount = Math.max(0, currentCount - 1);
        myLikes.splice(index, 1);
    } else {
        // Like
        currentCount++;
        myLikes.push(currentImageId);
    }

    allLikes[currentImageId] = currentCount;

    localStorage.setItem('galleryLikes', JSON.stringify(allLikes));
    localStorage.setItem('myLikedImages', JSON.stringify(myLikes));

    updateLikeUI(currentCount, !isLiked);

    // Add animation effect
    const btn = document.querySelector('.like-button-overlay');
    btn.classList.add('pulse');
    setTimeout(() => btn.classList.remove('pulse'), 300);
}

function handleImageCommentSubmit() {
    const nameInput = document.getElementById('modal-comment-name');
    const textInput = document.getElementById('modal-comment-text');

    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text || !currentImageId) return;

    const allComments = JSON.parse(localStorage.getItem('galleryComments') || '{}');
    if (!allComments[currentImageId]) allComments[currentImageId] = [];

    allComments[currentImageId].unshift({
        author: name,
        text: text,
        date: new Date().toISOString()
    });

    localStorage.setItem('galleryComments', JSON.stringify(allComments));

    nameInput.value = '';
    textInput.value = '';

    loadImageComments(currentImageId);
}
