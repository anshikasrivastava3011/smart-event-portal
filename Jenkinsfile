pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        DOCKER_IMAGE = 'anshikasrivastava3011/eventportal'
        IMAGE_TAG = "build-${BUILD_NUMBER}"

        DEPLOYMENT_NAME = 'eventportal-deployment'
        CONTAINER_NAME = 'eventportal'
        SERVICE_NAME = 'eventportal-service'

        KUBECONFIG = 'C:\\Users\\anshi\\.kube\\config'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'call npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'call npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '''
                docker build -t %DOCKER_IMAGE%:%IMAGE_TAG% .
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    bat '''
                    docker logout
                    echo %DOCKER_TOKEN%|docker login --username %DOCKER_USERNAME% --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat '''
                docker push %DOCKER_IMAGE%:%IMAGE_TAG%
                '''
            }
        }

        stage('Check Kubernetes Access') {
            steps {
                bat '''
                echo ===== Current Context =====
                kubectl --kubeconfig="%KUBECONFIG%" config current-context

                echo ===== Nodes =====
                kubectl --kubeconfig="%KUBECONFIG%" get nodes

                echo ===== Existing Pods =====
                kubectl --kubeconfig="%KUBECONFIG%" get pods
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                kubectl --kubeconfig="%KUBECONFIG%" apply -f kubernetes/deployment.yaml

                kubectl --kubeconfig="%KUBECONFIG%" apply -f kubernetes/service.yaml

                kubectl --kubeconfig="%KUBECONFIG%" set image deployment/%DEPLOYMENT_NAME% ^
                %CONTAINER_NAME%=%DOCKER_IMAGE%:%IMAGE_TAG%
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    def rolloutResult = bat(
                        script: '''
                        kubectl --kubeconfig="%KUBECONFIG%" rollout status deployment/%DEPLOYMENT_NAME% --timeout=180s
                        ''',
                        returnStatus: true
                    )

                    if (rolloutResult != 0) {
                        echo 'Deployment failed. Starting rollback.'

                        bat '''
                        kubectl --kubeconfig="%KUBECONFIG%" rollout undo deployment/%DEPLOYMENT_NAME%

                        kubectl --kubeconfig="%KUBECONFIG%" rollout status deployment/%DEPLOYMENT_NAME% --timeout=180s
                        '''

                        error('Deployment failed and was rolled back.')
                    }
                }

                bat '''
                echo ===== Deployments =====
                kubectl --kubeconfig="%KUBECONFIG%" get deployments

                echo ===== Pods =====
                kubectl --kubeconfig="%KUBECONFIG%" get pods

                echo ===== Services =====
                kubectl --kubeconfig="%KUBECONFIG%" get services

                echo ===== Deployed Image =====
                kubectl --kubeconfig="%KUBECONFIG%" get deployment %DEPLOYMENT_NAME% -o jsonpath="{.spec.template.spec.containers[0].image}"

                echo.
                '''
            }
        }
    }

    post {
        success {
            echo 'Complete CI/CD pipeline succeeded!'
            echo "Published and deployed image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
        }

        failure {
            echo 'Pipeline failed. Check the failed stage.'
        }

        always {
            bat 'docker logout || exit /b 0'
        }
    }
}