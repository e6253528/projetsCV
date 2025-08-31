// connexion utilisateur
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

function ajouterCookie(user) {
    // Enregistrer le nom d'utilisateur, le rôle et le mot de passe dans les cookies
    document.cookie = `name=${encodeURIComponent(user.name)}; path=/;`;
    document.cookie = `role=${encodeURIComponent(user.role)}; path=/;`;
    document.cookie = `password=${encodeURIComponent(user.password)}; path=/;`;
    document.cookie = `id=${encodeURIComponent(user.id)}; path=/;`;

    alert("Données cookies sauvegardées....");
}

//methode post
function connecterUser(user) {
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(login => {
        if (login.id && (login.role === 'admin' || login.role === 'student')) {
            ajouterCookie(login);
            alert("Connexion réussie !");
            window.location.href = login.role === 'admin' ? 'pageAdmin.html' : 'pageEtudiant.html';
        } else {
            alert("Erreur : rôle ou ID utilisateur non valide.");
        }
    })
    .catch(error => console.log('Erreur lors de la connexion:', error));
}
// Fonction pour gérer l'enregistrement de l'utilisateur
document.getElementById("idLogin").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    // recuperation
    const user = {
        name: document.getElementById("name").value,
        password : document.getElementById("password").value,
        role : roleChoisi
        
    }

    console.log('Données envoyées pour la connexion:', user);

    // Validation des champs
    if (!user.name || !user.password) {
        alert("Veuillez remplir tous les champs.");
        return;
    }
    if (!user.role) {
        alert("Veuillez sélectionner un rôle (Étudiant ou Admin).");
        return;
    }

    // Appeler la fonction pour enregistrer l'utilisateur
    connecterUser(user);
});

function getCookieValue(cookieName) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    return null; // Return null if the cookie is not found
}
