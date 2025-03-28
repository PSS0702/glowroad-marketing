// 전역 변수
let editor;

// Firebase 초기화
async function initializeFirebase() {
    try {
        console.log('Firebase 초기화 시작');
        
        // Firebase가 이미 초기화되었는지 확인
        if (firebase.apps.length === 0) {
            if (!window.firebaseConfig) {
                throw new Error('Firebase 설정을 찾을 수 없습니다.');
            }
            firebase.initializeApp(window.firebaseConfig);
        }
        
        // Storage 확인
        if (!window.storage) {
            throw new Error('Firebase Storage가 초기화되지 않았습니다.');
        }
        
        console.log('Firebase 초기화 완료');
        return true;
    } catch (error) {
        console.error('Firebase 초기화 실패:', error);
        alert('Firebase 초기화에 실패했습니다. 콘솔을 확인해주세요.');
        return false;
    }
}

// 관리자 체크
async function checkAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';
    if (!isAdmin) {
        console.error('관리자 권한 없음');
        window.location.href = 'blog.html';
        return false;
    }
    return true;
}

// Quill 에디터 초기화
function initializeEditor() {
    try {
        console.log('에디터 초기화 시작');
        
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image']
        ];

        editor = new Quill('#editor-container', {
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        'image': imageHandler
                    }
                }
            },
            theme: 'snow',
            placeholder: '내용을 입력하세요...'
        });

        console.log('에디터 초기화 완료');
        return true;
    } catch (error) {
        console.error('에디터 초기화 실패:', error);
        alert('에디터 초기화에 실패했습니다.');
        return false;
    }
}

// 이미지 핸들러 함수
async function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (file) {
            try {
                const url = await uploadImage(file);
                if (url) {
                    const range = editor.getSelection(true);
                    editor.insertEmbed(range.index, 'image', url);
                }
            } catch (error) {
                console.error('에디터 이미지 업로드 실패:', error);
                alert('이미지 업로드에 실패했습니다.');
            }
        }
    };
}

// 이미지 업로드 함수
async function uploadImage(file) {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';

    try {
        if (!window.storage) {
            console.error('Storage가 초기화되지 않음');
            throw new Error('Storage가 초기화되지 않았습니다.');
        }

        console.log('파일 정보:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // 파일 크기 체크 (최대 500MB)
        const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes
        if (file.size > MAX_FILE_SIZE) {
            throw new Error('이미지 크기는 500MB를 초과할 수 없습니다.');
        }

        // 파일 타입 체크
        if (!file.type.startsWith('image/')) {
            throw new Error('이미지 파일만 업로드할 수 있습니다.');
        }

        console.log('이미지 업로드 시작:', file.name);
        const timestamp = Date.now();
        const safeFileName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9.]/g, '_'));
        const fileName = `${timestamp}_${safeFileName}`;
        const imageRef = window.storage.ref().child(`images/${fileName}`);
        
        console.log('Storage 참조 생성됨:', imageRef.fullPath);
        
        // 메타데이터 설정
        const metadata = {
            contentType: file.type,
            cacheControl: 'public,max-age=3600'
        };
        
        try {
            // 업로드 시작
            console.log('업로드 시작');
            const uploadTask = imageRef.put(file, metadata);
            
            // 업로드 진행 상황 모니터링
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('업로드 진행률:', Math.round(progress) + '%');
                        const loadingText = document.querySelector('.loading-text');
                        if (loadingText) {
                            loadingText.textContent = `업로드 중... ${Math.round(progress)}%`;
                        }
                    },
                    (error) => {
                        console.error('업로드 실패:', error);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            console.log('이미지 URL 획득:', downloadURL);
                            resolve(downloadURL);
                        } catch (error) {
                            console.error('URL 획득 실패:', error);
                            reject(error);
                        }
                    }
                );
            });
        } catch (uploadError) {
            console.error('업로드 실패:', uploadError);
            throw uploadError;
        }
    } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert(error.message || '이미지 업로드에 실패했습니다.');
        return null;
    } finally {
        loading.style.display = 'none';
    }
}

// 썸네일 미리보기
function handleThumbnailChange(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('thumbnailPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="썸네일 미리보기">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<span>이미지를 선택하세요</span>';
    }
}

// 글 저장 함수
async function savePost(title, content, thumbnailURL) {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';

    try {
        const firestore = window.firestore;
        if (!firestore) {
            throw new Error('Firestore가 초기화되지 않았습니다.');
        }

        console.log('글 저장 시작');
        const postData = {
            title: title,
            content: content,
            thumbnailUrl: thumbnailURL || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('저장할 데이터:', postData);
        const docRef = await firestore.collection('posts').add(postData);
        console.log('글 저장 성공:', docRef.id);
        
        alert('글이 성공적으로 저장되었습니다.');
        window.location.href = 'blog.html?admin=true';
    } catch (error) {
        console.error('글 저장 실패:', error);
        alert(error.message || '글 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
        loading.style.display = 'none';
    }
}

// 폼 제출 처리
async function handleSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = editor.root.innerHTML;
    const thumbnailFile = document.getElementById('thumbnail').files[0];

    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    const loading = document.getElementById('loading');
    loading.style.display = 'flex';

    try {
        let thumbnailUrl = '';
        if (thumbnailFile) {
            thumbnailUrl = await uploadImage(thumbnailFile);
        }

        await savePost(title, content, thumbnailUrl);
    } catch (error) {
        console.error('글 저장 중 오류 발생:', error);
        alert('글 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
        loading.style.display = 'none';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('페이지 로드됨');
    
    // Firebase 초기화
    const isFirebaseInitialized = await initializeFirebase();
    if (!isFirebaseInitialized) return;

    // 관리자 권한 확인
    const isAdmin = await checkAdmin();
    if (!isAdmin) return;

    // 에디터 초기화
    const isEditorInitialized = initializeEditor();
    if (!isEditorInitialized) return;
    
    // 이벤트 리스너 등록
    document.getElementById('thumbnail').addEventListener('change', handleThumbnailChange);
    document.getElementById('writeForm').addEventListener('submit', handleSubmit);
    
    console.log('초기화 완료');
}); 