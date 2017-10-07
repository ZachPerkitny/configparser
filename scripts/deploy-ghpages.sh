#!/bin/sh
set -e # abort the script if there is a non-zero error

remote=$(git config remote.origin.url)

mkdir gh-pages-branch
cd gh-pages-branch

git config --global user.email "$GH_EMAIL" > /dev/null 2>&1
git config --global user.name "$GH_NAME" > /dev/null 2>&1
git init
git remote add --fetch origin "$remote"

if git rev-parse --verify origin/gh-pages > /dev/null 2>&1:
then
    git checkout gh-pages
    git rm -rf .
else
    git checkout --orphan gh-pages
fi

cd ..
jsdoc -c jsdoc.json
cd gh-pages-branch

git add -A
git commit --allow-empty -m "Deploy to GitHub Pages [skip ci]"
git push --force --quiet origin gh-pages

cd ..
rm -rf gh-pages-branch

echo "Deployment Finished"