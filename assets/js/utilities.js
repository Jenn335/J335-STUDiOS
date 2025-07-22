function getDateFromTimestamp(timestamp) {
  if (typeof(timestamp) == "object" && !isNaN(timestamp.seconds))
    return new Date(timestamp.seconds * 1000);
  else if (!isNaN(timestamp))
    return new Date(timestamp * 1000);
  else {
    return null
  }
}

/**
 * Converte um timestamp em uma string com o tempo relativo.
 *
 * @param {number} timestamp - O timestamp (em milissegundos) a ser convertido.
 * @returns {string} - String representando o tempo relativo.
 */
function getRelativeTime(timestamp) {
  // Obtém o timestamp atual (em milissegundos)
  var now = Date.now();

  // Se o timestamp for do futuro, retorna "Em breve"
  if (timestamp > now) {
    return "Em breve";
  }

  // Calcula a diferença em milissegundos entre agora e o timestamp informado
  var delta = now - timestamp;

  // 1 minuto = 60.000 ms
  if (delta < 60000) {
    return "agora";
  }
  // 1 hora = 3.600.000 ms
  else if (delta < 3600000) {
    var minutes = Math.floor(delta / 60000);
    return minutes + "min atrás";
  }
  // 1 dia = 86.400.000 ms
  else if (delta < 86400000) {
    var hours = Math.floor(delta / 3600000);
    return hours + "h atrás";
  }
  // Se passou menos de 30 dias
  else if (delta < 30 * 86400000) {
    var days = Math.floor(delta / 86400000);
    return days + "d atrás";
  }
  // Se passou menos de 1 ano (considerando 30 dias por mês)
  else if (delta < 365 * 86400000) {
    var months = Math.floor(delta / (30 * 86400000));
    // Retorna "1mês" para 1 mês ou "Xmese(s)" para mais de um mês (sem "atrás" conforme exemplo)
    return months + (months === 1 ? "mês atrás" : " meses atrás");
  }
  // Para 1 ano ou mais (considerando 365 dias por ano)
  else {
    var years = Math.floor(delta / (365 * 86400000));
    return years + (years === 1 ? " ano" : " anos");
  }
}

function generateID() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `${timestamp}-${randomPart}`;
}


function getYouTubeThumbnail(youtubeId, quality = "hqdefault") {
  const qualities = {
    default: "default.jpg",
    mqdefault: "mqdefault.jpg",
    hqdefault: "hqdefault.jpg",
    sddefault: "sddefault.jpg",
    maxresdefault: "maxresdefault.jpg"
  };

  if (!qualities[quality]) {
    quality = "hqdefault";
  }

  return `https://img.youtube.com/vi/${youtubeId}/${qualities[quality]}`;
}

// Extrai ID do YouTube de URLs diferentes
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

let editingMod = null;

function setupForm() {
  const form = document.getElementById('modForm');

  form.innerHTML = `
        <h4 class="mb-3">${editingMod ? 'Editar' : 'Adicionar'} Addon</h4>
        
        <div class="mb-3">
            <label class="form-label">Nome</label>
            <input type="text" id="modName" class="form-control" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Descrição</label>
            <textarea id="modDescription" class="form-control" rows="3" required></textarea>
        </div>

        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <label class="form-label">Versão</label>
                <input type="text" id="modVersion" class="form-control" required>
            </div>
            
            <div class="col-md-6">
                <label class="form-label">Compatibilidade</label>
                <input type="text" id="modSupport" class="form-control" required>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Url do YouTube</label>
            <input type="url" id="youtubeUrl" class="form-control" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Categoria</label>
            <select id="modCategory" class="form-select">
                <option>Tecnology</option>
                <option>Magic</option>
                <option>Decoration</option>
                <option>Utilities</option>
                <option>BETA</option>
                <option>Scripts</option>
                <option>Vanilla</option>
            </select>
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

  if (editingMod) {
    // Preenche os campos se estiver editando
    document.getElementById('modName').value = editingMod.name;
    document.getElementById('modDescription').value = editingMod.info.description;
    document.getElementById('modVersion').value = editingMod.version;
    document.getElementById('modSupport').value = editingMod.info.support;
    document.getElementById('youtubeUrl').value = `https://youtu.be/${editingMod.youtubeId}`;
    document.getElementById('modCategory').value = editingMod.category;
    document.getElementById("modID").innerHTML = editingMod.id;
    console.log(editingMod.id)
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  };
}

/**
 * 🔹 Converte bytes para um formato legível (KB, MB, GB, etc.).
 * @param {number} bytes - Tamanho em bytes.
 * @param {number} decimals - Número de casas decimais (padrão: 2).
 * @returns {string} - Tamanho formatado.
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

// 🔹 Exemplo de Uso
const mediafireUrl = "https://www.mediafire.com/file/qg1nfgu7adx9uv2/%255BRES%255D_-_More_Chest.v3.0.zip/file"; // Url do arquivo


async function loadEditableMods() {
  try {
    const mods = await getAllDocuments('mods');
    const list = document.getElementById('modsList');

    mods.sort((a, b) => (b.info.date.seconds - a.info.date.seconds))
    list.innerHTML = mods.map(mod => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 style="color:black;">${mod.name}</h5>
                              <p style="color:#3030307D;">ID: ${mod.id}</p>
                            <small class="text-muted">v${mod.version}</small>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button onclick="editMod('${mod.id}')" 
                                    class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-edit"></i>
                            </button>
                            
                            <button onclick="deleteMod('${mod.id}')" 
                                    class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
  } catch (error) {
    console.error('Erro ao carregar mods:', error);
  }
}

async function editMod(modId) {
  editingMod = await getDocument('mods', modId);
  editingMod.id=modId
  setupForm();
}

function cancelEdit() {
  editingMod = null;
  setupForm();
}

async function deleteMod(modId) {
  if (confirm('Tem certeza que deseja excluir este mod?')) {
    await deleteDocument('mods', modId);
    loadEditableMods();
  }
}

async function handleFormSubmit() {
  let youtubeId = extractYouTubeId(document.getElementById('youtubeUrl').value)
  
  let id = document.getElementById('modID').innerHTML

  const modData = {
    name: document.getElementById('modName').value,
    version: document.getElementById('modVersion').value,
    info: {
      description: document.getElementById('modDescription').value,
      support: document.getElementById('modSupport').value,
      date: editingMod?.info.date || firebase.firestore.FieldValue.serverTimestamp()
    },
    youtubeId,
    downloadUrl: "#",
    category: document.getElementById('modCategory').value
  };
  
  modData.id = id ? id : crypto.randomUUID()

  try {

    await setDocument('mods', modData.id, modData);

    editingMod = null;
    loadEditableMods();
    setupForm();
    
    notify(`Você alterou os parâmetros do \"${modData.name}\" com Sucesso!`,"success")
  } catch (error) {
    alert('Erro ao salvar: ' + error.message);
  }
}

function PreviousPage(){
  if (history.length > 1)
    history.back();
  else notify('Não há página anterior!')
}

async function PageExist(url) {
  try {
    // Faz uma requisição do tipo HEAD para não baixar o conteúdo inteiro
    const resposta = await fetch(url, { method: 'HEAD' });
    // Se o status da resposta indicar sucesso (200-299), consideramos que a página existe
    return resposta.ok;
  } catch (erro) {
    // Se ocorrer algum erro na requisição, a função retorna false
    return false;
  }
}

const Url = {
  getParam(param) {
    // Cria um objeto URLSearchParams a partir da parte da query string da Url
    const params = new URLSearchParams(window.location.search);

    // Obtém o valor do parâmetro "addonId"
    return params.get(param);
  },
  clear(msg,type){
    window.history.replaceState({}, document.title, window.location.pathname);
    if (msg) {
      notify(msg,type)
    }
  },
  open(href, msg, type = "error") {
    if(href=="reload")
      href=window.location.href 
    
    PageExist(href).then(exist => {
      if (!exist) {
        window.location.href = "404.html"
      }
    });

    if (msg) {
      const message = encodeURIComponent(msg);

      window.location.href = `${href}${href.includes("?")?"&":"?"}message=${message}&type=${type}`;
    } else {
      window.location.href = href 
    }
    Loader.hide()
  },

  has(str) {
    return window.location.href.includes(str)
  }
}


let NotifyLastTimout = 0

function notify(message, type = 'error', duration = 4000) {
  const alert = document.getElementById('web-notification');
  const alertSound = alert.querySelector('#alert-sound');
  const alertBox = alert.querySelector('.alert-box');
  const alertMessage = alert.querySelector('.alert-message');
  const alertIcon = alert.querySelector('.alert-icon')

  // Reseta estilos
  alertBox.className = 'alert-box';
  alertBox.classList.add(`alert-${type}`);

  alertSound.play()

  if (type == "error") {
    alertIcon.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>`
  } else if (type == "success") {
    alertIcon.innerHTML = `<i class="fa-regular fa-circle-check"></i>`
  } else if(type == "info") {
    alertIcon.innerHTML = `<i class="fa-solid fa-circle-info"></i>`
  }


  // Configura mensagem
  alertMessage.textContent = message;

  // Animação
  alert.style.animation = 'none';
  void alert.offsetHeight; // Trigger reflow
  alert.style.animation = 'slideIn 4s forwards';

  // Remove após o tempo definido
  clearTimeout(NotifyLastTimout)
  NotifyLastTimout = setTimeout(() => {
    alert.style.animation = '';
    clearTimeout(NotifyLastTimout)
  }, duration);
}

// Função para ler parâmetros da Url
function AlertMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const type = urlParams.get('type') || 'error';

  if (message) {
    notify(decodeURIComponent(message), type);
    // Limpa a Url
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function URLParamEvents({ id, values = [], clear = false }, callback) {
  const urlParams = new URLSearchParams(window.location.search);

  const param = urlParams.get(id);
  const test = values.some(e => e == param)

  if (test || !values.length && (param != undefined)) {
    if (clear)
      window.history.replaceState({}, document.title, window.location.pathname);

    document.addEventListener('DOMContentLoaded', () => {
      callback(param)
    })
  }
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', AlertMessage);
