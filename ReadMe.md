## This is a simple music bot

### Setup

* This reqiures a version of node of greater than 16
  * Download with https://nodejs.org/en/download/
  * Confirm download in the terminal. On mac or linux start up the terminal and run
    ```
    node -v && npm -v
    ```
  * you should see some numbers and characters
  * On windows start either git bash or terminal and run
    ```
    node -v && npm -v
    ```

* Head to discord[https://discord.com/developers/applications] and create a aplication give it all premisions accept those how are not relevent in the url generator. Copy the token under the bot tab.
* Next head to  Wit[https://wit.ai/] and create an app then copy the Server Access Token.
* This step is optional
   * Go to Spotify developer portal[https://developer.spotify.com/dashboard/] and create a new apllication and copy the token.


### Runing the app
* Create enviroment
  ```
  cp .env.schema .env
  ```
* Copy in all tokens from above.

* Install dependancies with
  ```
  npm i
  ```
  or
  ```
  yarn
  ```

* Build the code with
  ```
  npm run build
  ```
  or
  ```
  yarn build
  ```

* Start the app by runinng
  ```
  npm run start
  ```
  or
  ```
  yarn start
  ```

## PS!
 ### I have not got it to work with docker because it is not pre installed with ffmpeg which is a something the program needs to work.   
