class Component {
  constructor(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim(); // Remove espaços em branco
    this.element = template.content.firstElementChild;
  }
  
  toString() {
    return this.element.outerHTML;
  }
  
  elements() {
    return this.element;
  }
}

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

function CompressNumber(number, decimals = 2) {
  let category = ["", "k", "M", "B", "T", "Q", "Qi"];
  let value = number.toString();
  let index = (Math.log10(value) / 3 | 0);
  
  if (index < 1)
    return value
  
  return (value / Math.pow(10, index * 3)).toFixed(1) + category[index];
}


// 🔹 Exemplo de Uso
const mediafireUrl = "https://www.mediafire.com/file/qg1nfgu7adx9uv2/%255BRES%255D_-_More_Chest.v3.0.zip/file"; // Url do arquivo

function PreviousPage() {
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

async function uploadImageToCloudinary(uploadPreset, file) {
  const cloudName = 'dqnrbabe8';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error ? data.error.message : 'Erro no upload');
  }
  
  // Obter dimensões da imagem
  const img = new Image();
  img.src = data.secure_url;
  
  await new Promise(resolve => {
    img.onload = resolve;
  });
  
  const width = img.width;
  const height = img.height;
  
  let finalUrl = data.secure_url;
  
  // Aplica transformação se a resolução for menor que 256x256
  if (width < 256 || height < 256) {
    // Inserir transformação na URL
    finalUrl = data.secure_url.replace(
      '/upload/',
      `/upload/w_256,h_256,c_pad,e_sharpen/`
    );
  }
  
  return finalUrl;
}


function copy(text) {
  try {
    
    console.log(text)
    
    const textarea = document.createElement("textarea");
    
    textarea.value = text;
    //textarea.style.display = "none"
    
    document.body.appendChild(textarea);
    textarea.select();
    
    textarea.setSelectionRange(0, 99999); // Compatibilidade mobile
    
    // Copiar
    document.execCommand("copy");
    
    // Remover o textarea
    document.body.removeChild(textarea);
    
    notify("Texto copiado com sucesso!", "success");
  } catch (err) {
    notify("Erro ao copiar: " + err);
  }
}

document
  .querySelectorAll(".text-copy")
  .forEach(e => {
    e.addEventListener("click", function(event) {
      copy(this.textContent)
    })
  })

function LoadModalForm() {
document
  .querySelectorAll('[type="button"][data-bs-toggle="modal"]')
  .forEach(element => {
    element.addEventListener("click", function() {
      let title = document.getElementById("modal-title")
      let context = document.getElementById("modal-context")
      let button = document.getElementById("modal-button-confirm")
      
      title.innerHTML = this.dataset.modalTitle ?? this.innerHTML
      context.innerHTML = this.dataset.modalContext
      button.innerHTML = this.dataset.acceptBtn ?? "Sim"
      button.onclick = this.dataset.modalEvent
    })
  })
}

LoadModalForm()

const Url = {
  getParam(param) {
    // Cria um objeto URLSearchParams a partir da parte da query string da Url
    const params = new URLSearchParams(window.location.search);
    
    // Obtém o valor do parâmetro "addonId"
    return params.get(param);
  },
  clear(msg, type) {
    window.history.replaceState({}, document.title, window.location.pathname);
    if (msg) {
      notify(msg, type)
    }
  },
  open(href, msg, type = "error") {
    if (href == "reload")
      href = window.location.href
    
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
  } else if (type == "info") {
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