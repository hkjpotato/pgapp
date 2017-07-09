0.0. Make sure Node and NPM is installed(https://github.com/creationix/nvm). I use node 6 now.

0.1. Setup virtualenv if you want
->pip install virtualenv
->virtualenv virtualenv_pgapp
->to activate: source virtualenv_pgapp/bin/activate
->to deactivate: deactivate

->to freeze: pip freeze > requirements.txt

1. Install Django & django-wepack-loader
->to install: pip install -r requirements.txt
->two things to be installed:
Django==1.10
django-webpack-loader==0.5.0

2. go to project root (/mysite)
->npm install

//before step2, step to setup project folder
1. django-admin startproject mysite
2. cd mysite
3. npm init
4. python manage.py startapp app1 & app2
5. change of mysite/settings.py
