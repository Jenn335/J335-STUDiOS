let users;

const webContent = {
  registryForm: () => document.getElementById('authOverlay'),
  main: () => document.getElementById('mainContent'),
  adminFloatBtn: () => document.getElementById('adminFloatBtn'),
  saveBtn: () => document.getElementById('saveBtn'),
  deleteBtn: () => document.getElementById('deleteBtn'),
}

async function main(param) {
  users = await getAllDocuments("users")
  
  // Carrega dados do usuário
  auth.onAuthStateChanged(async user => {
    if (!user)
      URL.open('/', "Erro: Falha Usuário indefinido!");
    
    db.collection('users').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          console.log(user.emailVerified)
          
          const data = doc.data();
          document.getElementById('usernameDisplay').innerHTML = data.username + (user.emailVerified ? ` <i class="bi bi-patch-check" style="color: #17FF69;"></i>` : "");
          document.getElementById('emailDisplay').textContent = user.email;
          
          console.log("Email is verified: ",user.emailVerified)
          
          if (data.avatar)
            document.getElementById('avatar').src = data.avatar;
          
          document.getElementById('usernameInput').value = data.username;
          document.getElementById('avatarInput').value = data.avatar;
          
          Loader.hide();
        } else {
          URL.open('index.html', "Erro: Falha ao acessar os dados do seu perfil!");
        }
      })
      .catch(() => {
        Loader.hide();
      });
  })
  Loader.hide()
}
let editMode

function toggleEdit() {
  editMode = !editMode;
  document.getElementById('profileForm').style.display = editMode ? 'block' : 'none';
}


async function uploadProfilePicture() {
  const fileInput = document.getElementById("avatarInput");
  const file = fileInput.files[0];
  
  // Pegar usuário do Firebase Authentication
  const user = auth.currentUser;
  if (!user) {
    notify("Usuário não autenticado!");
    return;
  }
  
  // Fazer upload da imagem no Supabase
  try {
    const url = await
    uploadImageToCloudinary("profile_pictures",file)
    
    
    console.log("Foto enviada com sucesso:", url);
    return url
  } catch (error) {
    
    console.error(error);
  }
}

async function updateProfile(e) {
  e.preventDefault();
  const newUsername = document.getElementById('usernameInput').value;
  const newAvatar = await uploadProfilePicture();
  
  console.log(newAvatar)
  
  try {
    // Verifica se o username já existe
    const snapshot = await db.collection('users')
      .where('username', '==', newUsername)
      .get();
    
    if (!snapshot.empty) {
      if (snapshot.docs[0].id !== auth.currentUser.uid) {
        return notify('Nome de usuário já está em uso');
        
      }
    }
    
    await db.collection('users').doc(auth.currentUser.uid).update({
      username: newUsername,
      avatar: newAvatar || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${newUsername}`
    });
    
    //URL.open("reload","Configurações salvas com sucesso!","success");
  } catch (error) {
    console.log('Erro ao atualizar: ' + error.message);
  }
}

async function validateUsername(username) {
  
  const inputGroup = document.getElementById('usernameInput').parentElement;
  const errorElement = document.getElementById('usernameError');
  
  const userRegeExp = /^(?![-_.])[a-zA-Z0-9._-]{3,30}(?<![-_.])$/
  
  if (username.length < 3) {
    errorElement.textContent = 'Mínimo 3 e Máximo 30 caráteres';
    webContent.saveBtn().disabled = true;
    return;
  }
  
  if (!userRegeExp.test(username)) {
    errorElement.textContent = 'Nome inválido, não segue o formato padrão!';
    
    notify("O nome do usuário deve começar e terminar com letras ou números", "info")
    
    webContent.saveBtn().disabled = true;
    return
  }
  
  try {
    const hasUserName = users.some(e => e.username.toLowerCase() == username.toLowerCase());
    
    if (hasUserName && document.getElementById('usernameDisplay').textContent.toLowerCase() != username.toLowerCase()) {
      errorElement.textContent = 'Nome já está em uso';
      webContent.saveBtn().disabled = true;
    } else {
      errorElement.textContent = ""
      webContent.saveBtn().disabled = !(document.getElementById('usernameDisplay').textContent.toLowerCase() != username.toLowerCase() || !!document.getElementById("avatarInput").files[0]);
    }
  } catch (error) {
    errorElement.textContent = 'Erro: Erro na verificação';
    webContent.saveBtn().disabled = true;
  }
}

document.getElementById("usernameInput").addEventListener("input", function() {
  validateUsername(this.value.trim())
})

document.getElementById("avatarInput").addEventListener("change", function() {
  const file = this.files[0];
  const maxSize = 1 * 1024 * 1024; // 1MB em bytes
  const fileNameSpan = document.getElementById("fileName");
  const fileError = document.getElementById("fileError");
  
  if (file) {
    console.log(formatBytes(file.size))
    
    if (file.size > maxSize) {
      fileError.textContent = "Erro: O arquivo deve ter no máximo 1MB!";
      this.value = ""; // Reseta o input para evitar upload
      fileNameSpan.textContent = "Galeria"; // Reseta o nome
    } else {
      fileError.textContent = ""; // Limpa erros anteriores
      fileNameSpan.textContent = file.name; // Exibe o nome do arquivo
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const previewImage = document.getElementById("avatar");
        previewImage.src = e.target.result;
        //previewImage.style.display = "block"; // Exibir a imagem
      };
      
      reader.readAsDataURL(file); // Converter a imagem para base64 temporário
      
      
    }
  }
  
  validateUsername(document.getElementById("usernameInput").value.trim())
});

document.addEventListener("DOMContentLoaded", main);