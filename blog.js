// 카테고리 필터 기능
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const posts = document.querySelectorAll('.blog-post');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 활성 버튼 스타일 변경
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 포스트 필터링
            const category = button.dataset.category;
            posts.forEach(post => {
                if (category === 'all' || post.dataset.category === category) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    });

    // 관리자 상태 확인
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // 관리자 로그인 모달
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');

    // URL에서 admin 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminPage = urlParams.get('admin') === 'true';

    // admin=true 파라미터가 있을 때만 관리자 로그인 모달 표시
    if (isAdminPage && !isAdmin) {
        adminLoginModal.style.display = 'block';
    }

    // 관리자 로그인 처리
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === 'admin1234') {
            localStorage.setItem('isAdmin', 'true');
            adminLoginModal.style.display = 'none';
            showWriteButton();
        } else {
            alert('비밀번호가 올바르지 않습니다.');
        }
    });

    // 글쓰기 모달 생성
    function createWriteModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.id = 'writeModal';
        modal.innerHTML = `
            <div class="modal-content write-modal-content">
                <div class="modal-header">
                    <h2>새 글 작성</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <form id="writeForm">
                    <div class="form-group">
                        <input type="text" id="postTitle" placeholder="제목을 입력하세요" required>
                    </div>
                    <div class="form-group">
                        <div class="editor-toolbar">
                            <button type="button" data-command="bold">굵게</button>
                            <button type="button" data-command="italic">기울임</button>
                            <button type="button" data-command="underline">밑줄</button>
                            <button type="button" data-command="insertOrderedList">번호 목록</button>
                            <button type="button" data-command="insertUnorderedList">글머리 기호</button>
                            <button type="button" id="insertImage">이미지 삽입</button>
                            <button type="button" id="insertVideo">동영상 삽입</button>
                            <input type="file" id="imageInput" accept="image/*" style="display: none">
                            <input type="file" id="videoInput" accept="video/*" style="display: none">
                        </div>
                        <div id="editor" contenteditable="true" class="editor-content"></div>
                    </div>
                    <div class="form-group">
                        <input type="text" id="postTags" placeholder="태그를 입력하세요 (쉼표로 구분)">
                    </div>
                    <div class="form-group">
                        <label for="thumbnailUpload" class="thumbnail-label">
                            <div class="thumbnail-preview">
                                <span>썸네일 이미지 업로드</span>
                            </div>
                            <input type="file" id="thumbnailUpload" accept="image/*" style="display: none">
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">발행하기</button>
                        <button type="button" class="cancel-btn">취소</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // 에디터 기능 초기화
        initializeEditor(modal);

        // 모달 닫기
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        closeBtn.onclick = () => modal.remove();
        cancelBtn.onclick = () => modal.remove();

        // 글 작성 처리
        const writeForm = modal.querySelector('#writeForm');
        writeForm.onsubmit = (e) => {
            e.preventDefault();
            const title = modal.querySelector('#postTitle').value;
            const content = modal.querySelector('#editor').innerHTML;
            const tags = modal.querySelector('#postTags').value;

            // 임시 저장 (실제로는 서버에 저장해야 함)
            const post = {
                title,
                content,
                tags: tags.split(',').map(tag => tag.trim()),
                date: new Date().toISOString(),
                author: '글로우로드 마케팅'
            };

            console.log('저장된 포스트:', post);
            alert('글이 저장되었습니다.');
            modal.remove();
            location.reload();
        };
    }

    // 에디터 기능 초기화
    function initializeEditor(modal) {
        const editor = modal.querySelector('#editor');
        const toolbar = modal.querySelector('.editor-toolbar');

        // 툴바 버튼 기능
        toolbar.querySelectorAll('button[data-command]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const command = button.dataset.command;
                document.execCommand(command, false, null);
                editor.focus();
            });
        });

        // 이미지 업로드
        const imageInput = modal.querySelector('#imageInput');
        modal.querySelector('#insertImage').onclick = () => imageInput.click();
        imageInput.onchange = function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.execCommand('insertImage', false, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };

        // 비디오 업로드
        const videoInput = modal.querySelector('#videoInput');
        modal.querySelector('#insertVideo').onclick = () => videoInput.click();
        videoInput.onchange = function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.controls = true;
                    video.style.maxWidth = '100%';
                    editor.focus();
                    document.execCommand('insertHTML', false, video.outerHTML);
                };
                reader.readAsDataURL(file);
            }
        };

        // 썸네일 프리뷰
        const thumbnailUpload = modal.querySelector('#thumbnailUpload');
        const thumbnailPreview = modal.querySelector('.thumbnail-preview');
        thumbnailUpload.onchange = function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="썸네일 미리보기">`;
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // 관리자일 경우 글쓰기 버튼 표시
    function showWriteButton() {
        if (isAdmin) {
            const writeButton = document.createElement('button');
            writeButton.className = 'write-btn';
            writeButton.innerHTML = '글쓰기';
            writeButton.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                padding: 15px 30px;
                background: var(--primary-blue);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                z-index: 100;
            `;
            
            writeButton.addEventListener('mouseover', function() {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            });
            
            writeButton.addEventListener('mouseout', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            });

            writeButton.addEventListener('click', function() {
                createWriteModal();
            });

            document.body.appendChild(writeButton);
        }
    }

    // 초기 관리자 버튼 표시 확인
    if (isAdmin) {
        showWriteButton();
    }
});

// 모바일 메뉴
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// 스타일 추가
const style = document.createElement('style');
style.textContent = `
    .login-modal, .write-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
    }

    .modal-content h2 {
        margin-bottom: 20px;
    }

    .modal-content form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .modal-content input,
    .modal-content select,
    .modal-content textarea {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .modal-content textarea {
        height: 200px;
        resize: vertical;
    }

    .modal-content button {
        padding: 10px;
        background: var(--primary-blue);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .modal-content .close-modal {
        margin-top: 15px;
        background: #666;
    }
`;
document.head.appendChild(style);

// DOM 요소
const adminLoginBtn = document.getElementById('adminLoginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const writeButtonContainer = document.getElementById('writeButtonContainer');
const writeBtn = document.getElementById('writeBtn');
const blogPosts = document.getElementById('blogPosts');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');

// 전역 변수
let isAdmin = false;
let currentPage = 1;
const postsPerPage = 9;
let totalPosts = 0;

// 초기 상태 설정
function updateAdminUI() {
    if (isAdmin) {
        adminLoginBtn.textContent = '로그아웃';
        writeButtonContainer.style.display = 'flex';
    } else {
        adminLoginBtn.textContent = '관리자 로그인';
        writeButtonContainer.style.display = 'none';
    }
}

// 게시글 로드 함수
async function loadPosts() {
    try {
        const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
        totalPosts = snapshot.docs.length;
        displayPosts(snapshot.docs);
        updatePagination();
    } catch (error) {
        console.error('게시글 로드 에러:', error);
        blogPosts.innerHTML = '<div class="error-message">게시글을 불러오는데 실패했습니다.</div>';
    }
}

// 게시글 표시 함수
function displayPosts(posts) {
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const currentPosts = posts.slice(start, end);

    if (currentPosts.length === 0) {
        blogPosts.innerHTML = '<div class="no-posts">등록된 게시글이 없습니다.</div>';
        return;
    }

    blogPosts.innerHTML = currentPosts.map(doc => {
        const post = doc.data();
        return `
            <div class="blog-post">
                <div class="post-thumbnail">
                    <img src="${post.thumbnail || 'images/default-thumbnail.jpg'}" alt="${post.title}">
                </div>
                <div class="post-content">
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.content.substring(0, 100)}...</p>
                    <div class="post-meta">
                        <span>${new Date(post.createdAt.toDate()).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    currentPageSpan.textContent = currentPage;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// 관리자 UI 표시 여부 확인
function shouldShowAdminUI() {
    return window.location.href.includes('admin');
}

// 관리자 UI 초기화
function initializeAdminUI() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const writeButtonContainer = document.getElementById('writeButtonContainer');

    if (!shouldShowAdminUI()) {
        if (adminLoginBtn) adminLoginBtn.style.display = 'none';
        if (writeButtonContainer) writeButtonContainer.style.display = 'none';
        return;
    }

    if (adminLoginBtn) adminLoginBtn.style.display = 'block';

    // 인증 상태 관찰자 설정
    auth.onAuthStateChanged((user) => {
        isAdmin = !!user;
        if (writeButtonContainer) {
            writeButtonContainer.style.display = isAdmin ? 'flex' : 'none';
        }
        if (adminLoginBtn) {
            adminLoginBtn.textContent = isAdmin ? '로그아웃' : '관리자 로그인';
        }
    });
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    if (!shouldShowAdminUI()) {
        return;
    }

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert('로그인 성공!');
        loginModal.style.display = 'none';
    } catch (error) {
        console.error('로그인 실패:', error);
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
}

// 로그아웃 처리
async function handleLogout() {
    try {
        await auth.signOut();
        alert('로그아웃되었습니다.');
    } catch (error) {
        console.error('로그아웃 에러:', error);
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 이전 페이지 버튼
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadPosts();
        }
    });

    // 다음 페이지 버튼
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadPosts();
        }
    });

    // 관리자 로그인 버튼
    adminLoginBtn.addEventListener('click', () => {
        if (!isAdmin) {
            loginModal.style.display = 'flex';
        } else {
            handleLogout();
        }
    });

    // 로그인 폼
    loginForm.addEventListener('submit', handleLogin);

    // 글쓰기 버튼
    writeBtn.addEventListener('click', () => {
        if (isAdmin) {
            window.location.href = 'write.html';
        } else {
            alert('관리자로 로그인해주세요.');
        }
    });

    // 모달 외부 클릭
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
}

// 초기화
function init() {
    setupEventListeners();
    setupAuthStateObserver();
    loadPosts();
}

// 앱 시작
document.addEventListener('DOMContentLoaded', init);

// Firebase 초기화 확인
if (!window.firebase) {
    console.error('Firebase가 초기화되지 않았습니다.');
}

// 로그인 상태 감시
function setupAuthStateObserver() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            isAdmin = true;
            adminLoginBtn.textContent = '로그아웃';
            writeButtonContainer.style.display = 'flex';
        } else {
            isAdmin = false;
            adminLoginBtn.textContent = '관리자 로그인';
            writeButtonContainer.style.display = 'none';
        }
    });
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
}; 