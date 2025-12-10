pipeline {
    agent any

    environment {
        DOCKER_USER = 'yassinekamouss'
        APPS = "public-app admin-app" 
        IMAGE_TAG = "${GIT_COMMIT.take(7)}"
    }

    tools {
        nodejs 'node-20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci --legacy-peer-deps'
            }
        }

        stage('Nx Lint & Test (Affected)') {
            steps {
                script {
                    sh 'npx nx affected:lint --base=origin/main --head=HEAD'
                    // sh 'npx nx affected:test --base=origin/main --head=HEAD' // Décommenter si tu as des tests
                }
            }
        }

        stage('Nx Build (Affected)') {
            steps {
                script {
                    sh 'npx nx affected:build --base=origin/main --head=HEAD --configuration=production'
                }
            }
        }

        stage('Docker Build & Push (Conditional)') {
            steps {
                script {
                    def appsList = APPS.split(' ')
                    
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_HUB', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER_CRED')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER_CRED" --password-stdin'
                        
                        appsList.each { appName ->
                            if (fileExists("dist/apps/${appName}")) {
                                
                                echo "✅ Changement détecté sur ${appName} : Construction de l'image Docker..."
                                
                                // Construction du nom de l'image : yassinekamouss/public-app:a1b2c3d
                                def imageUri = "${DOCKER_USER}/${appName}:${IMAGE_TAG}"
                                def latestUri = "${DOCKER_USER}/${appName}:latest"
                                
                                // 1. Build
                                // On passe l'argument APP_NAME au Dockerfile pour qu'il sache quel dossier copier
                                sh "docker build -t ${imageUri} --build-arg APP_NAME=${appName} ."
                                
                                // 2. Push version commmit
                                sh "docker push ${imageUri}"
                                
                                // 3. Tag & Push Latest (Pratique pour le dev)
                                sh "docker tag ${imageUri} ${latestUri}"
                                sh "docker push ${latestUri}"
                                
                            } else {
                                echo "⏭️ Aucun changement détecté sur ${appName} (pas de dist/). On passe."
                            }
                        }
                    }
                }
            }
        }
    }
}