
      function Pag(pag="home") {
        const pags = [ "home","mods","contact"]
        
        document
        .getElementById(pag)
        .style
        .display = 'block';
          
        for(let id of pags){
            if(id != pag && document.getElementById(id))
            document
            .getElementById(id)
            .style
            .display = 'none';
        }
      }
