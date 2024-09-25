const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const Auth = new Schema(
  {
    UserID: {
      type: String,
      required: [true, "UserId required in Verifs"],
      unique: true,
    },
    Auth: {
      type: String,
      required: [true, "Auth is required"],
    },
    UserName: {
        type: String,
        required: [true, "Auth is required"],
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24,
      },
  },
  { timestamps: true }
);

module.exports = Mongoose.model("Auth", Auth);
