// recuperer id de etudiant
function getEtudiantId() {
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

    if (userRole !== 'student') {
        console.error("Erreur : l'utilisateur n'est pas un étudiant.");
        return null;
    }

    if (!userId) {
        console.error("Erreur : ID utilisateur manquant.");
        return null;
    }

    return userId;
}
//ajouter l'inscription à un tableau --------------------------------------------------------------------------

//quand l etudiant s incrit, affice le cours auquel il cest inscrit
function ajouterEnrolls(enrolls){
    // Ajout d'une nouvelle ligne au tableau
let table = document.getElementById("listeInscrit");
let newRow = table.insertRow();
newRow.id = `row-${enrolls.id}`;

// Insertion des cellules avec les informations saisies
newRow.insertCell(0).textContent = enrolls.course_id;
newRow.insertCell(1).textContent = enrolls.user_id
;

}
// method post pour enregistrer une inscription 
function enregistrerEnrolls(enregistrement) {
    console.log(enregistrement.course_id);
    if (!enregistrement.course_id) {
      alert("ID du cours manquant.");
      return;
    }

    // user_id sera récupéré du cookie côté serveur
    fetch(`/api/courses/${enregistrement.course_id}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: enregistrement.course_id }), // On envoie seulement le course_id
      credentials: 'include',  // inclure les cookies avec la requête
    })
    .then(response => response.json()) // Récupérer directement la réponse en JSON
    .then(inscription => {
      console.log("Réponse du serveur :", inscription);
      if (inscription.id) {
        ajouterEnrolls(inscription); // Ajouter l'inscription si l'id est retourné
      } else {
        alert("L'inscription a échoué.");
      }
    })
    .catch(erreur => {
      console.log('Erreur lors de l\'inscription.', erreur); // Afficher l'erreur si quelque chose se passe mal
      alert("Une erreur est survenue lors de l'inscription.");
    });
}

  
  
// afficher les inscriptions
function chargerCoursInscrit(id) {  // Assurez-vous que l'ID du cours est passé en paramètre
    const table = document.getElementById("listeInscrit");
    table.innerHTML = '';  // Vider la table avant de la remplir avec les nouvelles données

    fetch(`/api/courses/${id}`)
    .then(response => response.json())
    .then(course => {
        // Vérifier si des ressources sont associées au cours
        if (course.resources && course.resources.length > 0) {
            course.resources.forEach(resource => {
                // Ajouter une ligne pour chaque ressource associée
                ajouterEnrolls(resource); 
            });
        } else {
            // Si aucune ressource n'est disponible
            table.innerHTML = 'Aucune ressource disponible pour ce cours.';
        }
    })
    .catch(error => {
        console.log('Erreur lors de la récupération des informations du cours :', error);
    });
}

chargerCoursInscrit();

// Pour afficher les cours à l'étudiant --------------------------------------------------------------------------------------------------
function ajouterCours(cours) {
    // Ajout d'une nouvelle ligne au tableau
    let table = document.getElementById("listeCours");
    let newRow = table.insertRow();
    newRow.id = `row-${cours.id}`;

    // insertion des cellules avec les informations saisies
    newRow.insertCell(0).textContent = cours.title;
    newRow.insertCell(1).textContent = cours.description;

    // Bouton inscrire
    let actionsCell = newRow.insertCell(2);

    let InscrireButton = document.createElement("button");
    InscrireButton.className = "button";
    InscrireButton.id = `inscrire-bttn-${cours.id}`; // un identifiant par cours
    InscrireButton.textContent = "S'inscrire";

    let enrolls = {}; 

    // quand l'étudiant clique sur le bouton, il est automatiquement inscrit au cours
    InscrireButton.onclick = function() {
        enrolls.course_id = cours.id;  // utilisation de l'ID du cours
        enrolls.user_id = getEtudiantId(); // récupération de l'ID utilisateur via la fonction

        if (!enrolls.user_id) {
            alert("Erreur : Impossible de récupérer l'ID de l'utilisateur.");
            return;
        }

        // Appeler la fonction pour enregistrer l'inscription
        enregistrerEnrolls(enrolls); 
        alert(`Vous êtes inscrit au cours : ${cours.title}`);
    };

    actionsCell.appendChild(InscrireButton);
}

// methode get pour chercher mot cle 
function chargerCours(search = '') {
    const url = search ? `/api/courses?search=${search}` : '/api/courses';
    fetch(url)
        .then(response => response.json())
        .then(courses => {
            const table = document.getElementById("listeCours");
            table.innerHTML = ''; // Réinitialise le tableau
            console.log("Je vais faire une boucle sur : ", courses);
            courses.forEach(course => {
                ajouterCours(course);
            });
        })
        .catch(error => console.log('Erreur lors de la récupération des cours :', error));
}
chargerCours();

document.getElementById("search").addEventListener("input",function(){
    const searchValue = this.value;
    chargerCours(searchValue)
})

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


// pagination
// Nombre de cours par page
const coursParPage = 5; // nombre de cours par page
let pageActuelle = 1; // page actuelle

// fonction pour afficher les cours sur la page avec pagination
function afficherPageCours(page, cours) {
    const table = document.getElementById("listeCours");
    table.innerHTML = ""; // réinitialiser la table

    // calculer les indices du début et de la fin pour la page actuelle
    const debut = (page - 1) * coursParPage;
    const fin = debut + coursParPage;

    // prendre les cours qui doivent être affichés sur cette page
    const coursDeLaPage = cours.slice(debut, fin);
    coursDeLaPage.forEach(cours => {
        ajouterCours(cours); // ajouter chaque cours à la table
    });

    mettreAJourPagination(page, cours.length); // mettre à jour les contrôles de pagination
}

// fonction pour mettre à jour les boutons de pagination
function mettreAJourPagination(page, totalCours) {
    const controlesPagination = document.getElementById("pagination");
    controlesPagination.innerHTML = ""; // réinitialiser les boutons de pagination

    const pagesTotales = Math.ceil(totalCours / coursParPage); // calculer le nombre total de pages

    // ajouter un bouton pour chaque page
    for (let i = 1; i <= pagesTotales; i++) {
        const bouton = document.createElement("button");
        bouton.textContent = i; // afficher le numéro de la page
        bouton.className = "button";
        if (i === page) {
            bouton.classList.add("is-primary"); // marquer la page active
        }
        bouton.addEventListener("click", () => {
            pageActuelle = i; // changer la page actuelle
            chargerCoursAvecPagination(); // recharger les cours pour la nouvelle page
        });
        controlesPagination.appendChild(bouton); // ajouter le bouton à la pagination
    }
}

// fonction pour charger les cours avec pagination en fonction de la recherche
function chargerCoursAvecPagination(search = '') {
    const url = termeRecherche ? `/api/courses?search=${search}` : '/api/courses'; // créer l'url avec ou sans recherche
    fetch(url)
        .then(response => response.json()) // convertir la réponse en format JSON
        .then(cours => {
            afficherPageCours(pageActuelle, cours); // afficher les cours pour la page actuelle
        })
        .catch(erreur => console.log('erreur lors de la récupération des cours :', erreur)); // gérer les erreurs
}

// fonction appelée lorsque la page est chargée
document.addEventListener("DOMContentLoaded", () => {
    chargerCoursAvecPagination(); // charger les cours dès le démarrage
});


    
// SEULEMENT POUR LA DÉCONNEXION (SA MARCHE)
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

