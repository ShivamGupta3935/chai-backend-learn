
import dotenv from "dotenv"
import connectDB from './db/index.js'


dotenv.config({
  path:"./env"
})

connectDB()





















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