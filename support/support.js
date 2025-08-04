Loader.hide()
// Envio do formulário
    document.getElementById('supportForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const user = auth.currentUser;
      if (!user) {
        notify('Por favor, faça login primeiro!',"error");
        return;
      }
      
      const ticketData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value,
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'open'
      };
      
      try {
        await db.collection('supportTickets').add(ticketData);
        alert('Solicitação enviada com sucesso!');
        document.getElementById('supportForm').reset();
      } catch (error) {
        console.error('Erro ao enviar:', error);
        alert('Erro ao enviar solicitação');
      }
    });
  