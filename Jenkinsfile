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

        stage('Nx Build (Affected)') {
            steps {
                script {
                    def baseRef = (env.BRANCH_NAME == 'main') ? 'HEAD~1' : 'origin/main'
                    
                    echo "🔍 INTELLIGENCE NX :"
                    echo "   - Branche actuelle : ${env.BRANCH_NAME}"
                    echo "   - Base de comparaison : ${baseRef}"
                    echo "   - Cible (Head) : HEAD"
                    
                    // 2. Commande Nx Affected
                    try {
                        sh "npx nx affected:build --base=${baseRef} --head=HEAD --configuration=production"
                    } catch (Exception e) {
                        echo "⚠️ Erreur ou rien à builder. Vérifions si dist existe..."
                    }
                    
                    def distExists = fileExists('dist')
                    if (!distExists) {
                         echo "🤔 Nx n'a rien détecté (peut-être premier build ?). On force le build pour assurer le Docker."
                         sh "npx nx run-many --target=build --all --configuration=production --parallel"
                    }
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
                          def distPath = "dist/apps/${appName}"
                          def browserPath = "${distPath}/browser"
                          def finalPath = ""
      
                          if (fileExists(browserPath)) {
                              finalPath = browserPath
                          } else if (fileExists(distPath)) {
                              finalPath = distPath
                          }
      
                          if (finalPath != "") {
                              echo "🚀 Préparation du build pour ${appName}"
                              
                              def imageUri = "${DOCKER_USER}/${appName}:${IMAGE_TAG}"
                              def latestUri = "${DOCKER_USER}/${appName}:latest"
                              
                              // --- APPROCHE DOUBLE TAG ---
                              // On prépare la commande de build de base
                              def buildArgs = "-t ${imageUri} "
                              
                              // Si on est sur la branche main, on ajoute le second tag 'latest' au build
                              if (env.BRANCH_NAME == 'main') {
                                  buildArgs += "-t ${latestUri} "
                              }
                              
                              // Exécution du build unique avec un ou deux tags
                              sh "docker build ${buildArgs} --build-arg APP_NAME=${appName} ."
                              
                              // Push des images
                              sh "docker push ${imageUri}"
                              if (env.BRANCH_NAME == 'main') {
                                  sh "docker push ${latestUri}"
                              }
                          } else {
                              echo "💤 Aucun build détecté pour ${appName}. On passe."
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
