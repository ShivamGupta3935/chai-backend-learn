
import dotenv from "dotenv"
import connectDB from './db/index.js'
import { app } from "./app.js"


dotenv.config({
  path:"./env"
})

const port = process.env.PORT || 6000

connectDB()
.then( () => {
  app.on("error", (err) => {
    console.log("connecting error", err);
    throw err
  })

  app.listen(port, () => {
    console.log(`app is listen on port : ${port}`);
  })
})
.catch( (err) => {
  console.log("MongoDB connection failed ", err);
})





















// (async() => {
//     try {
//        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//        app.on("error", (err) => {
//         console.error("err", err)
//         throw err
//        })

//        app.listen(process.env.PORT, () => {
//           console.log(`App is listen on port : ${process.env.PORT}`)
//        })
//     } catch (err) {
//         console.error("Error :", err)
//     }
// })()