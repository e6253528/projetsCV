// Importation du framework Express, qui permet de créer un serveur web facilement
const express = require('express');

// Importation de body-parser, un middleware pour traiter les données JSON dans les requêtes
const bodyParser = require('body-parser');

// Importation de la connexion à la base de données via Knex (défini dans le fichier db.js)
const db = require('./knex');

// Création d'une instance de l'application Express
const app = express();

const cookieParser = require('cookie-parser');

app.use(cookieParser());
// Définition du port sur lequel le serveur va écouter les requêtes
const PORT = 3000;

// Middleware pour traiter les requêtes envoyées en JSON et les rendre accessibles via req.body
app.use(bodyParser.json());

const path = require('path');
// Middleware pour servir des fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'page')));

// Route pour la page HTML qui contient le formulaire
app.get('/courses', (req, res) => {
    res.sendFile(path.join(__dirname, 'page', 'pageAdmin.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'page', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'page', 'login.html'));
});

app.get('/enrolls', (req, res) => {
  res.sendFile(path.join(__dirname, 'page', 'pageEtudiant.html'));
});


//1.Authentification --------------------------------------------------------------------------------------------
// inscription avec username,email,password,role (SA MARCHE !!!)
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Vérification des données
  if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs doivent être remplis, y compris le rôle.' });
  }

  if (role !== 'admin' && role !== 'student') {
    return res.status(400).json({ message: "Le rôle doit être 'admin' ou 'student'." });
  }

  try {
    // Insertion dans la base de données sans hachage du mot de passe
    const [id] = await db('users').insert({ name, email, password, role });
    const user = await db('users').where({ id }).first();
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Erreur de la base de données:', error.message);  // Afficher l'erreur détaillée
    res.status(500).json({ message: 'Erreur lors de l’ajout de l’inscription.', error: error.message });
  }
});

// connexion et gestion de session via cookies (SA MARCHE)
app.post('/api/login', async (req, res) => {
  const { name, password, role } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs doivent être remplis.' });
  }

  try {
    const user = await db('users').where({ name, role }).first();

    if (!user) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou role incorrect.' });
    }

    const correctMdp = password === user.password;

    if (correctMdp) {
      console.log('Connexion réussie');
      return res.status(200).json(user);
    }

    res.status(401).json({ message: 'Le mdp nest pas correct' });
  } catch (error) {
    console.error('Erreur de la base de données:', error.message);
    res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
  }
});

// deconnexion(supprime le cookie) (MARCHE)
app.post('/api/logout', (req, res) => {
  res.clearCookie('name');  // supprime le cookie 'name'
    res.clearCookie('role');  // supprime le cookie 'role'
    res.clearCookie('password');  // supprime le cookie 'password'

    res.status(200).json({ message: 'Déconnexion réussie' });
});

//2. Gestion des cours -----------------------------------------------------------------------------------------------------------
// créer un cours (MARCHE)
app.post('/api/courses', async (req, res) => {
  console.log('Cookies reçus:', req.cookies); // ajoute cette ligne pour voir les cookies envoyés au serveur

  const { title, description } = req.body;

  if (!title || !description) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  const adminId = req.cookies.id;  // récupérer l'ID de l'admin depuis les cookies
  console.log('ID Admin:', adminId);  // ajoute cette ligne pour vérifier l'ID récupéré

  if (!adminId) {
      return res.status(403).json({ message: 'Administrateur non connecté.' });
  }

  try {
      const [id] = await db('courses').insert({title,description,admin_id: adminId});
    if (!id) {
      return res.status(500).json({ message: 'Erreur lors de la création du cours.' });
    }
      const cours = await db('courses').where({ id }).first()
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé.' });
      }
      res.status(201).json(cours);
  } catch (error) {
      console.error('Erreur lors de l’ajout du cours:', error);
      res.status(500).json({ message: 'Erreur lors de l’ajout du cours', error: error.message });
  }
});

// supprimer un cours (MARCHE)
app.delete('/api/courses/:id', async (req,res) => {
     // récupère l'ID de l'inscription à supprimer depuis les paramètres de la requête
    const {id} = req.params;
    try {
      // supprime le cours correspondant à l'ID donné
      const deleted = await db('courses').where({id}).del();
      
      //si aucune inscription n est trouvée avec cet id, retourne une erreur 404 
      if (!deleted) {
        return res.status(404).json({message : 'Cours non trouvée'});
      }
      // si la suppresion a réussi, retourne une réponse vide avec un code 204 (no content)
      res.status(204).end();
    } catch (error) {
    // en cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
        res.status(500).json({ message: 'Erreur lors de la suppresion du cours', error: error.message });
    }
 });
// methode pour modifier cours (MARCHE)
app.put('/api/courses/:id', async (req,res) => {
  // récupère l'id du cours depuis les parameteres de la requete
  const { id } = req.params;
  // extraction des champs modifiés depuis le corps de la requête (req.body)
  const { title, description } = req.body;

  try {
    // met à jour le cours corresponsant à id donnée
    const updated = await db('courses').where({ id }).update({ title, description });
    //si aucune cours correspond à l id donnée, retourne une erreur 404.
    if (!updated) {
      return res.status(404).json({message : "Cours non trouvée"})
    }
    //récupère le cours avec son id et le met à jour
    const cours = await db('courses').where({ id }).first();
    res.json(cours);
  } catch (error) {
    res.status(500).json({ message : "Erreur lors de la mise à jour du cours", error : error.message});
  }
});

 // ajouter une ressource à un cours (A FAIRE EMMANUELLA)
app.post('/api/courses/:id/resources', async (req,res) => {
  
});


//3. Gestion des Inscriptions ------------------------------------------------------------------------------------------------
// inscription à un cours (étudiant connecté) (SA MARCHE)
app.post('/api/courses/:id/enroll', async (req, res) => {
  // récupérer l'id de l'étudiant depuis les cookies
  const etudiantId = req.cookies.id;

  // récupérer le cours ID depuis les paramètres de l'URL
  const coursId = req.params.id;

  // vérification si l'étudiant est connecté
  if (!etudiantId) {
    return res.status(403).json({ message: 'Etudiant non connecté.' });
  }

  try {
    // ajouter l'enregistrement dans la table 'enrollments' (seulement user_id et course_id)
    const [id] = await db('enrollments').insert({ course_id: coursId, user_id: etudiantId });

    // répondre que l'inscription a réussi
    res.status(200).json({
      message: 'Inscription réussie.',
      id,
      course_id: coursId,
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription au cours', error: error.message });
  }
});

  

// voir les inscriptions (admin)   SA MARCHE
app.get('/api/courses/enrollments', async (req, res) => {
  try {
    // Requête SQL pour récupérer les inscriptions avec les noms des utilisateurs et des cours
    const inscriptions = await db('enrollments')
      .join('users', 'enrollments.user_id', '=', 'users.id')
      .join('courses', 'enrollments.course_id', '=', 'courses.id')
      .select('enrollments.id','users.name as user_name','courses.title as course_title','enrollments.enrolled_at');

    if (inscriptions.length === 0) {
      return res.status(404).json({ message: 'Aucune inscription trouvée.' });
    }

    res.status(200).json(inscriptions);
  } catch (error) {
    console.error('Erreur complète :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions', error: error.message });
  }
});


// supprimer des inscriptions (admin)   SA MARCHE
app.delete('/api/courses/enrollments/:id', async (req,res) => {
  // Récupère l'ID de l'inscription à supprimer depuis les paramètres de la requête
  const {id} = req.params;
  try {
    // supprime le cours correspondant à l'ID donné
    const deleted = await db('enrollments').where({id}).del();
    
    //si aucune inscription n est trouvée avec cet id, retourne une erreur 404 
    if (!deleted) {
      return res.status(404).json({message : 'Cours non trouvée'});
    }
    // si la suppresion a réussi, retourne une réponse vide avec un code 204 (no content)
    res.status(204).end();
  } catch (error) {
  // En cas d'erreur, retourne une réponse avec un message d'erreur et un code 500
      res.status(500).json({ message: 'Erreur lors de la suppresion du cours', error: error.message });
  }
});


//4. Recherche et Pagination ---------------------------------------------------------------------------------------
// Obtenir la liste des cours
app.get('/api/courses', async (req, res) => { //(SA MARCHE)
  try {
    const { search } = req.query;
    let cours;

    if (search) {
      // Recherche dans les titres ou descriptions des cours
      cours = await db('courses')
        .where(function() {
          this.where('title', 'like', `%${search}%`)
              .orWhere('description', 'like', `%${search}%`);
        });
    } else {
      // Si aucun paramètre de recherche, on sélectionne tous les cours
      cours = await db('courses').select('*');
    }

    res.json(cours); // Envoie la liste des cours sous forme de JSON
  } catch (error) {
    // En cas d'erreur, retourne un message d'erreur et un code 500
    res.status(500).json({ message: 'Erreur lors de la récupération des cours.', error: error.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  //obtenir cours avec ses ressources
});


// Démarre le serveur et écoute les requêtes sur le port défini
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
  });


