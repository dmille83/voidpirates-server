cd %cd%
git add .
git commit -m "init"
git push heroku master
heroku ps:scale web=1
heroku open
heroku logs --tail