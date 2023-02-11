import express, {Request,Response,Application} from 'express';

const app:Application = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req:Request, res:Response):void => {
  res.send("<link rel='stylesheet' href='index.css'><script src='minesweeper.js'></script><h1>Hi Steeeve!!!!!!!</h1><div class='border'></div>")
});

app.get("/max/", (req:Request, res:Response):void => {
  res.send("Hey there, Max ;)")
});

app.listen(PORT, ():void => {
  console.log(`Server Running here 👉 http://localhost:${PORT}`);
});

app.use(express.static('dist'));
app.use(express.static('src'));
