FROM python:3.9-slim

WORKDIR /usr/src/app

# install packages for mysql
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y gcc default-libmysqlclient-dev pkg-config

RUN pip install mysqlclient
RUN pip install flask
RUN pip install mysql-connector-python

# Copy the rest of the application code
COPY . .

# Specify the command to run your application
CMD ["python", "todolist_api.py"]