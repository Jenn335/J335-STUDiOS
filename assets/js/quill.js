let quill = null;

function LoadQuillElements() {
  setTimeout(() => {
    try {
      //console.log(Quill.imports)
      
      quill = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: "Descreva...",
        history: {
          delay: 100,
          userOnly: true
        },
        modules: {
          syntax: true,
          toolbar: '#toolbar-container',
        }
      });
      
      
      
      // Contador
      quill.on('text-change', () => {
        const text = quill.getText().trim();
        const words = text ? text.split(/\s+/).length : 0;
        
        document.getElementById('word-counter').textContent =
          `Palavras: ${words} | Caracteres: ${text.length}`;
        
        document.getElementById('preview-container').innerHTML = quill.root.innerHTML;
      });
      
      const bulletSelector = document.querySelector('.ql-custom-bullet');
      
      if (bulletSelector)
        bulletSelector.addEventListener('change', () => {
          const range = quill.getSelection();
          const value = bulletSelector.value;
          
          if (range) {
            quill.formatLine(range.index, 1, 'list', 'bullet'); // Aplica lista se não tiver
            
            const [block] = quill.getLine(range.index);
            const domNode = block.domNode;
            
            // Remove outras classes
            domNode.classList.remove('bullet-star', 'bullet-check');
            
            if (value === 'star') {
              domNode.classList.add('bullet-star');
            } else if (value === 'check') {
              domNode.classList.add('bullet-check');
            }
          }
        });
      
      
      
      /*
document.getElementById('insert-changelog').addEventListener('click', () => {
  const changelogHTML = `
    <div class="changelog">
      <details open>
        <summary><i class="fas fa-circle-plus"></i> <strong>Adicionado</strong></summary>
        <div class="entry added">Nova funcionalidade incrível</div>
      </details>
      <details open>
        <summary><i class="fas fa-wrench"></i> <strong>Corrigido</strong></summary>
        <div class="entry fixed">Correção do bug da interface</div>
      </details>
    </div><p><br></p>
  `;
  quill.clipboard.dangerouslyPasteHTML(quill.getLength() - 1, changelogHTML, 'user');
});


// Script global para copiar changelog ao clicar no botão
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('copy-changelog')) {
    const changelogContainer = e.target.closest('.changelog-container');
    const tempText = document.createElement('textarea');
    tempText.value = changelogContainer.querySelector('.changelog').innerText;
    document.body.appendChild(tempText);
    tempText.select();
    document.execCommand('copy');
    document.body.removeChild(tempText);
    e.target.textContent = '✅ Copiado!';
    setTimeout(() => e.target.innerHTML = '<i class="fas fa-check"></i> Copiado!', 2000);
  }
});
*/
    } catch (error) {
      console.log(error)
    }
  }, 0)
};