// Variáveis globais
let mods = [];
let currentUser = null;

// Função principal de inicialização
const init = async () => {
    await auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            loadMods();
            setupEventListeners();
        } else {
            window.location.href = '/login';
        }
    });
};

// Carregar mods do Firestore
const loadMods = async () => {
    try {
        const snapshot = await db.collection("mods").get();
        mods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderMods();
    } catch (error) {
        console.error("Erro ao carregar mods:", error);
    }
};

// Renderizar mods na tela
const renderMods = (filteredMods = mods) => {
    const container = document.getElementById("modsContainer");
    container.innerHTML = '';
    
    filteredMods.forEach(async mod => {
        const isLiked = await checkIfLiked(mod.id);
        const card = await createModCard(mod, isLiked);
        //console.log(card)
        container.innerHTML += card;
    });
};

// Criar card de mod
const createModCard = async (mod, isLiked) => {
    return `
    <div class="w-100">
            <div class="mod-card card h-100">
                <div class="card-header bg-dark d-flex align-items-center">
                    ${mod.icon ? `<img src="${mod.icon}" class="mod-icon" alt="${mod.name}">` : ''}
                    <h5 class="card-title mb-0">${mod.name}</h5>
                </div>
                
                <img src="${mod.screenshots[0]}" class="card-img-top mod-img">
                
                <div class="card-body">
                    <p class="card-text">${mod.info.description}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <div class="position-relative media-content">
                        <button class="btn btn-link like-btn card-media-btn mr-0 ${isLiked ? 'liked' : 'unliked'}" 
                                data-mod-id="${mod.id}">
                            <i class="fa-heart ${isLiked ? 'fas' : 'far'}"></i>
                            <span class="card-media-btn like-count">${CompressNumber(mod.likes.length)}</span>
                        </button>
                        <span class="text-muted view-icon card-media-btn">
                                <i class="fas fa-eye "></i> ${CompressNumber(mod.views) || 0}
                            </span>
                            </div>
                        
                        <button class="btn btn-danger btn-sm" 
                                onclick="showModDetails('${mod.id}')">
                            <i class="fas fa-info-circle me-2"></i>Detalhes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Sistema de Likes
const checkIfLiked = async (modId) => {
    if (!currentUser)
        return false;
    
    const mod = mods.find(m => m.id === modId);
    
    if (mod && Array.isArray(mod.likes)) {
        return mod.likes.find(e => e == currentUser.uid)
    } else {
        return false
    }
};

function getNumberOfLikes(modId) {
    const mod = mods.find(m => m.id === modId);
    
    return (mod && Array.isArray(mod.likes)) ? mod.likes.length : 0
}

const toggleLike = async (modId, button) => {
    if (!currentUser) return notify('Faça login para curtir!');
    
    try {
        if (button.classList.contains('liked')) {
            updateLikeUI(modId, button, false);
            
            const sound = document.getElementById('like-offsound');
            
            //sound.play()
        } else {
            ;
            updateLikeUI(modId, button, true);
            
            const sound = document.getElementById('like-offsound');
            
            //sound.play()
        }
    } catch (error) {
        console.error("Erro ao atualizar like:", error);
    }
};

const updateLikeUI = (modId, button, isLiked) => {
    
    const mod = mods.find(m => m.id === modId);
    
    if (!Array.isArray(mod.likes))
        mod.likes = []
    
    if (isLiked)
        mod.likes.push(currentUser.uid)
    else
        mod.likes = mod.likes.filter(e => {
            return e != currentUser.uid
            
        })
    
    console.log(mod.likes)
    
    const icon = button.querySelector('i');
    const countSpan = button.querySelector('.like-count');
    
    button.classList.toggle('liked', isLiked);
    button.classList.toggle('unliked', !isLiked);
    icon.classList.toggle('far', !isLiked);
    icon.classList.toggle('fas', isLiked);
    
    const currentCount = parseInt(countSpan.textContent);
    countSpan.textContent = mod.likes.length;
    
    setDocument("mods", modId, mod)
};

const showModDetails = async (modId) => {
    const mod = mods.find(m => m.id === modId);
    
    // Registrar visualização
    await registerView(modId);
    
    // Carregar comentários
    const comments = await loadComments(modId);

    const modalContent = `
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <img src="${mod.screenshots[0]}" class="img-fluid rounded">
                    <div class="mt-3">
                        ${mod.screenshots.map(img => `
                            <img src="${img}" class="screenshot-thumb">
                        `).join('')}
                    </div>
                </div>
                <div class="col-md-6">
                    <h3>${mod.name}</h3>
                    <div class="mb-3">
                        <span class="badge bg-danger me-2">v${mod.version}</span>
                        <span class="text-muted">
                            <i class="fas fa-eye"></i> ${mod.views || 0} visualizações
                        </span>
                    </div>
                    ${mod.categories.map(c => `
                        <span class="badge bg-secondary">${c}</span>
                    `).join('')}
                    <p class="mt-3">${mod.info.description}</p>
                    
                    <!-- Seção de Comentários -->
                    <div class="mt-4">
                        <h5><i class="fas fa-comments me-2"></i>Comentários</h5>
                        <div id="commentsContainer-${modId}" class="mb-3"></div>
                        
                        <form id="commentForm-${modId}" class="mb-3">
                            <textarea class="form-control bg-dark text-white" 
                                      rows="2" 
                                      placeholder="Adicione um comentário..."
                                      required></textarea>
                            <button class="btn btn-danger mt-2" type="submit">
                                Enviar Comentário
                            </button>
                        </form>
                    </div>
                    
                    <a href="${mod.downloadUrl}" class="btn btn-danger w-100">
                        <i class="fas fa-download me-2"></i>Download
                    </a>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modDetails').innerHTML = modalContent;
    renderComments(modId, comments);
    setupCommentForm(modId);
    new bootstrap.Modal('#modModal').show();
};

// Sistema de Visualizações
const registerView = async (modId) => {
    try {
        if (!currentUser) return;
        
        const viewRef = db.collection("mods").doc(modId)
            .collection("views").doc(currentUser.uid);
            
        const viewDoc = await viewRef.get();
        
        if (!viewDoc.exists) {
            await viewRef.set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Atualizar contador total
            await db.collection("mods").doc(modId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        }
    } catch (error) {
        console.error("Erro ao registrar visualização:", error);
    }
};

// Sistema de Comentários
const loadComments = async (modId) => {
    try {
        const snapshot = await db.collection("mods").doc(modId)
            .collection("comments")
            .orderBy("timestamp", "desc")
            .get();
            
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Erro ao carregar comentários:", error);
        return [];
    }
};

const renderComments = (modId, comments) => {
    const container = document.getElementById(`commentsContainer-${modId}`);
    container.innerHTML = comments.map(comment => `
        <div class="card bg-dark mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>${comment.authorName}</strong>
                        <small class="text-muted ms-2">
                            ${new Date(comment.timestamp?.toDate()).toLocaleDateString()}
                        </small>
                    </div>
                    ${comment.userId === currentUser.uid ? `
                        <button class="btn btn-sm btn-danger" 
                                onclick="deleteComment('${modId}', '${comment.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
                <p class="mb-0 mt-2">${comment.text}</p>
            </div>
        </div>
    `).join('');
};

const setupCommentForm = (modId) => {
    const form = document.getElementById(`commentForm-${modId}`);
    form.onsubmit = async (e) => {
        e.preventDefault();
        const textarea = form.querySelector('textarea');
        const text = textarea.value.trim();
        
        if (text && currentUser) {
            try {
                const userInfo = await getDocument("users",currentUser.uid)
                
                await db.collection("mods").doc(modId)
                    .collection("comments").add({
                        text: text,
                        userId: currentUser.uid,
                        authorName: userInfo.username || "Anônimo",
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                textarea.value = '';
            } catch (error) {
                console.error("Erro ao enviar comentário:", error);
            }
        }
    };
};

const deleteComment = async (modId, commentId) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
        await db.collection("mods").doc(modId)
            .collection("comments").doc(commentId).delete();
    }
};

// Event Listeners
const setupEventListeners = () => {
    // Likes
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.like-btn')) {
            const button = e.target.closest('.like-btn');
            const modId = button.dataset.modId;
            toggleLike(modId, button);
        }
    });
    
    // Pesquisa
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = mods.filter(mod =>
            mod.name.toLowerCase().includes(searchTerm) ||
            mod.info.description.toLowerCase().includes(searchTerm)
        );
        renderMods(filtered);
    });
};

// Inicialização
init();