async function main() {
  const teamInfoContent = document.getElementById("team")
  let teamUsers = await getAllDocuments("team")
  
  teamUsers.forEach(async (info)=>{
    let template = document.getElementById('team-card').content.cloneNode(true);
    
    let userData = await getDocument("users",info.uid)
    
    template.querySelector(".user-avatar").src = userData.avatar
    template.querySelector(".user-name").innerHTML = `${userData.username} <i class="bi bi-patch-check" style="color: #17FF69; font-size: 1.2rem;"></i>`
    template.querySelector(".user-position").textContent = info.position??"Member"
    
    if(!!info.links)
      Object
      .keys(info.links)
      .forEach(linkName=>{
        let e = template.querySelector(`a .fa-${linkName}`)
        
        if(!e) return;
        
        e.parentElement.href = info.links[linkName]
      })
    
    teamInfoContent.appendChild(template)
  })
  
  
  Loader.hide()
}


document.addEventListener("DOMContentLoaded",main)