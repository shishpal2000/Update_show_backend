import mongoose from"mongoose";


export const connectDb = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("data base is connected");
    }).catch((e) => {
        console.log(e);
    })
}