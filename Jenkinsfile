pipeline {
    agent any

    environment {
        DOCKER_USER = 'yassinekamouss'
        APPS = "public-app admin-app"
        IMAGE_TAG = "${GIT_COMMIT.take(7)}"
        NODE_OPTIONS = "--max-old-space-size=4096"
    }

    tools {
        nodejs 'node-20'
    }

    stages {
        stage('Initialize (Deep Clone)') {
            steps {
                cleanWs()
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
                    def baseRef = (env.BRANCH_NAME == 'main') ? 'HEAD~1' : 'origin/main'
                    echo "🔍 INTELLIGENCE NX : Base=${baseRef}"
                    
                    try {
                        sh "npx nx affected:build --base=${baseRef} --head=HEAD --configuration=production"
                    } catch (Exception e) {
                        echo "⚠️ Erreur ou rien à builder."
                    }
                    
                    def distExists = fileExists('dist')
                    if (!distExists) {
                         echo "🤔 Force run-many..."
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
                            def finalPath = fileExists(browserPath) ? browserPath : (fileExists(distPath) ? distPath : "")

                            if (finalPath != "") {
                                echo "🚀 Préparation du build pour ${appName}"
                                def imageUri = "${DOCKER_USER}/${appName}:${IMAGE_TAG}"
                                def latestUri = "${DOCKER_USER}/${appName}:latest"
                                
                                // Construction des arguments de tag
                                def buildArgs = "-t ${imageUri} "
                                if (env.BRANCH_NAME == 'main') {
                                    buildArgs += "-t ${latestUri} "
                                }
                                
                                sh "docker build ${buildArgs} --build-arg APP_NAME=${appName} ."
                                
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
    } 

    post {
        always {
            cleanWs()
            sh "docker system prune -f" 
        }
    }
} 
