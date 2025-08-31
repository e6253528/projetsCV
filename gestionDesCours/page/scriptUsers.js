// creation utilisateur
// Variable pour stocker le rôle sélectionné
let roleChoisi = "";

// Récupérer les boutons HTML
const etudiantButton = document.getElementById("etudiant");
const adminButton = document.getElementById("admin");
const roleMessage = document.getElementById("role-message");

// Gérer le clic sur le bouton 'Étudiant'
etudiantButton.addEventListener("click", (event) => {
    event.preventDefault();
    Setrole("student");
});

// Gérer le clic sur le bouton 'Admin'
adminButton.addEventListener("click", (event) => {
    event.preventDefault();
    Setrole("admin");
});

// Fonction pour définir le rôle choisi et mettre à jour l'affichage
function Setrole(role) {
    roleChoisi = role;
    roleMessage.textContent = `Vous avez sélectionné le rôle: ${role === "student" ? "Étudiant" : "Admin"}`;
    roleMessage.className = "has-text-centered has-text-weight-bold";

    if (role === "student") {
        etudiantButton.classList.add("selected");
        adminButton.classList.remove("selected");
    } else {
        adminButton.classList.add("selected");
        etudiantButton.classList.remove("selected");
    }
}

// Fonction pour gérer l'enregistrement de l'utilisateur
document.getElementById("idInscription").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    // recuperation
    const user = {
        username : document.getElementById("username").value,
        email : document.getElementById("email").value,
        mdp : document.getElementById("password").value,
        role : roleChoisi
        
    }

    // Validation des champs
    if (!user.username || !user.email || !user.mdp) {
        alert("Veuillez remplir tous les champs.");
        return;
    }
    if (!user.role) {   
        alert("Veuillez sélectionner un rôle (Étudiant ou Admin).");
        return;
    }

    // Appeler la fonction pour enregistrer l'utilisateur
    enregisterUser(user);
});


function enregisterUser(user){
    fetch('/api/register', {
     method : 'POST',
     headers: {'Content-Type' : 'application/json'},
     body: JSON.stringify(user)
    })
    .then(response=>response.json())
    .then(inscriptionFromServeur =>{
    traiterInscription(inscriptionFromServeur)
    })
    .catch(error => console.log('Erreur lors de l enregistrement de l inscription :', error))
 }

function traiterInscription(inscription) {
    if (inscription.id) {
        alert("Inscription réussie !");
        window.location.href = 'login.html'; // Redirige vers la page de connexion
    } else {
        alert("Erreur lors de l'enregistrement de l'utilisateur.");
    }
}




