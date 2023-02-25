import express, {Request,Response,Application} from 'express';

const app:Application = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req:Request, res:Response):void => {
  res.sendFile("index.html", {root: __dirname })
});

app.get("/max/", (req:Request, res:Response):void => {
  res.send("Hey there, Steeeve ;)))")
});

app.listen(PORT, ():void => {
  console.log(`Server Running here 👉 http://localhost:${PORT}`);
});

app.use(express.static('dist'));
app.use(express.static('src'));
