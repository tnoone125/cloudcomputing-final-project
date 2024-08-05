## Summary of command line executions

###################################################################################
### Back-end API Service

#### Local Docker development
docker-compose up --build -d

docker compose down

#### Tagging and pushing
docker tag api-service:latest tnoone125/api-service:latest

docker push tnoone125/api-service:latest

### Cluster creation
aws configure
eksctl create cluster --name cisc5550-api-service --region us-east-2 --version 1.30

#### Kompose, Persistent Volume creation
kompose convert
kubectl apply -f mysql-data-persistentvolume.yaml
kubectl apply -f mysql-data-persistentvolumeclaim.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f mysql-service.yaml

#### One time table creation in PV
kubectl describe pvc mysql-data

kubectl exec mysql-f9db5d6d9-prsjr -it bash

bash#mysql -u root -proot
mysql>CREATE TABLE IF NOT EXISTS entries (what_to_do VARCHAR(100) NOT NULL, due_date VARCHAR(100) DEFAULT '', status VARCHAR(100) DEFAULT '');

#### Deploy API Service
kubectl apply -f api-service-deployment.yaml
kubectl apply -f api-service-service.yaml

kubectl get services

#### Allow HTTP Traffic
aws ec2 describe-security-groups --filters "Name=tag:aws:eks:cluster-name,Values=cisc5550-api-service"
aws ec2 authorize-security-group-ingress --group-id sg-0c525d1a3b450d2b4 --protocol tcp --port 5001 --cidr 0.0.0.0/0

kubectl rollout restart deployment api-service

###################################################################################
### Web Application

#### Creation
npx create-react-app todo-app
npm install express
npm install axios
npm install fs
npm install path
# .. potentially others ..

#### Build and run web application
npm run build
node ./server/index.js

#### Dockerize web application and push to GCloud Cluster
docker build -t tnoone125/todo-express-application:latest --build-arg api_ip=a2ae5f2eed9384523901bed8fc1dc923-1564554210.us-east-2.elb.amazonaws.com .
docker push tnoone125/todo-express-application:latest

gcloud config set project cisc5550-final-project
gcloud services enable container.googleapis.com
gcloud container clusters create cisc5550-final-project --zone=us-east1-b 

kubectl create deployment todo-webapp --image=tnoone125/todo-express-application:latest --port=5000
kubectl expose deployment todo-webapp --type=LoadBalancer

gcloud compute firewall-rules create allow-http-5000 --allow tcp:5000
gcloud compute firewall-rules create allow-http-80 --allow tcp:80

kubectl get service todo-webapp