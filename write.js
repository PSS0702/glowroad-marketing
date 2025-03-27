// Firebase 인스턴스
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 인증 상태 확인
auth.onAuthStateChanged((user) => {
    if (!user) {
        // 로그인하지 않은 경우 블로그 메인으로 리다이렉트
        window.location.href = 'blog.html';
    }
});

// 에디터 초기화
const editor = document.getElementById('editor');
const form = document.getElementById('writeForm');
const titleInput = document.getElementById('title');
const thumbnailInput = document.getElementById('thumbnail');
const thumbnailPreview = document.querySelector('.thumbnail-preview');
const loadingIndicator = document.getElementById('loadingIndicator');

// 썸네일 미리보기
thumbnailInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="썸네일 미리보기">`;
        };
        reader.readAsDataURL(file);
    }
});

// 글 저장 함수
async function savePost(title, content, thumbnailFile) {
    try {
        loadingIndicator.style.display = 'flex'; // 로딩 표시 시작

        let thumbnailUrl = '';
        
        // 썸네일 이미지가 있는 경우 Storage에 업로드
        if (thumbnailFile) {
            const storageRef = storage.ref();
            const thumbnailRef = storageRef.child(`thumbnails/${Date.now()}_${thumbnailFile.name}`);
            await thumbnailRef.put(thumbnailFile);
            thumbnailUrl = await thumbnailRef.getDownloadURL();
        }

        // Firestore에 게시글 저장
        await db.collection('posts').add({
            title: title,
            content: content,
            thumbnail: thumbnailUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            author: auth.currentUser.email
        });

        alert('글이 성공적으로 발행되었습니다.');
        window.location.href = 'blog.html'; // 블로그 메인으로 이동
    } catch (error) {
        console.error('글 저장 중 오류 발생:', error);
        alert('글 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
        loadingIndicator.style.display = 'none'; // 로딩 표시 종료
    }
}

// 폼 제출 처리
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const content = editor.innerHTML.trim();
    const thumbnailFile = thumbnailInput.files[0];

    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }

    if (!content) {
        alert('내용을 입력해주세요.');
        return;
    }

    await savePost(title, content, thumbnailFile);
});

// 에디터 툴바 기능
document.querySelectorAll('.toolbar button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const command = button.dataset.command;
        if (command === 'h2' || command === 'h3') {
            document.execCommand('formatBlock', false, command);
        } else {
            document.execCommand(command, false, null);
        }
        editor.focus();
    });
});

// 이미지 업로드 처리
document.getElementById('imageUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            loadingIndicator.style.display = 'flex';
            
            // Storage에 이미지 업로드
            const storageRef = storage.ref();
            const imageRef = storageRef.child(`images/${Date.now()}_${file.name}`);
            await imageRef.put(file);
            const imageUrl = await imageRef.getDownloadURL();

            // 에디터에 이미지 삽입
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.maxWidth = '100%';
            editor.focus();
            document.execCommand('insertHTML', false, img.outerHTML);
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생:', error);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
});

// 동영상 업로드 처리
const videoInput = document.getElementById('videoInput');
const insertVideoBtn = document.getElementById('insertVideo');

insertVideoBtn.addEventListener('click', () => {
    videoInput.click();
});

videoInput.addEventListener('change', async function() {
    const file = this.files[0];
    if (file) {
        try {
            const videoUrl = await uploadFile(file, 'videos');
            const video = document.createElement('video');
            video.src = videoUrl;
            video.controls = true;
            const editor = document.getElementById('editor');
            editor.appendChild(video);
        } catch (error) {
            console.error('동영상 업로드 실패:', error);
            alert('동영상 업로드에 실패했습니다.');
        }
    }
});

// 파일 업로드 함수
async function uploadFile(file, folder) {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = storage.ref(`${folder}/${fileName}`);
    
    try {
        await storageRef.put(file);
        return await storageRef.getDownloadURL();
    } catch (error) {
        throw new Error('파일 업로드 실패: ' + error.message);
    }
} 