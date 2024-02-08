[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=13553813&assignment_repo_type=AssignmentRepo)
# L3M 2023-2024 : TP Reversi (Othello) en Angular / signaux

Vous allez implémenter [le jeu de Reversi (Othello)](https://www.ffothello.org/othello/regles-du-jeu/) en Angular. Vous allez utiliser les signaux pour communiquer entre composants et services.

Vous pouvez touver ici le résultat attendu, étape par étape :
[https://alexdmr.github.io/l3m-2023-2024-angular-reversi/](https://alexdmr.github.io/l3m-2023-2024-angular-reversi/)

## Configuration de votre github

Nous allons configurer votre github pour lui faire générer le site correspondant à votre projet.
Pour cela, nous nous appuierons sur les github pages et les github actions. 
A chaque fois que vous pousserez une nouvelle version de votre code sur le dépôt, il sera compilé via une github action et le résultat de la compilation sera mis en ligne sur github pages.

Rendez-vous à l'adresse de votre dépôt github, puis cliquez sur le bouton `Settings` en haut à droite.
Dans le menu à gauche, cliquez sur `Pages`, puis configurer comme suit :

* Source : `Deploy from a branch`
* Branch : `gh-pages`  /  `root`
* Puis cliquez sur `Save`

## Configuration du fichier package.json

Modifier le script associé à la commande `build`, remplacez `l3m-2023-2024-angular-reversi` par le nom de votre dépôt (devrait être de la forme `l3m-2023-2024-angular-reversi-GITHUBID` avec `GITHUBID` votre identifiant github).

Cette configuration est nécessaire pour que l'application puisse fonctionner une fois déployer sur votre github pages.

## Installation des dépendance

Utiliser le scrit de clean install (ci) :

```bash
npm ci
```

## Les données dont vous disposez

Le répertoire `src/app/data` contient les fichiers suivants :

* `utils.ts` : Contient des définitions de types utilitaire (Matrice, Vecteur, etc.). Les plus curieux peuvent aller voir le code et comment on peut faire pour définir des types très contraints, mais ce n'est pas nécessaire pour le TP. Cela peut servir d'illustration pour le bloc de cours ***"Typescript avancé"*** qui aborde justement la question de la construction de type.
* `reversi.definitions.ts` : Contient les définitions des structures de données qui représentent le jeu de Reversi. Le code est commenté.
* `reversi.game.ts` : Contient les fonctions qui permettent de manipuler les structures de données du jeu de Reversi. Le code est commenté, lisez bien ce qu'est la constante `initialGameState` et ce que sont les fonctions `PionsTakenIfPlayAt`, `whereCanPlay` et `tryPlay`.

## Étape 1

### Création du service de jeu

Vous allez créer votre premier service Angular. Nous l'utiliserons pour gérer une partie courante de Reversi.

```bash
npx ng generate service reversi
```

Par défaut, ce service sera fourni par le module racine de l'application (voir le décorateur @Injectable). Vous pouvez donc l'injecter dans n'importe quel composant de l'application.

Modifiez la classe de ce service pour qu'elle implémente l'interface `ReversiModelInterface` spécifiée dans `src/app/data/reversi.definitions.ts`.

* Définissez un signal privé readonly publiant des GameState, initialisé le avec `initialGameState` (voir `src/app/data/reversi.game.ts`). Ce signal accessible en écriture doit bien rester privé. C'est la responsabilité du service de publier de nouveaux états de jeu.
* Dérivé en directement un signal public readonly qui se contente de publier les états de jeu publiés par le signal privé. Ce signal public est accessible en lecture seule. C'est la responsabilité des composants de s'abonner à ce signal pour être informés des changements d'état de jeu.
* Implémentez les méthodes `play` et `restart` de l'interface `ReversiModelInterface`.

### Un premier affichage

Modifiez le composant racine pour afficher le plateau de jeu dans une balise `<pre>`, vous utiliserez pour cela la fonction `BoardtoString`

## Étape 2

Ajoutez dans la vue l'information du joueur courant (voir [l'étape 2 de la correction](https://alexdmr.github.io/l3m-2023-2024-angular-reversi/)) au format `X: Player1` ou `O: Player2`.

Ajoutez un champs de saisie pour permettre au joueur de saisir une position de jeu sous la forme d'une string `ligne, colonne` :

* Complétez le template ci-dessous. L'événement submit sera levé lorsque l'utilisateur appuiera sur la touche ENTRER dans le champs de saisie input. Utilisez la propriété ngModel pour lier le champs de saisie à une propriété de votre composant.

    ```html
    <form (submit)="...">
        <input name="strCoord"/>
    </form>
    ```

* Utilisez la méthode split des string pour séparer la ligne et la colonne saisie par l'utilisateur. Utiliser la fonction parseInt pour convertir les string en nombre. Attention, vous obtiendrez des `number`, pensez à vérifier qu'ils sont aussi des `IntRange<0, 8>` et si c'est le cas, utilisez la méthode `play` du service pour jouer le coup.

  * Vérifier que ce sont des entier avec la fonction `Number.isInteger`, vérifiez aussi les bornes.
  * Affirmez au compilateur Typescript qu'il a bien affaire à des `IntRange<0, 8>` en utilisant un assertion de type :

    ```typescript
    line as IntRange<0, 8>
    // ou
    [line, column] as TileCoords
    ```

## Étape 3

On passe aux choses sérieuses. Vous n'êtes pas obligé de respecter exactement la mise en page de la correction, mais vous devez respecter les fonctionnalités.

### Définition d'un état du composant

Dans votre composant, ajoutez l'interface GameStateAll :

```typescript
export interface GameStateAll {
  readonly gameState: GameState;
  readonly listPlayable: readonly TileCoords[];
  readonly isPlayable: Matrix<boolean, 8, 8>;
  readonly scores: Readonly<{ Player1: number, Player2: number }>;
  readonly boardString: string;
  readonly winner: undefined | "Drawn" | Turn;
}
```

Dérivez le signal du service pour produire un signal de GameStateAll.

* Vous pouvez vous appuyer sur les fonctions `whereCanPlay` et BoardtoString du fichier `src/app/data/reversi.game.ts`.
* Un gagnant peut être désigné à partir du moment où aucun coup n'est plus possible, on compte alors les pions pour désigner un vainqueur ou le match nul (`Drawn`).
* Production de la matrice `isPlayable`. Vous avez deux solutions :
  * Utilisez la fonction `initMatrix` du fichier `src/app/data/utils.ts` pour créer une matrice de 8x8 de `false`.
  * Cette matrice étant immuable, vous allez utiliser la fonction `produce` de la bibliothèque `immerJS`. Cette fonction permet de produire une nouvelle matrice à partir d'une matrice existante et d'une fonction qui s'applique sur une version mutable de la matrice passée en paramètre. Modifiez cette version mutable pour indiquer les cases jouables (valeur `true`). La fonction produce renvoie une nouvelle matrice immuable, dérivée de celle passée en paramètre, à laquelle les modification ont été appliquées.

    ```typescript
    const isPlayable = produce( matrice8x8deFalse, mutableMatrice => {
        // Exemple
        mutableMatrice[2][1] = true;

        // Vous devrez utiliser la fonction whereCanPlay pour savoir quelles cases de la matrice doivent être marquées comme true (jouables)
    });
    ```

* Afficher le `GameStateAll` dans une balise `pre`, formatter avec le pipe `json`. En supposant que le signal soit `gs`, alors `<pre>{{ gs() | json }}</pre>`.

### Affichage du plateau de jeu

Commencez par ajouter le code SCSS suivant dans le fichier `app.component.scss` :

```scss
$W: 25px;
$borderW: 20px;
$divW: calc(0.8 * $W );
$colorP1: #333;
$colorP2: #ccc;
$t: .75s;

:host {

    section.info {
        display: flex;
        flex-flow: row;
        margin-top: .5em;

        .token {
            margin-left: .25em;
            margin-right: .25em;
        }
    }

    div.token {
        width: $divW;
        height: $divW;
        border-radius: 50%;
        border: solid black 1px;

        &.Player1 {
            background-color: $colorP1;
        }
        &.Player2 {
            background-color: $colorP2;
        }
    }

    table.reversi {
        border-collapse: collapse;
        border: solid black 2px;
        background: green;

        &.Player1 {
            td.place.playable > div.Empty {
                background-color: $colorP1;
            }
        }

        &.Player2 {
            td.place.playable > div.Empty {
                background-color: $colorP2;
            }
        }

        td {
            text-align: center;
            vertical-align: middle;
            width: $borderW;
            height: $borderW;
            background-color: burlywood;
            perspective: 800px;

            &.place {
                border: 1px solid black;
                width: $W;
                height: $W;
                background-color: inherit;
                cursor: pointer;

                &.playable {
                    > div.Empty {
                        border: none; // solid black 1px;
                        background-color: lightblue;
                        width:  calc($divW / 3);
                        height: calc($divW / 3);
                        transition: none;
                        transform: rotateY(0deg);
                        display: block;
                    }
                }

                > div {
                    width: $divW;
                    height: $divW;
                    border-radius: 50%;
                    border: solid black 1px;
                    margin: auto;
                    transition: background-color $t, transform $t;
                    display: none;

                    &.Empty {
                        border: none;
                        background-color: none;
                        transform: rotateY(90deg);
                    }

                    &.Player1 {
                        background-color: $colorP1;
                        transform: rotateY(0deg);
                        display: block;
                    }

                    &.Player2 {
                        background-color: $colorP2;
                        transform: rotateY(180deg);
                        display: block;
                    }

                }
            }
        }
    }
}
```

Implémenter le plateau de jeu avec un tableau HTML (balises `table`, `tr`, `td`).

* Ajoutez à la balise table la classe CSS `reversi`.
* Ajouter à la balise table la classe CSS `Player1` ou `Player2` en fonction du joueur courant.
* Ajoutez aux balises td du plateau de jeu la classe CSS `place`.
* Ajoutez aux balises td du plateau de jeu la classe CSS `playable` si et seulement si la case est jouable.
* Abonnez-vous à l'événement `click` sur les balises td du plateau de jeu pour jouer sur la case correspondante.
* Ajoutez une balise `div` ayant la classe CSS correspondant au contenu de la case (Player1, Player2 ou Empty).

Implémentez le tour de jeu et le score en complétant le template ci-dessous :

```html
<section class="info">
    Au tour de <div class="token"></div>
</section>
<section class="info"> 
    Scores : 
</section>
<button (click)="...">
    Recommencer
</button>
```

* Ajoutez la classe CSS `Player1` ou `Player2` à la balise `div` ayant la classe CSS `token` en fonction du joueur courant.
* Ajoutez des balises `div` avec classe CSS `token` pour représenter les scores des joueurs.

### Vérifier les animations

Vérifiez que les animations fonctionnent bien en cliquant sur les cases jouables.
