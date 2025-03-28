// Firebase 초기화
let firestore;

async function initializeFirebase() {
    try {
        // Firebase가 이미 초기화되었는지 확인
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        firestore = firebase.firestore();
        
        // 초기화 테스트
        await firestore.collection('posts').limit(1).get();
        console.log('Firestore 연결 성공');
        return true;
    } catch (error) {
        console.error('Firebase 초기화 실패:', error);
        showError('Firebase 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return false;
    }
}

// URL에서 글 ID 가져오기
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 날짜 포맷팅 함수
function formatDate(timestamp) {
    if (!timestamp || !timestamp.toDate) {
        return '날짜 정보 없음';
    }
    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 글 내용 불러오기
async function loadPost() {
    const postId = getPostIdFromUrl();
    if (!postId) {
        showError('글을 찾을 수 없습니다.');
        return;
    }

    try {
        if (!firestore) {
            throw new Error('Firestore가 초기화되지 않았습니다.');
        }

        console.log('글 로딩 시작:', postId);
        const doc = await firestore.collection('posts').doc(postId).get();
        
        if (!doc.exists) {
            showError('글을 찾을 수 없습니다.');
            return;
        }

        const postData = doc.data();
        console.log('글 로딩 성공');
        displayPost(postData);
    } catch (error) {
        console.error('글 로딩 중 오류 발생:', error);
        showError('글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 글 표시하기
function displayPost(postData) {
    const postContent = document.getElementById('postContent');
    
    // HTML 구성
    const html = `
        <div class="post-header">
            <h1 class="post-title">${postData.title || '제목 없음'}</h1>
            <div class="post-meta">
                <span>작성자: 글로우로드 마케팅</span>
                <span>작성일: ${formatDate(postData.createdAt)}</span>
            </div>
        </div>
        ${postData.thumbnailUrl ? `
            <div class="post-thumbnail">
                <img src="${postData.thumbnailUrl}" alt="썸네일">
            </div>
        ` : ''}
        <div class="post-content ql-editor">
            ${postData.content || '내용이 없습니다.'}
        </div>
    `;
    
    postContent.innerHTML = html;
}

// 에러 표시
function showError(message) {
    const postContent = document.getElementById('postContent');
    postContent.innerHTML = `<div class="error">${message}</div>`;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('페이지 로드됨');
    const isInitialized = await initializeFirebase();
    if (isInitialized) {
        await loadPost();
    }
}); 