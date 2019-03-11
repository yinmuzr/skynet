#!/bin/sh
set -e

BASEDIR=$(dirname "$0")
APP_NAME=skynet-frontend
APP_PORT=80

test() {
   exec_test
}

yarn_install_with_cache() {
  if [[ ! -z "$MODULES_FOLDER" ]]; then
    cp -rf "$MODULES_FOLDER" node_modules
  fi
  yarn install
  if [[ ! -z "$MODULES_FOLDER" ]]; then
    cp -rf node_modules/* "$MODULES_FOLDER"
  fi
}

exec_test() {
  yarn config set registry ${NPM_REGISTRY:=https://registry.npm.taobao.org}
  yarn_install_with_cache
  yarn test:unit
}

exec_build() {
  yarn config set registry ${NPM_REGISTRY:=https://registry.npm.taobao.org}
  yarn_install_with_cache
  yarn build
}

build() {
   exec_build

   DOCKER_REGISTRY_SERVER=${DOCKER_REGISTRY_SERVER:=https://729744961332.dkr.ecr.cn-north-1.amazonaws.com.cn}
   DOCKER_REGISTRY_NAME=$(echo $DOCKER_REGISTRY_SERVER | sed 's~http[s]*://~~g')
   CI_COMMIT_SHA=${GIT_COMMIT:=$(git log -n 1 --pretty=format:'%h')}
   IMAGE_TAG="$CI_COMMIT_SHA"
   DOCKER_USER=$(kubectl get secret regcred --output="jsonpath={.data.\.dockerconfigjson}" | base64 --decode | jq .[] | jq .[].username | sed -e 's/^"//' -e 's/"$//')
   DOCKER_PASSWORD=$(kubectl get secret regcred --output="jsonpath={.data.\.dockerconfigjson}" | base64 --decode | jq .[] | jq .[].password | sed -e 's/^"//' -e 's/"$//')

   docker build -t $DOCKER_REGISTRY_NAME/tw-gree/$APP_NAME:$IMAGE_TAG .
   docker login --username=$DOCKER_USER --password=$DOCKER_PASSWORD $DOCKER_REGISTRY_SERVER
   docker push $DOCKER_REGISTRY_NAME/tw-gree/$APP_NAME:$IMAGE_TAG
   docker rmi $DOCKER_REGISTRY_NAME/tw-gree/$APP_NAME:$IMAGE_TAG
}

deploy() {
  ENV=${ENV:=dev}
  kubectl create -f k8s/config_map.yaml -n $ENV || true

  CI_COMMIT_SHA=${GIT_COMMIT:=$(git log -n 1 --pretty=format:'%h')}
  IMAGE_TAG="$CI_COMMIT_SHA"
  DOCKER_REGISTRY_SERVER=${DOCKER_REGISTRY_SERVER:=https://729744961332.dkr.ecr.cn-north-1.amazonaws.com.cn}
  DOCKER_REGISTRY_NAME=$(echo $DOCKER_REGISTRY_SERVER | sed 's~http[s]*://~~g')

  cat k8s/deploy.yaml.tmpl | \
  sed 's/\$ENV'"/$ENV/g" | \
  sed 's/\$APP_NAME'"/$APP_NAME/g" | \
  sed 's/\$APP_PORT'"/$APP_PORT/g" | \
  sed 's/\$NODE_PORT'"/$NODE_PORT/g" | \
  sed 's/\$IMAGE_TAG'"/$IMAGE_TAG/g" | \
  sed 's/\$DOCKER_REGISTRY_NAME'"/$DOCKER_REGISTRY_NAME/g" | \
  kubectl apply -f -
}

case $1 in
 test|exec_test|build|exec_build|deploy )
   $1;;
 * )
   echo "not support!!! example: go <test|exec_test|build|exec_build|deploy>"
   exit 1;;
esac

