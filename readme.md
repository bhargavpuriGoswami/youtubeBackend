### Built With

[![NodeJS][Node.js]][Node-url] &nbsp;
[![ExpressJS][Express.js]][express-url] &nbsp;
[![MongoDB][mongo.db]][mongo-url] &nbsp;
[![Cloudinary][cloudinary]][cloudinary-url]


<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create .env file in source directory.
   ```sh
   touch src/.env
   ```
4. Copy all the content from "src/.env.sample" to "src/.env" file.
   
5. Make an account on [Mongo DB Atlas](https://www.mongodb.com/products/platform/atlas-database). Copy the connection string and paste it in "src/.env".
   ```
   MONGODB_URL = 'ENTER YOUR CONNECTION STRING';
   ```
6. Go to [jwt.io](https://jwt.io/). Copy two different JSON Web token and paste it in "src/.env"
   ```
   ACCESS_TOKEN_SECRET = "ENTER YOUR FIRST TOKEN"
   REFRESH_TOKEN_SECRET = "ENTER YOUR SECOND TOKEN"
   ```
7. Go to [Cloudinary](https://cloudinary.com/). Make an account and copy following details in "src/.env"
   ```
   CLOUDINARY_CLOUD_NAME = "ENTER YOUR CLOUD NAME"
   CLOUDINARY_API_KEY = "ENTER YOUR API KEY"
   CLOUDINARY_API_SECRET = "ENTER YOUR CLOUD SECRET"
   ```
8. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```



## POSTMAN DOCUMENTATION

This is an example of how you may give instructions on postman to check your project's APIs.
To get a local copy up and running follow these simple example steps.

Go to [Postman Documentation](https://documenter.getpostman.com/view/32526585/2sAYBaApjZ).






  [Node.js]: https://img.shields.io/badge/node.js-096b02?style=for-the-badge&logo=node.js&logoColor=white
  [Node-url]: https://nodejs.org/en
  [Express.js]: https://img.shields.io/badge/express.js-010521?style=for-the-badge&logo=express&logoColor=white
  [express-url]: https://expressjs.com/
  [mongo.db]: https://img.shields.io/badge/mongo.db-011a0a?style=for-the-badge&logo=mongodb&logoColor=green
  [mongo-url]: https://www.mongodb.com/
  [cloudinary]: https://img.shields.io/badge/Cloudinary-4a0ee3?style=for-the-badge&logo=cloudinary&logoColor=white
  [cloudinary-url]: https://www.mongodb.com/
  
