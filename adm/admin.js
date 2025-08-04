// Autenticação e Controle de Acesso
let currentUser = null;
let mods = [];
let editingMod = null;

// Função de autenticação
async function initAuth() {
  firebase.auth().onAuthStateChanged(async user => {
    //console.log(user?.uid)
    
    if (user && await isAdmin(user.uid)) {
      currentUser = user
      RenderAdminPanel();
      
      document.body.classList.add('logged-in');
      
      //document.getElementById("iconInput").addEventListener("input",Icon)
    } else {
      //RenderLoginForm();
      NotADM()
    }
  });
}

function setupForm() {
  const form = document.getElementById('modForm');
  
  form.innerHTML = `
        <h4 class="mb-3">${editingMod ? 'Editar' : 'Adicionar'} Addon</h4>
        
        
        <div class="mb-3">
          <label class="form-label w-100"><i class="far fa-image"></i> Ícone</label>
          
          <div class="w-100">
          <img id="modIcon" src="/assets/img/default.jpg" class="icon" alt="Ícone do Add-on" onerror="this.src='/assets/img/default.jpg'">
          </div>
          
          <label for="iconInput" class="custom-file-label">
            <i class="fa-solid fa-image"></i> Alterar Imagem
          </label>
          <span id="fileName">Galeria</span>
          <input type="file" id="iconInput" class="hidden-file-input" accept="image/*">
          <p id="fileError" class="fileError-message"></p>
        </div>
        
        <div class="mb-3">
            <label class="form-label"><i class="fas fa-pen-to-square"></i> Nome</label>
            <input type="text" id="modName" class="form-control"
            placeholder="Add-on"
            required>
        </div>

        <div class="mb-3">
            <label class="form-label"><i class="fas fa-newspaper"></i> Descrição</label>
            <textarea id="modDescription" class="form-control tyne-textarea" rows="3" placeholder="Descreva o add-on..." required></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label"><i class="fas fa-code"></i> Componentes</label>
          
          <div id="toolbar-container">
  <span class="ql-formats">
    <select class="ql-header">
      <option selected></option>
      <option value="1"></option>
      <option value="2"></option>
      <option value="3"></option>
    </select>
    <button class="ql-script" value="sub"></button>
    <button class="ql-script" value="super"></button>
    <button class="ql-indent" value="-1"></button>
    <button class="ql-indent" value="+1"></button>
    <button class="ql-direction" value="rtl"></button>
    <select class="ql-align"></select>
    <button class="ql-bold"></button>
    <button class="ql-italic"></button>
    <button class="ql-underline"></button>
    <button class="ql-strike"></button>
    <button class="ql-list" value="ordered"></button>
    <button class="ql-list" value="bullet"></button>
    <button class="ql-blockquote"></button> <!-- ← Aqui está o botão de citação -->
    <button class="ql-code-block"></button>
    <button class="ql-image"></button>
    <button class="ql-link"></button>
    <button class="ql-clean"></button>
    <select class="ql-color"></select>
    <select class="ql-background"></select>
    
    <!-- Botões personalizados -->
    <!-- <button id="insert-changelog" title="Inserir changelog"><i class="fa-solid fa-file-invoice ql-button-icon"></i></button> -->
  </span>
</div>

          
          <div id="editor-container"></div>
          <div id="word-counter">Palavras: 0 | Caracteres: 0</div>
          <div id="preview-container" class="ql-editor mt-3"></div>
        </div>

        <div class="row g-3 mb-3">
            <div class="col-md-4">
                <label class="form-label"><i class="fas fa-hashtag"></i> Versão</label>
                <input type="text" id="modVersion" class="form-control" placeholder="1.0.0" required>
            </div>
            
            <div class="col-md-4">
                <label class="form-label"><i class="fas fa-code-compare"></i> Compatibilidade</label>
                <!--input type="text" id="modSupport" class="form-control" placeholder="1.21.51+" required-->
            <select id="modSupport" class="form-select" multiple size="5">
                <option value="" disabled selected hidden>Selecionar Versão</option>
  
                <option>1.21.51+</option>
                <option>1.21.60+</option>
                <option>1.21.70+</option>
                <option>1.21.80+</option>
                <option>1.21.90+</option>
                <option>1.22</option>
            </select>
            </div>
            <div class="col-md-4">
                <label class="form-label"><i class="fas fa-database"></i> Tamanho</label>
                <input type="text" id="modSize" class="form-control" placeholder="1.0MB" required>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label"><i class="fas fa-link"></i> Url do YouTube</label>
            <input type="url" id="youtubeUrl" class="form-control" placeholder="https://youtu.be/..." required>
        </div>

        <div class="mb-3">
            <label class="form-label"><i class="fas fa-tags"></i> Categoria</label>
            <select id="modCategory" class="form-select">
                <option value="" disabled selected hidden>Selecionar Categoria</option>
  
                <option>Tecnology</option>
                <option>Magic</option>
                <option>Decoration</option>
                <option>Utilities</option>
                <option>BETA</option>
                <option>Scripts</option>
                <option>Vanilla</option>
            </select>
            <div class="selected-categories" id="selectedCategoriesContainer"></div>

        </div>

        <div class="d-flex gap-2">
            <button type="submit" class="btn btn-danger">
                ${editingMod ? 'Atualizar' : 'Adicionar'}
            </button>
            
            ${editingMod ? 
                `<button type="button" onclick="cancelEdit()" class="btn btn-outline-danger">
                    Cancelar
                </button>` : ''
            }
        </div>
        <div id="modID" class="d-none">${editingMod ? editingMod.id : ""}</div>
    `;
  
  const select = document.getElementById("modCategory");
  const supportOptions = Array.from(document.getElementById('modSupport').options)
  
  const container = document.getElementById("selectedCategoriesContainer");
  
  select.dataset.categories = JSON.stringify([]);
  
  select.addEventListener("change", function() {
    const selectedValue = this.value;
    select.selectedIndex = 0
    
    let categories = JSON.parse(this.dataset.categories);
    
    if (!categories.includes(selectedValue)) {
      categories.push(selectedValue);
      this.dataset.categories = JSON.stringify(categories);
      renderSelectedCategories(categories);
    }
  });
  
  if (editingMod) {
    
    // Preenche os campos se estiver editando
    document.getElementById('modIcon').src = editingMod.icon ?? "error";
    document.getElementById('modName').value = editingMod.name;
    document.getElementById('modDescription').value = editingMod.info.description;
    
    setTimeout(() => {
      quill
        .clipboard
        .dangerouslyPasteHTML(editingMod.info.bodyHTML ?? "")
    }, 100);
    document.getElementById('preview-container').innerHTML = editingMod.info.bodyHTML ?? "";
    document.getElementById('modVersion').value = editingMod.version;
    
    supportOptions
    .map((e)=>e.selected=!!(editingMod.info.support.includes(e.value)));
    
    document.getElementById('modSize').value = editingMod.info?.fileSize ?? "N/A";
    document.getElementById('youtubeUrl').value = `https://youtu.be/${editingMod.youtubeId}`;
    document.getElementById("modCategory").dataset.categories = JSON.stringify(editingMod.categories);
    renderSelectedCategories(editingMod.categories);
    document.getElementById("modID").innerHTML = editingMod.id;
    //console.log(editingMod)
  }
  
  document
    .getElementById("iconInput")
    .addEventListener("change", function() {
      const file = this.files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB em bytes
      const fileNameSpan = document.getElementById("fileName");
      const fileError = document.getElementById("fileError");
      const previewImage = document.getElementById("modIcon")
      
      if (file) {
        console.log(formatBytes(file.size))
        
        if (file.size > maxSize) {
          fileError.textContent = "Erro: O arquivo deve ter no máximo 1MB!";
          this.value = ""; // Reseta o input para evitar upload
          previewImage.src = "error"
          
          fileNameSpan.textContent = "Galeria"; // Reseta o nome
        } else {
          fileError.textContent = ""; // Limpa erros anteriores
          fileNameSpan.textContent = file.name; // Exibe o nome do arquivo
          
          const reader = new FileReader();
          
          reader.onload = function(e) {
            previewImage.src = e.target.result;
            //previewImage.style.display = "block"; // Exibir a imagem
          };
          
          reader.readAsDataURL(file); // Converter a imagem para base64 temporário
          
          console.log(file.name)
        }
      } else {
        notify("Nenhuma imagem foi selecionada!")
      }
    });
  
  LoadModalForm()
  LoadQuillElements()
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  };
}

function renderSelectedCategories(categories) {
  const select = document.getElementById("modCategory");
  const container = document.getElementById("selectedCategoriesContainer");
  
  container.innerHTML = ""; // Limpa antes de renderizar
  categories.forEach((category, index) => {
    const tag = document.createElement("div");
    tag.className = "category-tag";
    tag.innerHTML = `${category} <button onclick="removeCategory(${index})">&times;</button>`;
    container.appendChild(tag);
  });
}

function removeCategory(index) {
  let select = document.getElementById("modCategory")
  let categories = JSON.parse(select.dataset.categories);
  categories.splice(index, 1);
  select.dataset.categories = JSON.stringify(categories);
  renderSelectedCategories(categories);
}

async function loadEditableMods() {
  try {
    mods = await getAllDocuments('mods');
    const list = document.getElementById('modsList');
    
    mods.sort((a, b) => (b.info.date.seconds - a.info.date.seconds))
    list.innerHTML = mods.map(mod => `
            <div id="${mod.id}" class="card mb-3">
                <div class="card-body">
                    <div>
                    <div><h5 class="card-modName w-100">${mod.name}</h5></div>
                        <div class="d-flex justify-content-between align-items-center">
                            
                              <button class="btn btn-sm btn-danger copy-btn" onclick="copy('${mod.id}')"> Copiar ID</button>
                            <div class="d-flex card-modInfo"><small class="text-muted">Versão: ${mod.version}</small><small class="text-muted">Tamanho: ${mod.info.fileSize}</small></div>
                        </div>
                        
                        <div class="d-flex ">
                            <button onclick="editMod('${mod.id}')" 
                                    class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-edit"></i>
                            </button>
                            
                            <button type="button" data-bs-toggle="modal" 
                  data-bs-target="#ModalForm"
                  data-modal-event="deleteMod('${mod.id}')"
                  data-modal-context="Tem certeza que deseja excluir este add-on?"
                  data-modal-title="<i class='fas fa-trash'></i> Deletar Add-on!"
                  class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    
    setTimeout(LoadModalForm, 1000)
  } catch (error) {
    console.error('Erro ao carregar mods:', error);
  }
}

async function editMod(modId) {
  if (editingMod && editingMod.id == modId) {
    notify('O mod já está sendo editado!')
    return
  }
  
  editingMod = await getDocument('mods', modId);
  editingMod.id = modId
  
  let selected = document.getElementById(modId)
  
  document
    .querySelectorAll(".selected")
    .forEach(e => e.classList.remove("selected"))
  
  selected
    .classList
    .add("selected")
  
  setupForm();
}

function cancelEdit() {
  editingMod = null;
  setupForm();
}

async function deleteMod(modId) {
  let res = false
  if (res) {
    await deleteDocument('mods', modId);
    loadEditableMods();
  } else {
    console.log("Deletado com sucesso!")
  }
}

async function handleFormSubmit() {
  Loader.show()
  
  let youtubeId = extractYouTubeId(document.getElementById('youtubeUrl').value)
  
  let id = document.getElementById('modID').innerHTML
  
  let icon = document.getElementById("modIcon")
  let iconFile = document
    .getElementById("iconInput")
    .files[0]
  let iconUrl = iconFile ? await uploadImageToCloudinary("mod_pictures", iconFile) : icon.src;
  
  const modData = {
    icon: (iconUrl == "error" || iconUrl == "/assets/img/default.jpg") ? (editingMod.icon ?? "") : iconUrl,
    name: document.getElementById('modName').value,
    version: document.getElementById('modVersion').value,
    info: {
      description: document.getElementById('modDescription').value,
      support: Array
      .from(document
      .getElementById('modSupport')
      .selectedOptions)
      .map(opt => opt.value),
      date: editingMod?.info.date || firebase.firestore.FieldValue.serverTimestamp(),
      fileSize: document.getElementById('modSize').value,
      bodyHTML: quill.root.innerHTML ?? "",
    },
    youtubeId,
    downloadUrl: "#",
    categories: JSON.parse(document.getElementById("modCategory").dataset.categories)
  };
  
  modData.id = id ? id : crypto.randomUUID()
  
  try {
    
    await setDocument('mods', modData.id, modData);
    
    editingMod = null;
    loadEditableMods();
    setupForm();
    
    Loader.hide()
    notify(`Você alterou os parâmetros do \"${modData.name}\" com Sucesso!`, "success")
  } catch (error) {
    console.error('Erro ao salvar: ' + error.message);
    console.log(modData)
    Loader.hide()
  }
}

function NotADM() {
  const message = encodeURIComponent('Acesso restrito: Você precisa ser administrador!');
  window.location.href = `/?message=${message}&type=error`;
  Loader.hide()
}

function RenderAdminPanel() {
  //console.log(currentUser?.uid)
  // Redireciona não autorizados
  if (window.location.pathname.includes('/admin') && !currentUser) {
    NotADM();
  }
  
  const panel = document.getElementById('adminPanel');
  panel.innerHTML = `
                <h2 class="text-center mb-4">Painel de Administração</h2>
                
                <div class="admin-only">
                    <!-- Formulário de Adição -->
                    <form id="modForm" class="mb-3">
                        <!-- Campos do formulário aqui -->
                    </form>

                    <!-- Lista de Mods para Edição -->
                    <h3 class="mb-3">Mods Existentes</h3>
                    <div id="modsList"></div>
                </div>
            `;
  
  loadEditableMods();
  setupForm();
  Loader.hide()
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initAuth);