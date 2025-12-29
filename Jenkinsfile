pipeline {
    agent any

    environment {
        DOCKER_USER = 'yassinekamouss'
        APPS = "public-app admin-app" 
        IMAGE_TAG = "${GIT_COMMIT.take(7)}"
        // Pour éviter les soucis de mémoire Node avec Nx sur gros projets
        NODE_OPTIONS = "--max-old-space-size=4096" 
    }

    tools {
        nodejs 'node-20'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                // Sécurité absolue : on part de zéro pour éviter les artefacts fantômes
                cleanWs() 
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Utilise le cache Jenkins si possible, sinon npm ci
                sh 'npm ci --legacy-peer-deps'
            }
        }

        stage('Nx Build (Affected)') {
            steps {
                script {
                    // Logique pour gérer le build sur Main vs PR
                    def baseRef = (env.BRANCH_NAME == 'main') ? 'HEAD~1' : 'origin/main'
                    
                    echo "🔍 Comparaison Nx : Base=${baseRef} vs Head=HEAD"
                    
                    // On build. Si une app n'est pas touchée, dist/apps/lapp n'existera pas.
                    sh "npx nx affected:build --base=${baseRef} --head=HEAD --configuration=production"
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
                            // Vérifie le chemin exact généré par ton version de Nx (parfois sans /browser)
                            if (fileExists("dist/apps/${appName}/browser")) {
                                
                                echo "🚀 Construction Docker pour : ${appName}"
                                
                                def imageUri = "${DOCKER_USER}/${appName}:${IMAGE_TAG}"
                                def latestUri = "${DOCKER_USER}/${appName}:latest"
                                
                                // Grâce au .dockerignore, ce build est ultra rapide
                                sh "docker build -t ${imageUri} --build-arg APP_NAME=${appName} ."
                                sh "docker push ${imageUri}"
                                
                                // Tag latest seulement si on est sur main (bonnes pratiques)
                                if (env.BRANCH_NAME == 'main') {
                                    sh "docker tag ${imageUri} ${latestUri}"
                                    sh "docker push ${latestUri}"
                                }
                            } else {
                                echo "zzz Pas de changement pour ${appName}. On passe."
                            }
                        }
                    }
                }
            }
        }
    }
}