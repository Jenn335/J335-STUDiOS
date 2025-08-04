// Carregar Posts
async function loadPosts() {
  await db.collection("posts")
    .orderBy("timestamp", "desc")
    .limit(10)
    .onSnapshot(snapshot => {
      const postsContainer = document.getElementById('postsContainer');
      postsContainer.innerHTML = '';
      
      snapshot.forEach(doc => {
        let post = doc.data();
        let template = document.getElementById('postTemplate').content.cloneNode(true);
        
        template = populatePostTemplate(template,post)
        
        postsContainer.appendChild(template);
      });
    });
}

// Enviar Novo Post
document.getElementById('newPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const user = auth.currentUser;
  if (!user) return notify('Faça login para postar!');
  
  const postContent = document.getElementById('postContent').value;
  
  try {
    await createPost(postContent)
    document.getElementById('postContent').value = '';
  } catch (error) {
    console.error(error);
  }
});

// Carregar Leaderboard
async function loadLeaderboard() {
  await db.collection("users")
    .orderBy("points", "desc")
    .limit(5)
    .onSnapshot(snapshot => {
      const leaderboard = document.getElementById('leaderboard');
      leaderboard.innerHTML = '';
      
      snapshot.forEach((doc, index) => {
        const user = doc.data();
        const rank = document.createElement('div');
        rank.className = 'd-flex justify-content-between align-items-center mb-2';
        rank.innerHTML = `
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-dark">${index + 1}</span>
                                <img src="${user.avatar}" class="user-avatar" alt="${user.name}">
                                <div>
                                    <h6 class="mb-0">${user.name}</h6>
                                    <small class="text-muted">${user.points} pontos</small>
                                </div>
                            </div>
                            <span class="badge badge-custom">${user.role || 'Membro'}</span>
                        `;
        leaderboard.appendChild(rank);
      });
    });
}

const postContent = document.getElementById('postContent');
const charCount = document.getElementById('charCount');

postContent.addEventListener('input', () => {
  const currentLength = postContent.value.length;
  charCount.textContent = `${currentLength}/100 caracteres`;
  
  // Altera a cor conforme aproxima do limite
  if (currentLength >= 90) {
    charCount.style.color = '#ff4444';
  } else if (currentLength >= 75) {
    charCount.style.color = '#ffa500';
  } else {
    charCount.style.color = '#6c757d';
  }
});

// Limitar caracteres
postContent.addEventListener('keydown', (e) => {
  if (postContent.value.length >= 100 && e.key !== 'Backspace') {
    e.preventDefault();
    notify('Limite de 100 caracteres atingido!', 'error', 2000);
  }
});

function setupNotifications(userId) {
  const notificationsRef = db.collection('users').doc(userId).collection('notifications');
  
  notificationsRef.orderBy('timestamp', 'desc').limit(5).onSnapshot(snapshot => {
    const badge = document.querySelector('.notification-badge');
    const list = document.getElementById('notificationsList');
    let unread = 0;
    
    list.innerHTML = '';
    snapshot.docs.forEach(doc => {
      const notification = doc.data();
      const item = document.createElement('div');
      item.className = `dropdown-item ${!notification.read ? 'fw-bold' : ''}`;
      item.innerHTML = `
                <div class="d-flex justify-content-between">
                    <span>${notification.message}</span>
                    <small>${new Date(notification.timestamp.toDate()).toLocaleTimeString()}</small>
                </div>
            `;
      item.addEventListener('click', () => markAsRead(doc.ref));
      
      if (!notification.read) unread++;
      list.appendChild(item);
    });
    
    badge.textContent = unread || '';
  });
}

async function markAsRead(notificationRef) {
  await notificationRef.update({ read: true });
}

// Sistema de Hashtags
function extractHashtags(content) {
  return content.match(/#\w+/g)?.map(tag => tag.slice(1).toLowerCase()) || [];
}

function detectMentions(content) {
  return content.match(/@\w+/g)?.map(mention => mention.slice(1)) || [];
}

function updateTagCloud() {
  db.collection('tags').orderBy('count', 'desc').limit(10).onSnapshot(snapshot => {
    const tagCloud = document.getElementById('tagCloud');
    tagCloud.innerHTML = '';
    
    snapshot.forEach(doc => {
      const tag = doc.data();
      const span = document.createElement('span');
      span.className = 'badge bg-secondary me-1 mb-1 cursor-pointer';
      span.textContent = `#${doc.id}`;
      span.style.fontSize = `${0.8 + (tag.count * 0.1)}em`;
      span.addEventListener('click', () => searchPosts(doc.id));
      tagCloud.appendChild(span);
    });
  });
}

// Sistema de Pesquisa
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => searchPosts(e.target.value), 300);
});

async function searchPosts(query) {
  let postsQuery = db.collection('posts').orderBy('timestamp', 'desc');
  
  if (query.startsWith('#')) {
    const tag = query.slice(1).toLowerCase();
    postsQuery = postsQuery.where('tags', 'array-contains', tag);
  } else {
    postsQuery = postsQuery.where('keywords', 'array-contains', query.toLowerCase());
  }
  
  const snapshot = await postsQuery.limit(20).get();
  // Atualiza a lista de posts...
}

function processPostContent(content, searchQuery = '') {
    // Converter URLs em links
    let processedContent = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Destacar menções
    processedContent = processedContent.replace(/@(\w+)/g, '<span class="mention">@$1</span> ');
    
    // Extrair e destacar hashtags
    const hashtags = content.match(/#\w+/g) || [];
    processedContent = processedContent.replace(/#(\w+)/g, '<span class="hashtag" data-tag="$1">#$1</span> ');
    
    // Destacar termos de pesquisa
    if(searchQuery) {
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        processedContent = processedContent.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    return processedContent;
}

// Função para popular o template
function populatePostTemplate(template, postData, searchQuery = '') {
    template.querySelector('.username').textContent = postData.author.name;
    template.querySelector('.timestamp').textContent = getDateFromTimestamp(postData.timestamp).toLocaleString();
    template.querySelector('.category').textContent = postData.category;
    template.querySelector('.post-content').innerHTML = processPostContent(postData.content, searchQuery);
    template.querySelector('.like-count').textContent = postData.likes;
    template.querySelector('.comment-count').textContent = postData.comments?.length || 0;
    template.querySelector('.post-id').textContent = `#${postData?.id.slice(0,6)||"notFound"}`;

    // Adicionar hashtags
    const hashtagsContainer = template.querySelector('.hashtags');
    hashtagsContainer.innerHTML = Array.from(new Set(postData.tags)).map(tag => 
        `<span class="badge bg-dark me-1 hashtag" data-tag="${tag}">#${tag}</span>`
    ).join('');

    return template;
}

// Atualize a criação de posts
async function createPost(content) {
  const tags = extractHashtags(content);
  const keywords = content.toLowerCase().split(/\s+/);
  
  const user = auth.currentUser
  
  let userData = await getDocument("users", user.uid)
  
  const newPost = {
    id: generateID(),
    content,
    tags,
    keywords,
    author: {
      uid: user.uid,
      name: userData.username || 'Anônimo',
      avatar: userData.avatar || '/assets/img/profile_empty.jpg'
    },
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    category: 'Geral',
    likes: 0,
    comments: []
  };
  
  // Atualiza contagem de tags
  tags.forEach(async (tag) => {
    const tagRef = db.collection('tags').doc(tag);
    await tagRef.set({ count: firebase.firestore.FieldValue.increment(1) }, { merge: true });
  });
  
  detectMentions(content).forEach(async (username) => {
    const userSnapshot = await db.collection('users').where('username', '==', username).get();
    if (!userSnapshot.empty) {
      const userId = userSnapshot.docs[0].id;
      await sendNotification(userId, 'mention', newPost.id);
    }
  });
  
  await db.collection('posts').add(newPost);
}

// Notificar sobre interações
async function sendNotification(userId, type, postId) {
  const messages = {
    like: 'curtiu seu post',
    comment: 'comentou no seu post',
    mention: 'mencionou você em um post'
  };
  
  await db.collection('users').doc(userId).collection('notifications').add({
    type,
    message: messages[type],
    postId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    read: false
  });
}

async function main() {
  auth.onAuthStateChanged(async user => {
    try {
    if (user) {
      loadPosts();
      loadLeaderboard();
      
      setupNotifications(user.uid);
      updateTagCloud();
    }
    }catch(error){console.log(error)}
  });
  // Tab to edit
  setTimeout(() => Loader.hide(), 3000)
}


// Inicialização

document.addEventListener("DOMContentLoaded", main);