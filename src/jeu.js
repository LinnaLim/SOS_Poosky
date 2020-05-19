/**
* Programmation d'animation - III
* TP1 - Jeu puzzle
* @author Linna Lim
* @version 2017-04-02
*/

(function () {  // IIFE
    "use strict";

    //Variable pour référencer le jeu
    var leJeu;
    
    //Constantes et variables du jeu
    var TAILLE_TUILE = 64; //La taille des tuiles ("tileSet") du jeu
	var NOM_LOCAL_STORAGE = "scoreHeros"; //Sauvegarde et enregistrement du meilleur score 
	
	//Variables pour le jeu
    var score; // Le score du jeu
    var tempsEcoule; // Le score du jeu
    var texteFin; // Texte de fin du jeu
    var imageFin; // Image de la findu jeu
    var meilleurScore; //Meilleur score antérieur enregistré

    //On créera le jeu quand la page HTML sera chargée
    window.addEventListener("load", function () {
        leJeu= new Phaser.Game(960, 640);

        //Ajout des états du jeu, et sélection de l'état au démarrage
        leJeu.state.add("Demarrage", Demarrage);
        leJeu.state.add("ChargementMedias", ChargementMedias);
        leJeu.state.add("IntroJeu", IntroJeu);
        leJeu.state.add("Jeu", Jeu);
        leJeu.state.add("FinJeu", FinJeu);
		
		//Vérification d'un meilleur score antérieur enregistré
        meilleurScore = localStorage.getItem(NOM_LOCAL_STORAGE) == null ? 0 : localStorage.getItem(NOM_LOCAL_STORAGE);

        //Définir l'écran (state) au démarrage
        leJeu.state.start("Demarrage");

    }, false);
    
    
	////////////////////////////////
    //      Demarrage             //
    ////////////////////////////////

    /**
    * Classe permettant de définir l'écran (state)
    * pour les ajustements au démarrage du jeu
    */
	var Demarrage = function(){};
    Demarrage.prototype = {
        
        /**
        * function permettant d'initialiser les variables
        * pour le demarrage
        */
        init : function() {
            leJeu.scale.pageAlignHorizontally = true;
            leJeu.scale.pageAlignVertically = true;
            leJeu.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        },
		
        /**
        * function permettant de charger les médias
        * pour le demarrage
        */
		preload : function () {
            //Chargement des images pour la barre de chargement
			//URL commun à toutes les images
			leJeu.load.path = "medias/img/";
            
            leJeu.load.image("barreImg", "barreChargement.png");
            leJeu.load.image("limiteImg", "barreLimite.png");
        }, 
        
        /**
        * function permettant de passer au Chargement des médias
        */
        create: function () {
			//Quand les ajustements sont faits - on charge les médias
            leJeu.state.start("ChargementMedias");
        }       
    };


    ////////////////////////////////
    //      ChargementMedias      //
    ////////////////////////////////

    /**
    * Classe permettant de définir l'écran (state)
    * pour le chargement des médias
    */

    var ChargementMedias = function(){};
    ChargementMedias.prototype = {
       
        /**
        * function permettant d'initialiser les variables
        * pour le chargement des médias
        */
        init : function (){
			//Créer et afficher le texte
			this.pourcentTxt = leJeu.add.text(leJeu.width/2, leJeu.height/2, "0 %", {font: "bold 64px Arial",fill: "#FE9102",align: "center"});
			this.pourcentTxt.anchor.set(0.5, -1);        
		},
        
        /**
        * function permettant de charger les médias
        * pour le chargement des médias
        */
        preload : function(){
            //Chargement des images
			
			//URL commun à toutes les images
			leJeu.load.path = "medias/img/";
			
			//Chargement des images pour les écrans d'intro et de fin du jeu
            leJeu.load.image("introImg", "intro.png", 960, 640);
            leJeu.load.spritesheet("jouerBtn", "bouton-jouer.png", 245, 72);
            leJeu.load.spritesheet("instructionBtn", "bouton-instruction.png", 468, 72);
            leJeu.load.image("instructionImg", "instruction.png", 960, 640);
            leJeu.load.image("finBonneImg", "finBonne.png", 960, 640);
            leJeu.load.image("finMauvaiseImg", "finMauvaise.png", 960, 640);
			
            //Chargement des feuilles de sprites pour les éléments du jeu
            leJeu.load.spritesheet("herosImg", "sprite_heros.png", 64, 64);
            leJeu.load.spritesheet("amiImg", "sprite_ami.png", 64, 64);
            leJeu.load.spritesheet("cleImg", "sprite_cle.png", 64, 64);
            leJeu.load.spritesheet("ennemiImg", "sprite_ennemi.png", 64, 64);
			
			//Chargement des données de la carte du jeu (TileMap) et des tuiles (TileSet)
            leJeu.load.tilemap("carteJeu", "carteJeu.json", null, Phaser.Tilemap.TILED_JSON);
            leJeu.load.image("tuiles_64", "tuiles_64.png"); 

            //Chargement des sons du jeu
			leJeu.load.path = "medias/sons/";
            leJeu.load.audio("sonIntro", ["musique-intro.wav"]);
            leJeu.load.audio("sonJeu", ["musique-atmosphere.wav"]);
            leJeu.load.audio("sonMenu", ["son-menu.wav"]);
            leJeu.load.audio("sonCle", ["son-cle.wav"]);
            leJeu.load.audio("sonFinGagner", ["son-gagne.wav"]);
            leJeu.load.audio("sonFinPerdu", ["son-perdu.wav"]);

            //Afficher les images de la barre de chargement
			var barreLimite = leJeu.add.sprite(0, leJeu.height/2, "limiteImg");
            barreLimite.anchor.set(0,0.5);
            barreLimite.x = (leJeu.width - barreLimite.width)/2;
			
			var barreChargement = leJeu.add.sprite(0, leJeu.height/2, "barreImg");
            barreChargement.anchor.set(0,0.5);
            barreChargement.x = (leJeu.width - barreChargement.width)/2;
            
            leJeu.load.setPreloadSprite(barreChargement);
			
			//Afficher le pourcentage chargé après le chargement de chaque média
    		leJeu.load.onFileComplete.add(this.afficherPourcentage, this);

        },
        
        /**
		* Pour afficher le pourcentage de téléchargement des médias
		* @param {Integer} progression Chiffre compris entre 1 et 100 (inclusivement) et représente le    pourcentage du chargement réalisé.
		*/		
		afficherPourcentage: function(progression){
            this.pourcentTxt.text = progression + " %"
	
		},
        
        /**
        * function permettant de passer au Chanrgement des médias
        */
        create: function(){
            //Quand le chargement des actifs est complété - on affiche l'écran du jeu
            leJeu.state.start("IntroJeu");
        }
    }; // Fin ChargementMedias.prototype
    
    
    
    ////////////////////////////////
    //          IntroJeu          //
    ////////////////////////////////

    /**
     * Classe permettant de définir l'écran (state)
     * pour la scène d'intro du jeu
     */
    
    var IntroJeu = function (){};

    IntroJeu.prototype = {
        /**
        * function permettant de créer (texte, bouton, etc.)
        */
        create: function(){
            //Image d'into
            leJeu.add.image(0,0, "introImg");
            
            //Bouton
            var boutonJouer= leJeu.add.button(-leJeu.width, leJeu.height/2, "jouerBtn",this.allerEcranJeu, this,1,0,2,0);
            boutonJouer.anchor.set(0.5);
            
            var boutonInstruction= leJeu.add.button(-leJeu.width*3, (leJeu.height/2) + boutonJouer.height, "instructionBtn",this.allerEcranInstruction, this,1,0,2,0);
            boutonJouer.anchor.set(0.5);
            
            //Animation
            var animBtnJouer = leJeu.add.tween(boutonJouer).to({x:leJeu.width/4}, 1000, Phaser.Easing.Linear.None, true, 0, 0, false);
            
            var animBtnInstruction = leJeu.add.tween(boutonInstruction).to({x:leJeu.width/8}, 1500, Phaser.Easing.Linear.None, true, 0, 0, false);
            
            //Son d'intro
            this.sonIntro = leJeu.add.audio("sonIntro",1).play();
        },
        
        /**
        * function permettant d'accéder à l'écran de jeu
        */
        allerEcranJeu: function(){
            //Arrêter la musique d'intro
            this.sonIntro.stop();
            //Son de Menu
            leJeu.add.audio("sonMenu",1).play();
            
            leJeu.state.start("Jeu");  //Démarrer l'écran du jeu
        },
        
        /**
        * function permettant d'accéder à l'écran des instruction
        */
        allerEcranInstruction: function(){
            //Son de Menu
            leJeu.add.audio("sonMenu",1).play();
            leJeu.add.image(0,0, "instructionImg");
            
            //Bouton pour jouer au jeu
            var boutonJouer= leJeu.add.button(leJeu.width-10, leJeu.height-20, "jouerBtn",this.allerEcranJeu, this,1,0,2,0);
            boutonJouer.anchor.set(1);
        }

    }; // Fin IntroJeu.prototype


    ////////////////////////////////
    //          EcranJeu         //
    ////////////////////////////////

    /**
    * Classe permettant de définir l'écran (state)
    * pour la scène du jeu...
    */

    var Jeu = function (){
        //Le personnage du heros
        this.heros = null;
        
        //L'ami du heros
        this.ami = null;
        
        //La clé pour la cage de l'ami
        this.laCle = null;

        //La vitesse du heros
        this.vitesseHeros = 150;

        //Le groupe physique pour les fantômes
        this.lesFantomes = null;
        
        //La carte et les couches du jeu
        this.laCarteDuJeu = null;
        this.lesCouches = null;
              
        //Les touches fléchées du clavier
        this.lesFleches = null;
        
        //Le texte pour afficher le score du jeu
        this.scoreTxt = null;
        
        //Le texte pour afficher le temps écoulé du jeu
        this.tempsTxt = null;
        
        this.tempsEcoule; // Temps ecoulé pour le jeu
    };

    Jeu.prototype = {
		/**
        * function permettant d'initialiser les variables
        * pour le jeu
        */
		init:function(){
            //Initialiser les variables
            score = 500;
            texteFin = "";
            imageFin = "";
            tempsEcoule = 0;
        }, 
		
        /**
        * function permettant de créer (texte, bouton, etc.)
        */
        create: function(){
            //Ajout de la physique pour l'ensemble du jeu
            leJeu.physics.startSystem(Phaser.Physics.ARCADE);
            
            //Son de Menu
            leJeu.add.audio("sonJeu",1).play();
            
            //Créer la carte du jeu
            this.creerCarteJeu();

            //Créer les personnages du jeu et leurs animations
            this.creerPersonnages();
            
            //Créer les objets du jeu et leurs animations
            this.creerObjets();

            //Gestion des flèches du clavier
            this.lesFleches = leJeu.input.keyboard.createCursorKeys();
            
            //Placer les textes du score et du temps
            var leStyle = {font: "32px monospace", fill: "#ffffff", align: "center"};
            
            this.scoreTxt = leJeu.add.text(leJeu.width - 10, 10, "Score: " + score, leStyle);
            this.scoreTxt.anchor.set(1, 0);
            this.tempsTxt = leJeu.add.text(10, leJeu.height - 5, "Temps écoulé: " + tempsEcoule, leStyle);
			this.tempsTxt.anchor.set(0, 1);
            
			//Partir la minuterie pour le temps et le score du jeu
            this.minuterieTemps = leJeu.time.events.loop(Phaser.Timer.SECOND, this.augmenterTemps, this);
            this.minuterieScore = leJeu.time.events.loop(Phaser.Timer.HALF, this.diminuerScore, this);
                       
        }, // Fin create
        
        /**
        * function permettant d'augmenter le temps affiché
        */
        augmenterTemps: function(){
            //console.log(this.tempsEcoule);
            tempsEcoule++;
            this.tempsTxt.text = "Temps écoulé: " + tempsEcoule;
        }, // Fin augmenterTemps
        
        /**
        * function permettant de diminuer le score affiché
        */
        diminuerScore: function(){
            //console.log(this.tempsEcoule);
            score--;
            this.scoreTxt.text = "Score: " + score;
            
            // Si le score est à 0, aller à la mauvaise fin
            if (score == 0){
                this.allerMauvaiseFin();
            }
        }, // Fin augmenterTemps
        
        /**
        * function permettant de créer la carte du jeu
        */
        creerCarteJeu: function(){
            //Créer l'objet de type Phaser.Tilemap et y associer les données JSON chargées
            this.laCarteDuJeu = leJeu.add.tilemap("carteJeu");
            //Associer à la carte du jeu l'image des tuiles "tileSet"
            this.laCarteDuJeu.addTilesetImage("tuiles_64");
            
            
            //Définir dans un objet les différentes couches du jeu (layers)
            this.lesCouches = {
                "mur": this.laCarteDuJeu.createLayer('mur'),
                "sol": this.laCarteDuJeu.createLayer('sol')
            };
			
            //Définir la taille du jeu ("World") pour correspondre à la taille des couches.
            this.lesCouches.sol.resizeWorld();
            this.lesCouches.mur.resizeWorld();

            //Définir les tuiles pour la collision - tels que définis dans le fichier JSON
             this.laCarteDuJeu.setCollision([1], true, this.lesCouches.mur);
			
        }, // Fin creerCarteJeu

		/**
        * function permettant de créer les personnages avec les animations
        */
        creerPersonnages : function (){
            //Variables utilisées dans cette fonction
            var posX, posY, lesPositions, lesAnims, unFantome;
            
            //Le heros et ses animations           
            this.heros = leJeu.add.sprite(TAILLE_TUILE,TAILLE_TUILE , "herosImg");
            this.heros.animations.add("droite", [6,8], 6, true );
            this.heros.animations.add("gauche", [9,11], 6, true );
            this.heros.animations.add("bas", [0,2], 6, true );
            this.heros.animations.add("haut", [3,5], 6, true );
            this.heros.frame = 1;

			//fantômes et leurs animations
            this.lesFantomes = leJeu.add.physicsGroup();
            lesPositions = [[8,3],[7,7], [3,7], [11,6]];
            lesAnims = [[0,1], [2,3], [4,5], [6,7]];
            
            for( var i=0 ; i < 4 ; i++){
                posX = (lesPositions[i][0]*TAILLE_TUILE) + TAILLE_TUILE/2;
                posY = (lesPositions[i][1]*TAILLE_TUILE) + TAILLE_TUILE/2;
                //console.log(posX , posY);
                unFantome  = this.lesFantomes.create(posX, posY, "ennemiImg", 0);
                
                unFantome.anchor.set(0.5);
                unFantome.animations.add("droite", lesAnims[0], 6, true);
                unFantome.animations.add("gauche", lesAnims[1], 6, true);
                unFantome.animations.add("bas", lesAnims[3], 6, true);
                unFantome.animations.add("haut", lesAnims[2], 6, true);
            };
            // Appel de la fonction qui gere leur physique
            this.gererPhysiqueDesPersonnages();
			
        }, // Fin creerPersonnages
        
        /**
        * function permettant de créer les objets avec les animations
        */
        creerObjets : function (){
            //Variables utilisées dans cette fonction
            var posX, posY, indexHasard, lesPositions, unPortail;
            
            //Clé
            lesPositions = [[11,4], [3,1], [11,1], [1,5], [5,8], [11,6], [12,8], [9,1], [4,3], [11,4]];
            indexHasard = Math.floor(Math.random() * lesPositions.length);
            posX = (lesPositions[indexHasard][0]*TAILLE_TUILE) + TAILLE_TUILE/2;
            posY = (lesPositions[indexHasard][1]*TAILLE_TUILE) + TAILLE_TUILE/2;
            
            this.laCle = leJeu.add.sprite(posX,posY , "cleImg");
            this.laCle.anchor.set(0.5);
            this.laCle.animations.add("bondir", null, 6,true);
            this.laCle.play("bondir");
            
            
            //Ami
            lesPositions = [[1,5], [12,8], [4,3], [11,1], [11,4], [9,1], [3,1], [11,6], [10,8], [4,3]];
            posX = (lesPositions[indexHasard][0]*TAILLE_TUILE) + TAILLE_TUILE/2;
            posY = (lesPositions[indexHasard][1]*TAILLE_TUILE) + TAILLE_TUILE/2;
            
            this.ami = leJeu.add.sprite(posX, posY, "amiImg");
            this.ami.anchor.set(0.5);
            this.ami.animations.add("pleurer", null, 6,true);
            this.ami.play("pleurer");
            
            // Appel de la fonction qui gere leur physique
            this.gererPhysiqueDesObjets();
			
        }, // Fin creerObjets
        
        /**
        * function permettant de gerer la physique des personnages
        */
         gererPhysiqueDesPersonnages : function (){
             //Ajout de la physique du héros
             leJeu.physics.enable(this.heros, Phaser.Physics.ARCADE); //héros
             
             //Héros
             this.heros.body.collideWorldBounds = true;
             
             //Fantome
             this.lesFantomes.setAll("body.velocity.x", 50);
             this.lesFantomes.setAll("body.blocked", { up: true, down: true, left: true, right: true });
             
             this.lesFantomes.setAll("body.collideWorldBounds", true);
            
             //Ramener le heros,les fantômes, la clé et l'ami en avant-plan     
             leJeu.world.bringToTop(this.heros);
             leJeu.world.bringToTop(this.lesFantomes);
         
         }, // Fin gererPhysiqueDesPersonnages
        
        /**
        * function permettant de gerer la physique des objets
        */
        gererPhysiqueDesObjets : function (){
             //Ajout de la physique
             leJeu.physics.enable(this.laCle, Phaser.Physics.ARCADE); //clé
             leJeu.physics.enable(this.ami, Phaser.Physics.ARCADE);   //ami
             
             //Faire en sorte que l'ami et la clé ne bouge pas
             this.laCle.body.immovable = true;
             this.ami.body.immovable = true;
             //this.lesPortails.setAll("body.immovable", true);
            
             //Ramener le heros,les fantômes, la clé et l'ami en avant-plan     
             leJeu.world.bringToTop(this.laCle);
             leJeu.world.bringToTop(this.ami);
         
         }, // Fin gererPhysiqueDesObjets
		
        /**
        * function permettant de gerer le déplacement du héros
        */
        update: function(){
            //Détecter les touches du clavier pour le déplacement du heros
            //Au départ, on met les vitesses sur l'axe des x et des y à 0
            //On ajuste les animations pour chaque flèche
            this.heros.body.velocity.set(0);

            if (this.lesFleches.left.isDown) {
                //Déplacement vers la gauche - on inverse la vitesse
                this.heros.body.velocity.x = -this.vitesseHeros;
                this.heros.play("gauche");
            }

            if (this.lesFleches.right.isDown) {
                //Déplacement vers la droite
                this.heros.body.velocity.x = this.vitesseHeros;
                this.heros.play("droite");
            }

            if (this.lesFleches.up.isDown){
                //Déplacement vers le haut
                 this.heros.body.velocity.y = -this.vitesseHeros;
                this.heros.play("haut");

            }

            if (this.lesFleches.down.isDown){
                // Déplacement vers le bas
                this.heros.body.velocity.y =  this.vitesseHeros;
                this.heros.play("bas");
            }

            //Si les deux vitesses sont à 0, c'est que notre heros est au repos
            if(this.heros.body.velocity.x == 0 && this.heros.body.velocity.y == 0){
                //On arrête les animations
                this.heros.animations.stop();
                this.heros.frame = 1;
            }
            //Appel de la fonction qui gere les collisions
            this.gererCollisions();
        
        }, // Fin update
        
        /**
        * function permettant de gerer les collisions
        */
        gererCollisions : function(){
            //Détection des collisions avec les murs
            leJeu.physics.arcade.collide(this.heros, this.lesCouches.mur);
            
            //Détection des collisions avec les fantomes
            leJeu.physics.arcade.collide(this.lesFantomes, this.lesCouches.mur, this.changerDirection, null, this);

            //Détection de la collision entre heros et un fantôme
            //Si oui, on appelle la fonction allerFinJeu
            leJeu.physics.arcade.collide(this.heros, this.lesFantomes, this.allerMauvaiseFin, null, this);
            
            //Vérifier si heros prend la cle
            // Si oui, on appelle la fonction prendreCle
            leJeu.physics.arcade.collide(this.heros, this.laCle, this.prendreCle, null, this);
            
            //Vérifier si heros a la clé pour délivrer son ami
            // Si oui, on appelle la fonction sauverAmi
            leJeu.physics.arcade.collide(this.heros, this.ami, this.sauverAmi, null, this);
            
        }, // Fin gererCollisions
        
        /**
        * function permettant au fantomes de changer de direction lors de collision avec le mur
        * @param {sprite} fantome
        * @param {sprite} tuile
        */
        changerDirection : function(fantome, tuile){           
            //On attribue une vitesse sur l'axe des x et des y au hasard à chaque fantôme pour changer sa direction - on modifie aussi l'animation
            switch (leJeu.rnd.between(1,4)) {
                case 1:
                    fantome.body.velocity.x = 50;
                    fantome.play("droite");
                    break;
                case 2:
                    fantome.body.velocity.x = -50;
                    fantome.play("gauche");
                    break;
                case 3:
                    fantome.body.velocity.y = 50;
                    fantome.play("bas");
                    break;
                case 4:
                    fantome.body.velocity.y = -50;
                    fantome.play("haut");
                    break;
            }  
        }, // Fin changerDirection
		
        /**
        * function permettant au héros de prendre la clé
        * @param {sprite} heros
        * @param {sprite} clé
        */
        prendreCle : function(heros, cle) {
            //Son de Clé
            leJeu.add.audio("sonCle",1).play();
            
            //Détruire la clé
            cle.destroy();
            heros.aLaCle = true;
           
        }, // Fin prendreCle
        
        
        /**
        * function permettant de savoir si le éros a sauver son ami
        * @param {sprite} heros
        * @param {sprite} ami
        */
        sauverAmi : function(heros, ami) {
            //console.log(heros.aLaCle);
            //Si le héros a la clé
            if(heros.aLaCle == true){
                //Son de Victoire
                leJeu.add.audio("sonFinGagner",1).play();
                
                imageFin = "finBonneImg";
                texteFin = "Vous avez délivré Poosky!\n\n";
                //Appel de la fonction qui nous met a la fin
                this.allerEcranFin();
            }
        }, // Fin prendreCle
        
        /**
        * function permettant de savoir si le éros a sauver son ami
        * @param {sprite} heros
        * @param {sprite} fantome
        */
        allerMauvaiseFin: function (heros, fantome) {//Les paramètres reçus ne sont toutefois pas utilisés...
            //Son de défaite
            leJeu.add.audio("sonFinPerdu", 1).play();
            
            score = 0;
            imageFin = "finMauvaiseImg";
            texteFin = "Vous avez échoué à délivrer Poosky!\n\n";
            //Appel de la fonction qui nous met a la fin
            this.allerEcranFin();
        }, // Fin allerFinJeu
        
        /**
        * function qui nous met à l'écran de fin
        */
        allerEcranFin: function(){
            leJeu.time.events.remove(this.minuterieTemps);
            leJeu.time.events.remove(this.minuterieScore);
            leJeu.state.start("FinJeu"); 
        } // Fin de allerEcranFin
		
    }; // Fin Jeu.prototype


    ////////////////////////////////
    //          EcranFinJeu       //
    ////////////////////////////////


    /**
    * Classe permettant de définir l'écran (state)
    * pour la scène de la fin du jeu
    */

    var FinJeu = function FinJeu(){};
    FinJeu.prototype = {
        
        /**
        * function permettant de créer (texte, bouton, etc.)
        */
        create: function(){ 
            //Image d'into
            leJeu.add.image(0,0, imageFin);
            
            //Le titre
            var style1 = {font: "bold 64px monospace", fill: "#000000", align: "center"};
            var titreTxt = leJeu.add.text(leJeu.width / 2, 10, "FIN DU JEU\n", style1);
            titreTxt.anchor.set(0.5, 0);
            
            //Le texte
            var style2 = {font: "bold 32px monospace", fill: "#000000", align: "left"};
            
            //Vérification et enregistrement du meilleur score
            meilleurScore = Math.max(score, meilleurScore);
            localStorage.setItem(NOM_LOCAL_STORAGE, meilleurScore);
			
			texteFin += "Votre Score: " + score + "\n";
            texteFin += "Meilleur Score: " + meilleurScore + "\n";
            texteFin += "Temps Écoulé: " + tempsEcoule;
            
			var finJeuTxt = leJeu.add.text(leJeu.width*2, leJeu.height*0.4, texteFin, style2);
            finJeuTxt.anchor.set(0.5);
            
            //Animation
            var animTxtFin = leJeu.add.tween(finJeuTxt).to({x:leJeu.width*0.4}, 1000, Phaser.Easing.Bounce.InOut, true, 0, 0, false);
            
            //Bouton
            var boutonJouer= leJeu.add.button(leJeu.width*0.25, leJeu.height*0.75, "jouerBtn",this.rejouer, this,0,1,2,0);
            boutonJouer.anchor.set(0.5);
        },
        /**
        * function qui permet au jouer de rejouer
        */
        rejouer: function(){
            //Son du menu
            leJeu.add.audio("sonMenu",1).play();
            
            //Aller à l'écran de jeu
            leJeu.state.start("Jeu");      
        } //Fin rejouer
    }; // Fin FinJeu.prototype   

})(); //Fin IIFE