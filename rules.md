## Le terrain de jeux se compose d'un board de 64 case, chaque case a une certaine valeur en points. 
## Les cases les plus proches du centre ont moin de points.
![alt text](./rules-img/empty.png "Title")
#
#
#
#

## 12 pieces bleu vous sont distribuées aleatoirement.
## La piece verte ne vous appartiens pas.
## Votre adversaire recoit lui aussi 12 pieces mais vous ne les voyez pas.
## Chaque piece ajoute à votre total de points le nombre indiqué sur sa case.
## Ici le total de vos points est de 66
![alt text](./rules-img/1.png "Title")

#
#
#
#
# Deroulement des tours : 
## Quand c'est à votre tour de jouer, vous avez deux choix : 
## - Soit vous decidez de prendre la piece verte, elle se transforme donc en bleu
## - Soit vous decidez de transformer une case aleatoire vide en piece bleu.
![alt text](./rules-img/pick.png "Title")

# 
# 
#
## Ici la piece verte ne nous interesse pas, nous decidons de choisir "PIECE ALEATOIRE"
## Votre nouvelle piece apparait avec un fond bleu.
## La piece precedement verte deviens noir.
## C'est encore à vous de jouer, maintenant il faut que vous cliquez sur une piece bleu  pour vous en debarasser
## Ici nous choisissons la piece à 11 points en haut à droite.
![alt text](./rules-img/picked.png "Title")

#
#
#
#
## La piece que nous avons jeté deviens verte, votre adversaire la voit verte egalement.
## C'est maintenant au tour de l'adversaire de jouer. 
## Comme pour votre tour, il a le choix entre prendre la piece verte (11) ou une piece aleatoire.
## Ici il decide de prendre la piece verte.
![alt text](./rules-img/disckard.png "Title")

#
#
#
#
## Vous connaissez le choix de l'adversaire, si il a choisi la piece verte, alors vous la voyez maintenant en rouge et vous savez que l'adversaire possede cette piece.
## Si il avait choisi une piece aleatoire, alors la piece verte serais devenue noir.
## C'est encore au tour de l'adversaire de jouer, il decide de jeter sa piece à 3 points.
![alt text](./rules-img/op_took.png "Title")


#
#
#
#
## c'est de nouveau à vous de jouer, et la case verte qui vous est proposé est donc celle jeté par l'adversaire.
![alt text](./rules-img/op-dis.png "Title")


#
#
#
#
# Alignements
## Quand 3 pieces ou plus sont alignées, elles ne comptent plus dans votre total de points.
## Vous devez donc chercher à en aligner le plus possible
![alt text](./rules-img/align.png "Title")

#
#
#
#
# Fin du round. 
## Il existe deux moyen de finir un round. 
## - Soit vous parvenez à aligner toute vos pieces et votre total de points est donc de 0, vous gagnez le round avec un "FULL" 
## - Soit, apres avoir choisi la piece verte ou aleatoire, votre nombre de points est inferieur ou egal à 30 et vous decidez de "knocker" pour mettre fin au round. 

#
#
#
#
# Vainqueur et calcul des gains.

## - Si vous rentrez un FULL, vous gagnez 30 gold + le nombre de point restant de l'adversaire.
### Exemple : vous rentrez le FULL et l'adversaire à encore 15 points sur le board, vous gagnez 45 gold
#
## - Si vous knockez et l'adversaire à plus de point que vous, vous gagnez la difference entre vos points.
### Exemple : vous knockez avec 20 points et votre adversaire à encore 40 points, vous gagnez 20 gold.
#
## - Si vous knockez et l'adversaire a autant ou moins de points que vous, l'adversaire gagne 30 gold + la difference entre vos points.
### exemple : vous knockez avec 30 points, l'adversaire en a 20, il gagne 40 gold.

#

# Le premier joueur à avoir 0 gold ou moins a la fin d'un round perd la partie.

#
#
#
#
# Pouvoirs speciaux 
## Pour epicer les partie, avant chaque round, vous choisissez 3 pouvoirs qui changerons certaine regles.
## Chaque pouvoir vous coute un prix en gold.
![alt text](./rules-img/power2.png "Title")

