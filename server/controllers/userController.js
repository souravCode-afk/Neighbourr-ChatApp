import { generateToken } from "../lib/utils.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"
import { OAuth2Client } from "google-auth-library";

// Allow clock tolerance (24h) to prevent "Token used too early" if host system time drifts
OAuth2Client.CLOCK_SKEW_SECS_ = 86400;

const googleClient = new OAuth2Client(
    process.env.VITE_GOOGLE_CLIENT_ID
);

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.json({
                success: false,
                message: "Google credential is required"
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.VITE_GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {
            sub: googleId,
            email,
            name,
            picture
        } = payload;

        if (!email || !googleId) {
            return res.json({
                success: false,
                message: "Invalid Google account"
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        // Existing user
        if (user) {

            // Link Google account if not already linked
            if (!user.googleId) {
                user.googleId = googleId;

                if (!user.profilePic && picture) {
                    user.profilePic = picture;
                }

                await user.save();
            }

        } 
        // New user
        else {

            user = await User.create({
                email,
                fullName: name,
                googleId,
                profilePic: picture || "",
                bio: ""
            });
        }

        const token = generateToken(user._id);

        return res.json({
            success: true,
            userData: user,
            token,
            message: "Google login successful"
        });

    } catch (error) {
        console.log("Google login error:", error.message);

        return res.json({
            success: false,
            message: "Google authentication failed"
        });
    }
};

// Signup a new user
export const signup = async(req,res)=>{
    const {fullName,email,password,bio} = req.body
    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false, message: "Account already exists"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        })
        const token = generateToken(newUser._id)
        return res.json({success: true, userData: newUser, token, message:"Account created successfully"})
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}

// Controller to login a user
export const login = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const userData = await User.findOne({email})

        if(!userData){
            return res.json({success: false,message: "User does not exist"})
        }

        const isPasswordCorrect = await bcrypt.compare(password,userData.password)
        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid credentials"});
        }
        const token = generateToken(userData._id)
        return res.json({success: true, userData, token, message:"Login successfull"})
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}

// Controller to check if user is authenticated
export const checkAuth = (req,res)=>{
    res.json({success: true,user:req.user});
}

// Controller to update user profile details
export const updateProfile = async(req,res)=>{
    try {
        const {profilePic,bio,fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new: true});
        }
        else{
            console.log(profilePic?.slice(0, 50));
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId,{profilePic: upload.secure_url, bio,fullName},{new:true})
            
        }
        res.json({success:true, user:updatedUser})

    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}