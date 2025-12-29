pipeline {
    agent any

    environment {
        DOCKER_USER = 'yassinekamouss'
        APPS = "public-app admin-app"
        IMAGE_TAG = "${GIT_COMMIT.take(7)}"
        // Optimisation mémoire pour Nx
        NODE_OPTIONS = "--max-old-space-size=4096"
    }

    tools {
        nodejs 'node-20'
    }

    stages {
        stage('Initialize (Deep Clone)') {
            steps {
                cleanWs()
                // --- CORRECTION CRITIQUE : Récupérer tout l'historique Git ---
                // Sans ça, Nx ne peut pas comparer les commits et ne build rien.
                checkout([
                    $class: 'GitSCM',
                    branches: scm.branches,
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [[
                        $class: 'CloneOption',
                        noTags: false,
                        reference: '',
                        shallow: false, // Important : Désactive le clone superficiel
                        depth: 0,       // 0 = Historique complet
                        timeout: 30
                    ]],
                    submoduleCfg: [],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
                // On s'assure d'avoir les refs distantes pour la comparaison
                sh 'git fetch --all'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci --legacy-peer-deps'
            }
        }

        stage('Nx Build (FORCE)') {
            steps {
                script {
                    echo "🔥 MODE FORCE ACTIVÉ : On ignore 'affected' et on construit tout !"
                    
                    // On utilise run-many avec --all au lieu de affected
                    sh "npx nx run-many --target=build --all --configuration=production --parallel"
                    
                    // Vérification immédiate
                    sh "ls -R dist || echo '❌ Toujours pas de dossier dist...'"
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    def appsList = APPS.split(' ')
                    
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_HUB', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER_CRED')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER_CRED" --password-stdin'
                        
                        appsList.each { appName ->
                            // --- CORRECTION CHEMIN : Gestion souple des dossiers ---
                            def distPath = "dist/apps/${appName}"
                            def browserPath = "${distPath}/browser"
                            def finalPath = ""

                            if (fileExists(browserPath)) {
                                finalPath = browserPath
                            } else if (fileExists(distPath)) {
                                finalPath = distPath
                            }

                            if (finalPath != "") {
                                echo "🚀 Build trouvé pour ${appName} dans : ${finalPath}"
                                
                                def imageUri = "${DOCKER_USER}/${appName}:${IMAGE_TAG}"
                                def latestUri = "${DOCKER_USER}/${appName}:latest"
                                
                                // On passe le bon chemin trouvé (finalPath) au Docker context si besoin, 
                                // mais ici on utilise l'ARG pour le COPY.
                                // IMPORTANT : Assurez-vous que votre Dockerfile copie bien ce dossier.
                                
                                sh "docker build -t ${imageUri} --build-arg APP_NAME=${appName} ."
                                sh "docker push ${imageUri}"
                                
                                if (env.BRANCH_NAME == 'main') {
                                    sh "docker tag ${imageUri} ${latestUri}"
                                    sh "docker push ${latestUri}"
                                }
                            } else {
                                echo "💤 Aucun build détecté pour ${appName} (Nx n'a rien généré). On passe."
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            sh "docker system prune -f" 
        }
    }
}