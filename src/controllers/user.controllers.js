// 
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../utils/cloudinay.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    user.save({ validateBeforeSave: false })
    return { refreshToken, accessToken }
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating access or refresh token ")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend
  // validation - not empty
  // check if user already exist : username and password
  // check for images , check for avator
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation if create successful
  // return response


  //   1) get user detail from frontend

  // destructoring
  const { username, email, password, fullname } = req.body
  console.log("username", username);

  //validation start

  if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
    throw new ApiError;
  }

  // if(fullname === ""){
  //   throw new Error(400, "Something went wrong")
  // }

  // check if user already exist : username and password
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "username or email already exists")
  }

  // check for images , check for avator
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0].path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is necessary")
  }


  //upload image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "avatar image is necessary")
  }

  // create user object - create entry in db
  const user = await User.create({
    fullname,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase()
  })

  //check  user create in db or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user")
  }

  //return response
  return res.status(201).json(
    new ApiResponse(200, createdUser, "user registered successfully")
  )

  const loginUser = asyncHandler(async (req, res) => {
    // req.body --> data
    // username or email
    // find the user
    // password check
    //access and refresh token
    // send cookie

    //req.body ---> data
    const { username, email, password } = req.body

    if (!username || !email) {
      throw new ApiError(400, "email or username is required")
    }

    const user = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (!user) {
      throw new ApiError(404, "user does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
      throw new ApiError(401, "invalid user crediantials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser, accessToken, refreshToken

          },
          "user logged in successfully"
        )
      )
  })

  const logoutUser = asyncHandler(async (req, res) => {
      User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            refreshToken: undefined
          },
        },
        {
            new: true
        }
          
      )

      const options = {
        httpOnly: true,
        secure: true
      }
  })

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "user logged out successfully"))

})

export {
  registerUser,
  loginUser,
  logoutUser

}