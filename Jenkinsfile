pipeline {
  agent none
	triggers {
    pollSCM 'H/5 * * * *'
  }
  stages {
    stage('Test') {
        when {
          branch "master"
        }
        agent {
          label 'docker'
        }
        steps {
          withKubeConfig([
            credentialsId: 'k8s',
            contextName: 'kubernetes'
          ]) {
            sh './go test'
          }
        }
      }
    stage('Build Image & Upload') {
      when {
        branch "master"
      }
      agent {
        label 'docker'
      }
      steps {
        withKubeConfig([
          credentialsId: 'k8s',
          contextName: 'kubernetes'
        ]) {
          sh './go build'
        }
      }
    }
    stage('Deploy for Dev') {
      when {
        branch "master"
      }
      environment {
        ENV = "dev"
        NODE_PORT = "30080"
      }
      agent {
        label 'docker'
      }
      steps {
        withKubeConfig([
          credentialsId: 'k8s',
          contextName: 'kubernetes'
        ]) {
          sh './go deploy'
        }
      }
    }
    stage('Approve of Deploy QA') {
      when {
        branch "master"
      }
      steps {
        input message: 'deploy to QA?'
      }
    }
    stage('Deploy for QA') {
      when {
        branch "master"
      }
      environment {
        ENV = "qa"
        NODE_PORT = "30081"
      }
      agent {
        label 'docker'
      }
      steps {
        withKubeConfig([
          credentialsId: 'k8s',
          contextName: 'kubernetes'
          ]) {
          sh './go deploy'
        }
      }
    }
    stage('Approve of Deploy UAT') {
      when {
        branch "master"
      }
      steps {
        input message: 'deploy to UAT?'
      }
    }
    stage('Deploy for UAT') {
      when {
        branch "master"
      }
      environment {
        ENV = "uat"
        NODE_PORT = "30082"
      }
      agent {
        label 'docker'
      }
      steps {
        withKubeConfig([
          credentialsId: 'k8s',
          contextName: 'kubernetes'
          ]) {
          sh './go deploy'
        }
      }
    }
    stage('Approve of Deploy PROD') {
      when {
        branch "master"
      }
      steps {
        input message: 'deploy to PROD?'
      }
    }
    stage('Deploy for PROD') {
      when {
        branch "master"
      }
      environment {
        ENV = "prod"
        NODE_PORT = "30083"
      }
      agent {
        label 'docker'
      }
      steps {
        withKubeConfig([
          credentialsId: 'k8s',
          contextName: 'kubernetes'
          ]) {
          sh './go deploy'
        }
      }
    }
  }
}
