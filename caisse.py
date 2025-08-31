nom = input("Quel est le prénom du caissier(ère) : ")
prenom = input("Quel est le nom du caissier(ère) : ")
print(f"Bonjour {nom} {prenom}, bon courage en cette journée de travail ! ")
print("")

def afficher_menu():
    print(" LE MENU DISPONIBLE À VOTRE CAISSE EST LE SUIVANT : ")
    print(" 1- Ajouter un article non-taxable\n 2- Ajouter un article taxable\n 3- Supprimer un article de la liste d'achats\n 4- Générer le reçu et quitter")

liste_achat = []  # Prédefinir une liste pour l'ensemble des achats
article_LA = []  #Prédefinir une liste pour les articles dans la LA (liste achat)

while True:  # Condition : tant que l'utilisateur continura à ajouter des articles ou les supprimer, le menu s'affichera..
    afficher_menu()
    choix = int(input("Quel est votre choix? : "))

    while choix < 1 or choix > 4:
        #Si valeur entrée ne fait pas partie des choix, le programme va lui redemander de saisir une valeur.
        choix = int(input(" La valeur saisie n'est pas valide, réessayer : "))

    if choix == 1:
        def article_nontaxable(article="Veuillez entrer le nom de votre article: ", prix_unitaire="Veuillez entrer le prix unitaire de l'article:", quantité="Veuillez entrez la quantité d'article:"):
            a = input(article)
            p = float(input(prix_unitaire))
            q = int(input(quantité))
            prix_total = p * q

            article_LA = [a, p, q, prix_total]   #Mettre l'Article dans la liste
            liste_achat.append(article_LA)       #Ajout de la liste dans une autre liste de liste d'achat.
            return a, p, q, prix_total
        b = article_nontaxable()
        print(b)

    elif choix == 2:
        tps = 0.05  # Le taux de taxe TPS.
        tvq = 0.09975  # Le taux de taxe TVQ.

        def article_taxable(article="Veuillez entrer le nom de votre article: ",prix_unitaire="Veuillez entrer le prix unitaire de l'article:",quantité="Veuillez entrez la quantité d'article:"):
            a = input(article)
            p = float(input(prix_unitaire))
            q = int(input(quantité))

            prix_avantTaux = p * q
            montant_TPS = prix_avantTaux * tps
            montant_TVQ = prix_avantTaux * tvq
            prix_total = prix_avantTaux + montant_TPS + montant_TVQ

            article_LA = [a, p, q, prix_total]  # Mettre l'article dans la liste.
            liste_achat.append(article_LA)  # Ajout de la liste dans une autre liste de liste d'achat.
            return a, p, q, prix_total

        b = article_taxable()
        print(b)

    elif choix == 3:
        def supprimer_article():
            chx_supprimer = input("Quel article voulez-vous supprimer? : ")
            for article_LA in liste_achat:
                if article_LA[0] == chx_supprimer:
                    liste_achat.remove(article_LA)
                    print(f"L'article {chx_supprimer} a été enlevé de votre liste d'achat.")
                else:
                    print(f"L'article est introuvable.")

        supprimer_article()

    elif choix == 4:
        def generer_recu():
            print("Votre reçu :")
            print("############")
            print("Article              PU        Qte         Tot.") #Espace
            somme = 0
            for article_LA in liste_achat:
                a, p, q, prix_total = article_LA
                somme += prix_total
                print(f"{a}{' ' * (20 - len(a))} {p}{' ' * (10 - len(str(p)))} {q}{' ' * (10 - len(str(q)))} {prix_total}{' ' * (10 - len(str(prix_total)))}")
                #{' ' * (20 - len(a))} -> J'ai créée un chaine de constitué d'un certain nb d'espaces. Puis après je l'ai soustrait de la variable pour que l'affichage soit aligné.
            print("---------------------------------------------------")
            print(f"Montant à payer : ---> {somme}")


        generer_recu()
        break  #Sortir de la boucle et terminer le programme
