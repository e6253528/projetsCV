// recuperer id admin
function getAdminId() {
    const cookies = document.cookie.split(';');
    let userRole = '';
    let userId = '';

    cookies.forEach(cookie => {
        const [key, value] = cookie.split('=').map(str => str.trim());
        if (key === 'role') {
            userRole = decodeURIComponent(value);
        }
        if (key === 'id') {
            userId = decodeURIComponent(value);
        }
    });

    console.log('Role détecté:', userRole);
    console.log('ID détecté:', userId);

    if (userRole !== 'admin') {
        console.error("Erreur : l'utilisateur n'est pas un administrateur.");
        return null;
    }

    if (!userId) {
        console.error("Erreur : ID utilisateur manquant.");
        return null;
    }

    return userId;
}

// Fonction qui gère la soumission du formulaire
document.getElementById("idCreationCours").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire
  
    // Récupérer les données du formulaire
    const cours = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      id_admin : getAdminId()
    };
  
    // Validation des champs
    if (!cours.title || !cours.description) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    
    // Appeler la fonction pour enregistrer le cours
    enregistrerCours(cours); // Correction du nom de la fonction
  });
  
function ajouterCours(cours) {
    // Ajout d'une nouvelle ligne au tableau
let table = document.getElementById("listeCours");
let newRow = table.insertRow();
newRow.id = `row-${cours.id}`;

// Insertion des cellules avec les informations saisies
newRow.insertCell(0).textContent = cours.title;
newRow.insertCell(1).textContent = cours.description;

//pour déposer document ??
let deposerCell = newRow.insertCell(2);
let deposerbutton = document.createElement("button");

// boutton delete et modifier
let actionsCell = newRow.insertCell(3);

let modifierButton = document.createElement("button");
modifierButton.className = "button is-warning is-small";
modifierButton.textContent = "Modifier";
modifierButton.onclick = function() {
    ajouterChampDeTexte(cours.id);
};

let deleteButton = document.createElement("button");
deleteButton.className = "button is-danger is-small";
deleteButton.textContent = "Supprimer";

// Gestion de l'événement du bouton "Supprimer" via la fonction supprimer
deleteButton.onclick = function() {
    supprimer(cours.id);
};

actionsCell.appendChild(modifierButton);
actionsCell.appendChild(deleteButton);
deposerCell.appendChild(deposerbutton)

// Réinitialiser le formulaire
document.getElementById("idCreationCours").reset();
}

function ajouterChampDeTexte(id){
    const row = document.getElementById(`row-${id}`);
    const cells = row.querySelectorAll('td');
    
    //AJouter des champs de texte dans chaque cellule
    for(let i=0; i<cells.length - 1; i++){
        let cellValue = cells[i].textContent;
       cells[i].innerHTML = `<input type="text" class="input" value="${cellValue}">`;
    }
    //modiifier les boutons "modifier" et "supprimer" en Enregistrer
    let actionsCell = cells[3];
    actionsCell.innerHTML = '';
    let enregistrerButton = document.createElement("button");
    enregistrerButton.className = "button is-success is-small";
    enregistrerButton.textContent = "Enregistrer";
    enregistrerButton.onclick = function() {
       enregistrerModification(id);
    };
    actionsCell.appendChild(enregistrerButton);
}

// methode put pour enregistrer les modifications
function enregistrerModification(id){
    const row = document.getElementById(`row-${id}`);
    const inputs = row.querySelectorAll('input');

    const updateCours = {
        title:inputs[0].value,
        description:inputs[1].value
    }

    fetch( `/api/courses/${id}`, {
        method : 'PUT',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(updateCours)
       })
       .then(response=>response.json())
       .then(()=>{  
         chargerCours();
       })
       .catch(error => console.log('Erreur lors de la mise a jour de l\'inscription :', error))
}

// methode get pour les cours (SA MARCHE)
function chargerCours() {
    const table = document.getElementById("listeCours");
    table.innerHTML = ''; 
    fetch('/api/courses')
        .then(response => response.json())
        .then(courses => {
            courses.forEach(course => {
                ajouterCours(course);
            });
        })
        .catch(error => console.log('Erreur lors de la récupération des inscriptions :', error));
}
chargerCours()


// methode post pour enregistrer un cours
function enregistrerCours(cours) {
    // vérifier si l'id de l'administrateur existe
    if (!cours.id_admin) {
        alert("ID de l'administrateur manquant.");
        return;
    }

    // envoyer la requête pour créer un cours
    fetch('/api/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cours),  // envoyer le cours en format JSON
        credentials: 'include'  // inclure les cookies avec la requête
    })
    .then(response => response.json())  // on suppose que la réponse est en JSON
    .then(coursCree => {
        console.log("Réponse du serveur : ", coursCree);
        if (coursCree.id) {
            ajouterCours(coursCree);  // ajouter le cours si tout va bien
        } else {
            alert("Erreur lors de la création du cours, l'ID est manquant.");
        }
    })
    .catch(error => {
        console.log('Erreur lors de la création du cours :', error);
        alert("Une erreur est survenue lors de la création du cours.");
    });

    alert("Votre cours est créé.");
}


// methode delete pour supprimer un cours
function supprimer(id){
    fetch(`/api/courses/${id}`, {
        method: 'DELETE'
    })
    .then(()=>{
        // recharger la liste des cours apres suppression
        chargerCours();
    }).catch(error => console.log("Erreur lors de la suppresion du cours : ", error))
}

// methode get pour afficher les inscriptions des utilisateurs (GESTION DES INSCRIPTIONS) -----------------------------------------------
function ajouterEnrolls(enrolls) {
    // Ajout d'une nouvelle ligne au tableau
    let table = document.getElementById("listeUsers");
    let newRow = table.insertRow();
    newRow.id = `row-${enrolls.id}`;
  
    // Insertion des cellules avec les informations des inscriptions
    newRow.insertCell(0).textContent = enrolls.user_name; // Nom de l'utilisateur
    newRow.insertCell(1).textContent = enrolls.course_title; // Nom du cours
    newRow.insertCell(2).textContent = enrolls.enrolled_at; // Date d'inscription
  
    // Bouton supprimer
    let actionsCell = newRow.insertCell(3);
    let deleteButton = document.createElement("button");
    deleteButton.className = "button is-danger is-small";
    deleteButton.textContent = "Supprimer";
  
    // Gestion de l'événement du bouton "Supprimer"
    deleteButton.onclick = function() {
      supprimerEnrolls(enrolls.id);
      alert("L'étudiant est désincrit du cours.")
    };
  
    actionsCell.appendChild(deleteButton);
}
  
function chargerEnrolls() {
    const table = document.getElementById("listeUsers");
    table.innerHTML = ''; 
    
    fetch('/api/courses/enrollments')
    .then(response => response.json()) // On récupère directement la réponse en JSON
    .then(courses => {
        courses.forEach(course => {
            ajouterEnrolls(course); // Ajouter les inscriptions à la table
        });
    })
    .catch(error => {
        console.log('Erreur lors de la récupération des inscriptions :', error); // Afficher l'erreur si quelque chose se passe mal
    });
}

chargerEnrolls(); // Appeler la fonction pour charger les inscriptions


function supprimerEnrolls(id){ // supprimer un étudiant d'un cours
    fetch(`/api/courses/enrollments/${id}`, {
        method: 'DELETE'
    })
    .then(()=>{
        // recharger la liste des cours apres suppression
        chargerEnrolls();
    }).catch(error => console.log("Erreur lors de la suppresion du cours : ", error))

};

// changer de section sur les pages ----------------------------------------------------------------------
// dans la page etudiant, lorsqu'il veut voir les cours inscrits, ca cache le contenu de "consulter cours"
document.addEventListener("DOMContentLoaded", () => {
    // sélection des éléments nécessaires
    const liens = document.querySelectorAll(".main-nav a");
    const sections = document.querySelectorAll("section");

    // fonction pour masquer toutes les sections
    const masquerToutesLesSections = () => {
        sections.forEach((section) => {
            section.classList.add("hidden");
        });
    };

    // fonction pour désactiver tous les liens
    const desactiverTousLesLiens = () => {
        liens.forEach((lien) => {
            lien.classList.remove("active");
        });
    };

    // gestion du clic sur les liens
    liens.forEach((lien) => {
        lien.addEventListener("click", (evenement) => {
            evenement.preventDefault();

            // masquer toutes les sections et désactiver les liens
            masquerToutesLesSections();
            desactiverTousLesLiens();

            // activer le lien cliqué
            lien.classList.add("active");

            // afficher la section associée
            const idSection = lien.getAttribute("data-section");
            const sectionCible = document.getElementById(idSection);

            if (sectionCible) {
                sectionCible.classList.remove("hidden");
            }
        });
    });

    // afficher la première section par défaut
    const idSectionParDefaut = document.querySelector(".main-nav a.active").getAttribute("data-section");
    document.getElementById(idSectionParDefaut).classList.remove("hidden");
});
    
    
// SEULEMENT POUR LA DÉCONNEXION (SA MARCHE) --------------------------------------------------------------
// apres la  deconnexion, localise user à la page login 
function deconnecterUser() {
    fetch('/api/logout', {
        method:'POST',
        headers:{ 
            'Content-Type': 'application/json',
        },
    })
    .then(reponse=>reponse.json())
    .then(data => {
        console.log(data.message)
        window.location.href = 'login.html'
    })
    .catch(error=> {
        console.log("Erreur lors de la déconnexion :", error)
    })
};
// pour que le loug out soit effectif, ajout d'un ecouteur pour que quand l'utilisateur se deconnecte, il est ramener a la page login
document.getElementById("bouttonLogOut").addEventListener("click", function(event){
    event.preventDefault();
    deconnecterUser();
});