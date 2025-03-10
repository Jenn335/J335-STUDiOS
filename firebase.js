const { createClient } = supabase

const supabaseUrl = "https://vjzgnnstusvgjwgmjyhr.supabase.co"; // Substitua pelo seu Url
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqemdubnN0dXN2Z2p3Z21qeWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxODgzNzMsImV4cCI6MjA1NDc2NDM3M30.luni1Z9bJjc1MgO1G9thawmhKYel9zLwro0aHq9dOVM"; // Substitua pela sua chave API

const _supabase_ = createClient(supabaseUrl, supabaseKey)

/**
 * 🔹 Insere um novo registro na tabela especificada.
 * @param {string} tabela - Nome da tabela no _supabase_.
 * @param {object} dados - Objeto contendo os dados a serem inseridos.
 * @returns {object|null} - Retorna o registro inserido ou null em caso de erro.
 */
async function sdb_set(tabela, dados) {
  const { data, error } = await _supabase_.from(tabela).insert([dados]);
  return error ? (console.error(error.message), null) : data;
}


/**
 * 🔹 Obtém um registro pelo ID.
 * @param {string} tabela - Nome da tabela.
 * @param {string} id - ID do registro.
 * @returns {object|null} - Retorna o registro encontrado ou null.
 */
async function sdb_get(tabela, id) {
  const { data, error } = await _supabase_.from(tabela).select("*").eq("id", id).single();
  return error ? (console.error(error.message), null) : data;
}

/**
 * 🔹 Atualiza um registro no banco de dados.
 * @param {string} tabela - Nome da tabela.
 * @param {string} id - ID do registro a ser atualizado.
 * @param {object} novosDados - Campos a serem atualizados.
 * @returns {object|null} - Retorna o registro atualizado ou null.
 */
async function sdb_update(tabela, id, novosDados) {
  const { data, error } = await _supabase_.from(tabela).update(novosDados).eq("id", id);
  return error ? (console.error(error.message), null) : data;
}

/**
 * 🔹 Obtém todos os registros de uma tabela.
 * @param {string} tabela - Nome da tabela.
 * @returns {array|null} - Retorna um array de registros ou null.
 */
async function sdb_getAll(tabela) {
  const { data, error } = await _supabase_.from(tabela).select("*");
  return error ? (console.error(error.message), null) : data;
}

/**
 * 🔹 Faz upload de um arquivo para o _supabase_ Storage.
 * @param {string} bucket - Nome do bucket no _supabase_.
 * @param { name:string, content:File, settings?:object } arquivo - Arquivo a ser enviado.
 * @returns {string|null} - Retorna a Url pública do arquivo ou null em caso de erro.
 */
async function uploadFile(bucket,arquivo) {
  const { data, error } = await _supabase_.storage.from(bucket).upload(arquivo.name,arquivo.content,arquivo.settings);
  if (error) return console.error(error.message), null;

  return getFileUrl(bucket, arquivo.name);
}

/**
 * 🔹 Obtém o tamanho de um arquivo a partir da Url.
 * @param {string} fileUrl - Url do arquivo no MediaFire.
 * @returns {Promise<string>} - Retorna o tamanho formatado (KB, MB, etc.).
 */
async function getFileSize(fileUrl) {
  try {
    const response = await fetch(fileUrl, { method: "HEAD" });
    const contentLength = response.headers.get("Content-Length");

    if (!contentLength) {
      throw new Error("Não foi possível obter o tamanho do arquivo.");
    }

    return formatBytes(parseInt(contentLength));
  } catch (error) {
    console.error("Erro ao obter o tamanho do arquivo:", error);
    return "Erro ao obter tamanho";
  }
}


/**
 * 🔹 Obtém a Url pública de um arquivo armazenado.
 * @param {string} bucket - Nome do bucket.
 * @param {string} caminho - Caminho do arquivo no bucket.
 * @returns {string} - Retorna a Url pública do arquivo.
 */
function getFileUrl(bucket, caminho) {
  return _supabase_.storage.from(bucket).getPublicUrl(caminho).data.publicUrl;
}

/**
 * 🔹 Deleta um arquivo do _supabase_ Storage.
 * @param {string} bucket - Nome do bucket.
 * @param {string} caminho - Caminho do arquivo a ser deletado.
 * @returns {boolean} - Retorna true se deletado com sucesso, false se houver erro.
 */
async function deleteFile(bucket, caminho) {
  const { error } = await _supabase_.storage.from(bucket).remove([caminho]);
  return error ? (console.error(error.message), false) : true;
}



/* =======================================================
   Arquivo: assets/js/firebase.js
   Descrição: Funções customizadas para utilização dos serviços
              Firebase (Auth, Firestore e Storage) utilizando a
              versão mais recente do Firebase (compat) via script.
   ======================================================= */

/* ---------- Inicialização do Firebase ---------- */

const firebaseConfig = {
  apiKey: "AIzaSyDkrmrRrzLYUKooYa_qTHlzroSEzjfZDZA",
  authDomain: "j335-addons.firebaseapp.com",
  projectId: "j335-addons",
  storageBucket: "j335-addons.firebasestorage.app",
  messagingSenderId: "592911173418",
  appId: "1:592911173418:web:c3cdb921e7bd6620ec0053",
  measurementId: "G-FRV15EN5QW"
};

firebase.initializeApp(firebaseConfig);

// Inicializa os serviços utilizados
var auth = firebase.auth();
var db = firebase.firestore();
var storage = firebase.storage();

/* =======================================================
   Funções para Autenticação (Firebase Auth)
   ======================================================= */

/**
 * Registra um novo usuário utilizando email e senha.
 *
 * @param {string} email - Email do novo usuário.
 * @param {string} password - Senha para o novo usuário.
 * @returns {Promise} - Promise com as credenciais do usuário.
 */
async function signUp(username, email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

    // Salva dados adicionais no Firestore
    await setDocument('users', userCredential.user.uid,
    {
      username: username,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=" + username
    });
    alert('Registro realizado com sucesso!');
  } catch (error) {
    handleAuthError(error);
  }
}
// Tratamento de erros
function handleAuthError(error) {
  let message = '';
  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'Email já está em uso';
      break;
    case 'auth/invalid-email':
      message = 'Email inválido';
      break;
    case 'auth/invalid-login-credentials':
      message = 'Password incorrecta!';
      break;
    case 'auth/weak-password':
      message = 'Senha muito fraca (mínimo 6 caracteres)';
      break;
    default:
      message = 'Erro na autenticação';
  }
  notify(`Erro: ${message}`);
  console.log(error)
}

/**
 * Realiza o login do usuário com email e senha.
 *
 * @param {string} email - Email do usuário.
 * @param {string} password - Senha do usuário.
 * @returns {Promise} - Promise com as credenciais do usuário autenticado.
 */
async function login(email, password) {
  return auth.signInWithEmailAndPassword(email, password)
    .catch(function(error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    });
}

/**
 * Efetua o logout do usuário atualmente autenticado.
 *
 * @returns {Promise} - Promise que indica o sucesso da operação.
 */
async function logout() {
  try {
    let data = await auth.signOut();
    window.location.reload();
    return data
  } catch (error) {
    alert('Erro ao fazer logout: ' + error.message);
  }
}

function deleteUserAccount() {
  const user = auth.currentUser;

  if (user) {
    user.delete()
      .then(() => {
        //notify("Sua conta foi deletada com sucesso!");
        Url.open("/","Você deletou sua conta! Crie ou inicie sessão novamente.","success")
      })
      .catch((error) => {
        console.error("Erro ao deletar a conta:", error.message);
        if (error.code === "auth/requires-recent-login") {
          Url.open("/?mode=login","Para deletar sua conta, por favor, faça login novamente.");
        } else {
          notify("Ocorreu um erro ao tentar deletar sua conta.");
        }
      });
  } else {
    notify("Nenhum usuário autenticado.");
  }
}



async function getFirebaseUsers() {
    const listUsersResult = await auth.listUsers();
    return listUsersResult.users;
}

async function SyncUsers() {
    const firebaseUsers = await getFirebaseUsers();

    for (const user of firebaseUsers) {
        const { uid, email } = user;

        // Insira o usuário no Supabase
        const { data, error } = await supabase
            .from('firebase_users')
            .insert([{ firebase_uid: uid, email: email }]);

        if (error) {
            console.error('Erro ao inserir usuário:', error);
        } else {
            console.log('Usuário inserido:', data);
        }
    }
}

/* =======================================================
   Funções para Manipulação do Firestore (Banco de Dados)
   ======================================================= */

/**
 * Cria ou atualiza um documento em uma coleção específica.
 *
 * @param {string} collectionName - Nome da coleção.
 * @param {string} docId - ID do documento.
 * @param {object} data - Dados a serem salvos.
 * @returns {Promise} - Promise que indica o sucesso da operação.
 */
function setDocument(collectionName, docId, data) {
  return db.collection(collectionName)
    .doc(docId)
    .set(data, { merge: true })
    .catch(function(error) {
      console.error("Erro ao salvar documento:", error);
      throw error;
    });
}

/**
 * Obtém os dados de um documento do Firestore.
 *
 * @param {string} collectionName - Nome da coleção.
 * @param {string} docId - ID do documento.
 * @returns {Promise<object|null>} - Promise com os dados do documento ou null se não existir.
 */
function getDocument(collectionName, docId) {
  return db.collection(collectionName)
    .doc(docId)
    .get()
    .then(function(doc) {
      return doc.exists ? doc.data() : null;
    })
    .catch(function(error) {
      console.error("Erro ao obter documento:", error);
      throw error;
    });
}

/**
 * Atualiza campos específicos de um documento existente.
 *
 * @param {string} collectionName - Nome da coleção.
 * @param {string} docId - ID do documento.
 * @param {object} data - Dados que serão atualizados.
 * @returns {Promise} - Promise que indica o sucesso da operação.
 */
function updateDocument(collectionName, docId, data) {
  return db.collection(collectionName)
    .doc(docId)
    .update(data)
    .catch(function(error) {
      console.error("Erro ao atualizar documento:", error);
      throw error;
    });
}

/**
 * Remove um documento de uma coleção no Firestore.
 *
 * @param {string} collectionName - Nome da coleção.
 * @param {string} docId - ID do documento a ser removido.
 * @returns {Promise} - Promise que indica o sucesso da operação.
 */
function deleteDocument(collectionName, docId) {
  return db.collection(collectionName)
    .doc(docId)
    .delete()
    .catch(function(error) {
      console.error("Erro ao deletar documento:", error);
      throw error;
    });
}

/**
 * Realiza uma consulta na coleção filtrando por um campo e valor específicos.
 *
 * @param {string} collectionName - Nome da coleção.
 * @param {string} field - Nome do campo para o filtro.
 * @param {any} value - Valor que o campo deve ter.
 * @returns {Promise<Array>} - Promise com um array de objetos que atendem ao critério.
 */
function queryDocuments(collectionName, field, value) {
  return db.collection(collectionName)
    .where(field, "==", value)
    .get()
    .then(function(querySnapshot) {
      var results = [];
      querySnapshot.forEach(function(doc) {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    })
    .catch(function(error) {
      console.error("Erro ao consultar documentos:", error);
      throw error;
    });
}

/**
 * Retorna todos os documentos de uma coleção no Firestore.
 *
 * @param {string} collectionName - Nome da coleção.
 * @returns {Promise<Array>} - Promise que resolve para um array de objetos, onde cada objeto contém o ID e os dados do documento.
 */
function getAllDocuments(collectionName) {
  return db.collection(collectionName)
    .get()
    .then(function(querySnapshot) {
      var results = [];
      querySnapshot.forEach(function(doc) {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    })
    .catch(function(error) {
      console.error("Erro ao obter documentos da coleção:", error);
      throw error;
    });
}


/* =======================================================
   Funções para Manipulação do Firebase Storage (Upload de Arquivos)
   ======================================================= */

/**
 * Realiza o upload de um arquivo para o Firebase Storage.
 *
 * @param {File|Blob} file - Arquivo ou Blob a ser enviado.
 * @param {string} storagePath - Caminho no Storage onde o arquivo será armazenado.
 * @returns {Promise<string>} - Promise com a Url para download do arquivo enviado.
 
function uploadFile(file, storagePath) {
  var storageRef = storage.ref(storagePath);
  return storageRef.put(file)
    .then(function(snapshot) {
      return snapshot.ref.getDownloadURL();
    })
    .catch(function(error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      throw error;
    });
}*/

async function isAdmin(uid) {
  const doc = await firebase.firestore().collection('admins').doc(uid).get();
  return doc.exists;
}

// Função para manter usernames únicos
async function reserveUsername(username) {
    await firebase.firestore().collection('usernames').doc(username).set({
        uid: firebase.auth().currentUser.uid
    });
}

async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Verifica se é novo usuário
        if(result.additionalUserInfo.isNewUser) {
            //const username = await promptForUsername();
            await saveUserProfile(user.uid, {
                username: user.displayName.trim().replace(" ","_"),
                email: user.email,
                avatar: user.photoURL
            });
        }
    } catch (error) {
        handleAuthError(error);
    }
}

async function promptForUsername() {
    return new Promise((resolve) => {
        Swal.fire({
            title: 'Escolha um nome de usuário',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: false,
            confirmButtonText: 'Salvar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Você precisa digitar um nome de usuário!';
                }
                return checkUsernameAvailability(value);
            }
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(result.value);
            }
        });
    });
}

async function checkUsernameAvailability(username) {
    const snapshot = await firebase.firestore().collection('users')
        .where('username', '==', username)
        .get();
    
    return snapshot.empty ? null : 'Este nome de usuário já está em uso!';
}

async function saveUserProfile(uid, data) {
    let usersInfo = await getAllDocuments("users")
    
    let indx = usersInfo.filter(e=>e.username == data.username).length
    
    await sdb_set(
'firebase_users'
,{ 
firebase_uid
: uid, 
email
: data.email });
    
    await firebase.firestore().collection('users').doc(uid).set({
        ...data,
        username: data.username + (indx!=0 ? `_${indx}` : ""),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await reserveUsername(data.username)
}