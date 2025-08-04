async function main() {
  const addonId = Url.getParam('id');

  if(!addonId){
    //Url.open("/","Erro ao carregar a página, não foi possível obter as informações do Add-on!")
    Loader.hide()
    return
  }

  const addon = await getDocument("mods", addonId);

  if (addon) {
    document.title = `${addon.name} - J335-STUD!OS`;

    // Preenche os dados
    
    //document.getElementById('exitBtn').href = "/#card-" + addonId;
    document.getElementById('currentVersion').textContent = addon.version;
    document.getElementById('addonDescription').innerHTML = addon.info.description;
    document.getElementById('preview-container').innerHTML = addon.info.bodyHTML;
    document.getElementById('fileSize').textContent = addon.info?.fileSize;
    document.getElementById('lastUpdate').textContent = getDateFromTimestamp(addon.info.date).toLocaleDateString();

    // Preenche o carrossel
    const carouselInner = document.querySelector('.carousel-inner');
      [getYouTubeThumbnail(addon.youtubeId)].forEach((img, index) => {
      carouselInner.innerHTML += `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <img src="${img}" class="d-block w-100" alt="Screenshot ${index + 1}">
                        </div>
                    `;
    });

    // Preenche a compatibilidade
    const compatibilityList = document.getElementById('compatibilityList');
    const uniqueVersions = addon.info.support //[...new Set(addon.versions.map(v => v.minecraft))];
    uniqueVersions.forEach(version => {
      compatibilityList.innerHTML += `
                        <li class="compatibility-item">
                            <i class="fas fa-check-circle me-2 text-success"></i>
                            Minecraft ${version}
                        </li>
                    `;
    });

    // Preenche o seletor de versões
    const versionSelect = document.getElementById('versionSelect');
      [addon].forEach(version => {
      versionSelect.innerHTML += `
                        <option value="${version.download??"Invalid"}" 
                                data-size="${version.info.size??"??"}" 
                                data-date="${getDateFromTimestamp(version.info.date).toLocaleDateString()}">
                            v${version.version} (Minecraft ${version.info.support})
                        </option>
                    `;
    });

    // Preenche o changelog
    const changelogList = document.getElementById('changelogList');
      ["None"].forEach(change => {
      changelogList.innerHTML += `
                        <li class="mb-2">
                            <i class="fas fa-code-branch me-2 text-primary"></i>
                            ${change}
                        </li>
                    `;
    });

    // Atualiza o download ao selecionar versão
    versionSelect.addEventListener('change', function() {
      document.getElementById('downloadBtn').setAttribute('href', this.value);
      document.getElementById('fileSize').textContent = this.selectedOptions[0].dataset.size;
      document.getElementById('lastUpdate').textContent = new Date(this.selectedOptions[0].dataset.date).toLocaleDateString();
    });

    // Configura o botão de download inicial
    document.getElementById('downloadBtn').setAttribute('href', addon.downloadUrl);
    
    Loader.hide()
  }else{
    window.location.href = "404.html"
  }
}

document.addEventListener("DOMContentLoaded", main);