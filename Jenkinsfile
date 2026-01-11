@Library('jenkins-shared-library') _

pipeline {
    agent any

    environment {
        DOCKER_USER = 'yassinekamouss'
        APPS = "public-app admin-app"
        // Récupère les 7 premiers caractères du commit pour le tag
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
                // Récupération complète de l'historique pour que Nx puisse comparer les commits
                checkout([
                    $class: 'GitSCM',
                    branches: scm.branches,
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [[
                        $class: 'CloneOption',
                        noTags: false,
                        reference: '',
                        shallow: false,
                        depth: 0,
                        timeout: 30
                    ]],
                    submoduleCfg: [],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
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
                    // Dans un pipeline simple, on utilise env.GIT_BRANCH
                    def currentBranch = env.GIT_BRANCH ?: ""
                    def baseRef = currentBranch.contains("main") ? 'HEAD~1' : 'origin/main'
                    
                    echo "🔍 INTELLIGENCE NX : Branche=${currentBranch}, Base=${baseRef}"
                    
                    try {
                        sh "npx nx affected:build --base=${baseRef} --head=HEAD --configuration=production"
                    } catch (Exception e) {
                        echo "⚠️ Rien à builder selon Nx."
                    }
                    
                    // Si Nx n'a rien détecté, on force le build pour garantir la présence des fichiers pour Docker
                    if (!fileExists('dist')) {
                         echo "🤔 Dossier dist absent, lancement de run-many..."
                         sh "npx nx run-many --target=build --all --configuration=production --parallel"
                    }
                }
            }
        }
        stage('SonarQube Analysis') {
              steps {
                  script {
                      // Appel de ta fonction Shared Library
                      runSonarAnalysis('estate-rental-frontend')
                  }
              }
          }
          
        stage("Quality Gate") {
            steps {
                // Cette étape attend que le Webhook que tu as créé 
                // renvoie le résultat (Success ou Failure)
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    // Détection de la branche principale (main ou origin/main)
                    def currentBranch = env.GIT_BRANCH ?: ""
                    def isMainBranch = currentBranch.contains("main")
                    
                    echo "--- DÉPLOIEMENT ---"
                    echo "Branche détectée : ${currentBranch}"
                    echo "Tag latest activé : ${isMainBranch}"

                    def appsList = APPS.split(' ')
                    
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_HUB', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER_CRED')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER_CRED" --password-stdin'
                        
                        appsList.each { appName ->
                            def distPath = "dist/apps/${appName}"
                            def browserPath = "${distPath}/browser"
                            def finalPath = fileExists(browserPath) ? browserPath : (fileExists(distPath) ? distPath : "")

                            if (finalPath != "") {
                                echo "🚀 Build de l'image pour : ${appName}"
                                def imageUri = "${DOCKER_USER}/${appName}:${IMAGE_TAG}"
                                def latestUri = "${DOCKER_USER}/${appName}:latest"
                                
                                // Approche Double Tag au build
                                def buildCmd = "docker build -t ${imageUri} "
                                if (isMainBranch) {
                                    buildCmd += "-t ${latestUri} "
                                }
                                buildCmd += "--build-arg APP_NAME=${appName} ."
                                
                                sh buildCmd
                                
                                // Push vers Docker Hub
                                sh "docker push ${imageUri}"
                                if (isMainBranch) {
                                    sh "docker push ${latestUri}"
                                }
                            } else {
                                echo "💤 Aucun build trouvé pour ${appName}, passage à la suivante."
                            }
                        }
                    }
                }
            }
        }
    } // Fin des stages

    post {
        always {
            cleanWs()
            sh "docker system prune -f" 
        }
        success {
            echo "✅ Pipeline terminé avec succès !"
        }
    }
}
