pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        DOCKER_IMAGE = 'anshikasrivastava3011/eventportal'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
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
                    docker logout
                    echo %DOCKER_TOKEN%|docker login --username %DOCKER_USERNAME% --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat 'docker push %DOCKER_IMAGE%:%IMAGE_TAG%'
            }
        }
    }

    post {
        success {
            echo 'Docker CI pipeline completed successfully!'
            echo "Image pushed: ${DOCKER_IMAGE}:${IMAGE_TAG}"
        }

        failure {
            echo 'Pipeline failed. Check the failed stage.'
        }

        always {
            bat 'docker logout || exit /b 0'
        }
    }
}