var Loader = {
  addEventListener(event, callback) {
    document
      .getElementById("loader")
      .addEventListener("LoaderEvent", (data) => {
        if (data.detail.key == event)
          callback(data.detail.target)
      });
  },
  
  hasLoader() {
    return Boolean(document.getElementById('loader'))
  },
  show() {
    if (this.hasLoader()) {
      document.getElementById('loader').classList.remove('hidden');
      
      var LoaderEvents = new CustomEvent("LoaderEvent", { detail: { target: Loader, key: "show" } });
      
      document
        .getElementById("loader")
        .dispatchEvent(LoaderEvents);
    }
  },
  hide() {
    if (this.hasLoader()) {
      document.getElementById('loader').classList.add('hidden');
      
      var LoaderEvents = new CustomEvent("LoaderEvent", { detail: { target: Loader, key: "hide" } });
      
      document
        .getElementById("loader")
        .dispatchEvent(LoaderEvents);
    }
  }
}

// Mostra o loader ao iniciar o carregamento
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  
  // Esconde o loader quando a página termina de carregar
  window.onload = () => {
    if (window.location.href.includes("404"))
      Loader.hide();
  }
});

// Para navegação SPA (opcional)
if (window.history.pushState) {
  window.addEventListener('popstate', () => {
    document.getElementById('loader').classList.remove('hidden');
  });
}
