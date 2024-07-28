const { required } = require("joi");
const mongoose = require("mongoose");
const { trim } = require("validator");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter the prodcut name "],
      maxlength: [100, "Name can not be more than 100 charcaters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter price of the prodcut "],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please enter  description of the product "],
      maxlength: [1000, "Description can not be more than 1000 charcaters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Please submit the product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please submit the company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#222"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0 ,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  match:{rating:{$gte:4}},
});

ProductSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await this.model("Review").deleteMany({
      product: this._id,
    });
  }
);

module.exports = mongoose.model("Product", ProductSchema);
