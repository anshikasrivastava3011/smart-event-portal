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
                bat 'docker build -t %DOCKER_IMAGE%:%IMAGE_TAG% .'
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
                    echo %DOCKER_TOKEN% | docker login -u %DOCKER_USERNAME% --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat 'docker push %DOCKER_IMAGE%:%IMAGE_TAG%'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                kubectl apply -f kubernetes/service.yaml

                kubectl set image deployment/%DEPLOYMENT_NAME% ^
                %CONTAINER_NAME%=%DOCKER_IMAGE%:%IMAGE_TAG%
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                bat '''
                kubectl rollout status deployment/%DEPLOYMENT_NAME% --timeout=120s
                kubectl get pods
                kubectl get service eventportal-service
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
            echo "Docker image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
        }

        failure {
            echo 'Pipeline failed. Rolling back Kubernetes deployment.'

            bat '''
            kubectl rollout undo deployment/%DEPLOYMENT_NAME%
            '''

            echo 'Rollback command completed.'
        }

        always {
            bat 'docker logout'
        }
    }
}