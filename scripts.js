document.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

const form = {
  title: () => document.getElementById('form-title'),
  text: () => document.getElementById('form-change'),
  get: () => document.getElementById('signupForm'),
  email: () => document.getElementById('email'),
  password: () => document.getElementById('password'),
  username: () => document.getElementById('username'),
  forgotBtn: ()=> document.getElementById('forgot-password'),
  submitBtn: () => document.getElementById('signup-submit')
  
}

const webContent = {
  authOverlay: () => document.getElementById('auth-overlay'),
  main: () => document.getElementById('mainContent'),
  adminFloatBtn: () => document.getElementById('adminFloatBtn')
}

function loginForm() {
  validationState.username = true;
  
  webContent.authOverlay()
    .style
    .display = 'block';
  
  webContent.main().disabled = true
  webContent.main()
    .style
    .display = 'none';
  
  form.submitBtn().innerHTML = `<i class="fas fa-sign-in-alt me-2"></i>Entrar`
  form.title().innerHTML = "Login"
  form.text().innerHTML = `Novo? <a href="?mode=signup" class="login-link">Criar nova conta</a>`
  form.forgotBtn().classList.remove('d-none');
  
  let usernameDiv = form.username().parentElement.parentElement
  
  form.username().disabled = true
  usernameDiv.style.display = "none"
}

function signupForm() {
  webContent.authOverlay()
    .style
    .display = 'block';
  
  form.submitBtn().innerHTML = `<i class="fas fa-user-plus me-2"></i>Criar Conta`
  webContent.main().disabled = true
  webContent.main()
    .style
    .display = 'none';
  form.forgotBtn().classList.add('d-none');
  
  
}

function PanelEmailVerification() {
  webContent.authOverlay()
    .style
    .display = 'block';
  form.title().innerHTML = "Validação do Registro"
  form.get().innerHTML = `<div class="mb-3 text-box"><div class="mb-2"><i class="bi bi-patch-check"></i></div>
  Receberás um Email de verificação para clicar no link de validação do teu registro!</div><button type="submit" class="btn btn-outline-danger w-100 mb-3 " disabled id="signup-submit">Reenviar <p id="resendTime">(10s)</p>
        </button>`
  webContent.main().disabled = true
  webContent.main()
    .style
    .display = 'none';
  
  let resendTime = document.getElementById("resendTime")
  
  let tick = setInterval(() => {
    let time = String(Number(resendTime.textContent.replace(/\D/g, "")) - 1).padStart(2, "0")
    
    resendTime.textContent = resendTime.textContent.replace(/\d+/g, time)
    
    if (time == "00") {
      notify("Você já pode requisitar o link novamente!", "info")
      
      form.submitBtn().disabled = false
      
      clearInterval(tick);
    }
  }, 1000)
}

URLParamEvents({ id: "mode", values: ["verifyEmail"] }, async (value) => {
  let users = JSON.parse(localStorage.getItem("u$s$e$r$s"))
  let oobCode = Url.getParam("oobCode")
  
  Loader.hide()
  if (oobCode == "none" || !oobCode) {
    PanelEmailVerification()
  } else {
    if (oobCode)
      firebase.auth().applyActionCode(oobCode)
      .then(() => {
        // A verificação foi concluída com sucesso.
        notify('E-mail verificado com sucesso!', "success");
        // Você pode redirecionar o usuário ou atualizar a interface conforme necessário.
      })
      .catch((error) => {
        // Trate os erros, como código expirado ou inválido.
        notify('Erro ao verificar e-mail:', error);
        console.log(error)
      });
    
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        if (!user.emailVerified) {
          PanelEmailVerification()
          
          notify('Por favor, verifique seu e-mail!');
        } else {
          Url.clear("Registro concluído com sucesso!", "success")
        }
      }
    });
  }
})

URLParamEvents({ id: "mode", values: ["signup", "login"] }, async (value) => {
  let users = JSON.parse(localStorage.getItem("u$s$e$r$s"))
  Loader.hide()
  
  if (value == "signup") {
    signupForm()
  } else {
    loginForm()
  }
})

async function main() {
  let users = await getAllDocuments("users")
  
  localStorage.setItem("u$s$e$r$s", JSON.stringify(users))
  // Validação em tempo real
  
  if (document.getElementById('username'))
    document.getElementById('username').addEventListener('input', (e) => {
      clearTimeout(usernameTimeout);
      usernameTimeout = setTimeout(() => validateUsername(e.target.value.trim(), users), 0);
    });
  
  if (document.getElementById('email'))
    document.getElementById('email').addEventListener('input', (e) => {
      clearTimeout(emailTimeout);
      emailTimeout = setTimeout(() => validateEmail(e.target.value.trim(), users), 0);
    });
  
  if (document.getElementById('password'))
    document.getElementById('password').addEventListener('input', (e) => {
      validatePassword(e.target.value.trim());
    });
  
  
  //console.log(Auth)
  // Verifica estado de autenticação
  auth.onAuthStateChanged(async user => {
    if (user) {
      // Usuário logado
      webContent.authOverlay()
        .style
        .display = 'none';
      
      webContent.main().disabled = false
      webContent.main()
        .style
        .display = 'block';
      
      //PanelEmailVerification()
      
      // Verificar se é admin
      const testAdmin = await isAdmin(user.uid);
      if (testAdmin) {
        webContent.adminFloatBtn().disabled = false
        webContent.adminFloatBtn()
          .innerHTML = `
        <a href="/adm" class="btn btn-danger btn-lg rounded-pill shadow-lg">
          <i class="fas fa-plus"></i>
        </a>`;
      } else {
        webContent.adminFloatBtn().disabled = true
        webContent.adminFloatBtn()
          .innerHTML = `
        <a class="btn btn-danger btn-lg rounded-pill shadow-lg" data-bs-toggle="tooltip" title="Funções do ADM" >
          <i class="fas fa-lock" onclick="NotADM()"></i>
        </a>`;
      }
    } else {
      // Usuário não logado
      if (!Url.has("?mode="))
        Url.open("?mode=signup")
      
      
      webContent.adminFloatBtn().disabled = true
      webContent.adminFloatBtn()
        .innerHTML = `
        <a class="btn btn-danger btn-lg rounded-pill shadow-lg" data-bs-toggle="tooltip" title="Funções do ADM" onclick="NotADM()">
          <i class="fas fa-lock"></i>
        </a>`;
    }
  })
}

function NotADM() {
  notify('Acesso restrito: Você precisa ser administrador!')
}

// Estados de validação
const validationState = {
  username: false,
  email: false,
  password: false
};

// Configuração de debounce
let usernameTimeout, emailTimeout;

async function validateUsername(username, users) {
  const inputGroup = document.getElementById('username').parentElement;
  const errorElement = document.getElementById('usernameError');
  
  const userRegeExp = /^(?![-_.])[a-zA-Z0-9._-]{3,30}(?<![-_.])$/
  
  if (username.disabled)
    return validationState.username = true;
  
  
  if (username.length < 3) {
    setInvalid(inputGroup, errorElement, 'Mínimo 3 e Máximo 30 caráteres');
    validationState.username = false;
    return;
  }
  
  if (!userRegeExp.test(username)) {
    setInvalid(inputGroup, errorElement, 'Nome inválido, não segue o formato padrão!');
    notify("O nome do usuário deve começar e terminar com letras ou números", "info", )
    validationState.username = false;
    return;
  }
  
  try {
    const hasUserName = users.every(e => e.username.toLowerCase() != username.toLowerCase());
    
    if (hasUserName) {
      setValid(inputGroup, errorElement);
      validationState.username = true;
    } else {
      setInvalid(inputGroup, errorElement, 'Nome já está em uso');
      validationState.username = false;
    }
  } catch (error) {
    setInvalid(inputGroup, errorElement, 'Erro na verificação');
    validationState.username = false;
  }
  updateSubmitButton();
}

function httpGetAsync(url, callback) {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", url, true); // true for asynchronous
  xmlHttp.send(null);
}

//const url = "https://emailvalidation.abstractapi.com/v1/?api_key=ae0b1033218d469ba1e1e033474e1a62&email=jenemiguel.pt13gamer@gmail.com"


async function verifyRealEmail(email) {
  let response = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 5000)
  })
  
  return response
}

async function validateEmail(email, users) {
  const inputGroup = document.getElementById('email').parentElement;
  const errorElement = document.getElementById('emailError');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    setInvalid(inputGroup, errorElement, 'Formato de email inválido');
    validationState.email = false;
    return;
  }
  
  let emailExist = users.some(e => e.email == email);
  
  // Verifica se email já está registrado
  if (emailExist && !Url.has("?mode=login")) {
    setInvalid(inputGroup, errorElement, 'Email já registrado');
    validationState.email = false;
  } else {
    setInvalid(inputGroup, errorElement, 'Loading...')
    
    let verifying = Url.has("?mode=signup") || emailExist && Url.has("?mode=login") //await verifyRealEmail(email)
    if (verifying) {
      setValid(inputGroup, errorElement);
      validationState.email = true;
    } else {
      setInvalid(inputGroup, errorElement, 'Email não verificado!')
      validationState.email = false;
    }
  }
  updateSubmitButton();
}

function validatePassword(password) {
  const inputGroup = document.getElementById('password').parentElement;
  const errorElement = document.getElementById('passwordError');
  
  if (password.length < 6) {
    setInvalid(inputGroup, errorElement, 'Mínimo 6 caracteres');
    validationState.password = false;
  } else {
    setValid(inputGroup, errorElement);
    validationState.password = true;
  }
  updateSubmitButton();
}

function setValid(inputGroup, errorElement) {
  inputGroup.classList.add('valid');
  inputGroup.classList.remove('invalid');
  errorElement.innerHTML = '<i class="fas fa-circle-check" style="color: #2ECC71;"></i>';
}

function setInvalid(inputGroup, errorElement, message) {
  inputGroup.classList.add('invalid');
  inputGroup.classList.remove('valid');
  if (message != "Loading...")
    errorElement.innerHTML = `<i class="fas fa-circle-exclamation"></i> ` + message;
  else {
    errorElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> ` + message;
  }
}

async function sendEmailVerification(user) {
  try {
    await user.sendEmailVerification();
    
    if (!Url.has("?mode=verifyEmail"))
      Url.open("?mode=verifyEmail&oobCode=none", 'E-mail de verificação enviado! Verifique sua caixa de entrada.', 'success');
    
  } catch (error) {
    notify('Erro ao enviar verificação: ' + error.message, 'error');
    throw error
  }
}

function updateSubmitButton() {
  const isValid = Object.values(validationState).every(v => v);
  document.getElementById('signup-submit').disabled = !isValid;
}


document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    // Verifica disponibilidade do username
    //console.log("Button Clicked!")
    
    if (Url.has("?mode=signup")) {
      const usernameAvailable = await checkUsernameAvailability(form.username().value.trim());
      if (usernameAvailable) throw new Error(usernameAvailable);
      
      const userCredential = await auth.createUserWithEmailAndPassword(form.email().value.trim(), form.password().value.trim());
      
      await saveUserProfile(userCredential.user.uid, {
        username: form.username().value.trim(),
        email: form.email().value.trim(),
        avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${form.username().value.trim()}`
      });
      
      await sendEmailVerification(userCredential.user)
    } else if (Url.has("?mode=login")) {
      Loader.show()
      let res = await login(form.email().value, form.password().value)
      
      let username = (await getDocument("users", res.user.uid)).username
      
      Url.clear(`Bem vindo de volta, ${username}!`, "success")
      Loader.hide()
    } else {
      Loader.show()
      notify("Seu link está sendo processado!", "success")
      
      await sendEmailVerification(auth.currentUser)
      //console.log(auth.currentUser.uid)
      PanelEmailVerification()
      
      Loader.hide()
    }
  } catch (error) {
    handleAuthError(error);
    Loader.hide()
  }
});


document.getElementById('togglePassword').addEventListener('click', function() {
  const passwordInput = document.getElementById('password');
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

document.addEventListener('DOMContentLoaded', function() {
  const brandElements = document.querySelectorAll('.brand-logo');
  brandElements.forEach(element => {
    element.style.opacity = '0';
    setTimeout(() => {
      element.style.transition = 'opacity 1s ease';
      element.style.opacity = '1';
    }, 500);
  });
});

// Função para criar os cards de addons
function createModCard(mod) {
  const card = document.createElement("div");
  card.className = "col-md-4 mb-4";
  
  const thumbnailUrl = getYouTubeThumbnail(mod.youtubeId, "maxresdefault");
  const createAt = mod.info.date ? getDateFromTimestamp(mod.info.date) : new Date();
  const releaseDate = mod.info.date ? getRelativeTime(createAt.getTime()) : "Indeterminado";
  
  // Atualizar badge "Novo"
  const isNew = (Date.now() - createAt.getTime()) < 604800000; // 7 dias
  
  card.innerHTML = `
    <div id="card-${mod.id}" class="card addon-card h-100">
        <div class="position-relative">
            <img src="${thumbnailUrl}" 
                 class="card-img-top" 
                 alt="${mod.name}"
                 onerror="this.src='/assets/img/default.jpg'">
            ${isNew ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2">Novo</span>' : ''}
        </div>
        
        <div class="card-body d-flex flex-column">
            <div class="flex-grow-1">
                <h5 class="card-title text-truncate">${mod.name}</h5>
                <p class="card-text text-generic line-clamp-3">${mod.info.description}</p>
            </div>
            
            <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="version-badge">v${mod.version}</span>
                    <small class="text-generic">${releaseDate}</small>
                </div>
                
                <div class="d-flex justify-content-between align-items-center gap-2">
                    <a href="/addon_details/?id=${mod.id}" 
                       class="btn btn-danger flex-grow-1"
                       data-bs-toggle="tooltip" 
                       title="Ver detalhes completos">
                       <i class="fas fa-info-circle me-2"></i>Detalhes
                    </a>
                    
                    <a href="https://youtu.be/${mod.youtubeId}" 
                       class="btn btn-outline-danger"
                       target="_blank"
                       data-bs-toggle="tooltip"
                       title="Assistir vídeo demonstrativo">
                       <i class="fab fa-youtube"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
`;
  
  return card;
}

// Função para buscar e exibir os addons
async function loadMods() {
  
  
  try {
    Loader.show()
    const mods = await getAllDocuments("mods");
    const modsContainer = document.getElementById("mods-container");
    modsContainer.innerHTML = "";
    
    mods.sort((a, b) => (b.info.date.seconds - a.info.date.seconds))
    mods.forEach(mod => {
      const modCard = createModCard(mod);
      modsContainer.appendChild(modCard);
    });
    
    Loader.hide()
    
    // Ativa os tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(triggerEl => new bootstrap.Tooltip(triggerEl));
  } catch (error) {
    console.error( error);
  }
}


// Função para adicionar novo addon
async function addNewMod() {
  const newMod = {
    name: document.getElementById('modName').value,
    info: {
      description: document.getElementById('modDescription').value,
      date: firebase.firestore.FieldValue.serverTimestamp(), // Data automática
      version: document.getElementById('modVersion').value,
      support: document.getElementById('modSupport').value
    },
    youtubeId: extractYouTubeId(document.getElementById('youtubeUrl').value),
    downloadUrl: "#",
    category: document.getElementById('modCategory').value
  };
  
  try {
    await setDocument("mods", crypto.randomUUID(), newMod);
    notify('Addon adicionado com sucesso!',"success");
    loadMods(); // Recarrega a lista
  } catch (error) {
    console.error('Erro ao adicionar:', error);
  }
}

document.addEventListener("DOMContentLoaded", main);
document.addEventListener("DOMContentLoaded", loadMods);