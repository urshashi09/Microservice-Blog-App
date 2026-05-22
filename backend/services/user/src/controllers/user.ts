import express from 'express';
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import trycatch from '../utils/tryCatch.js';
import type { AuthenticatedRequest } from '../middleware/isAuth.js';
import getBuffer from '../utils/dataUri.js';
import {v2 as cloudinary} from 'cloudinary'
import { oauth2 } from 'googleapis/build/src/apis/oauth2/index.js';
import { oAuth2Client } from '../utils/googleConfig.js';
import axios from 'axios';


export const login= trycatch(async (req, res) => {
    const{code}= req.body

    if(!code){
        return res.status(400).json({message: "authorization code is required"})
    }

    const googleResponse= await oAuth2Client.getToken(code)

    oAuth2Client.setCredentials(googleResponse.tokens)

    const userResponse= await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`)

    const {email, name, picture} = userResponse.data

        let user = await User.findOne({email})
        if (!user) {
            user = await User.create({
            email,
            name,
            image: picture
        })
        }
        const token = jwt.sign({user}, process.env.JWT_SECRET as string, {expiresIn: '1d'})
        res.status(200).json({
            message: "User logged in successfully",
            user,
            token
        })
});



export const myProfile= trycatch(async (req: AuthenticatedRequest,res)=>{
     const user= req.user
     res.status(200).json({user})
})


export const getProfile= trycatch(async (req, res) => {
    const {id} = req.params
    const user = await User.findById(id)
    if(!user) {
        return res.status(404).json({message: "User not found"})
    }
    res.status(200).json({user})
})


export const updateUser= trycatch(async (req: AuthenticatedRequest, res) => {
    const {name, instagram , facebook, linkedin, bio} = req.body
    const user= await User.findByIdAndUpdate(req.user?._id,{
        name, instagram , facebook, linkedin, bio
    }, {new: true} )

    const token= jwt.sign({user}, process.env.JWT_SECRET as string, {expiresIn: '1d'})

    res.status(200).json({
        message: "User updated successfully",
        user,
        token
    })
})


export const updateProfilePic= trycatch(async (req: AuthenticatedRequest, res) => {
    const file= req.file
    if (!file){
        return res.status(400).json({message: "No file uploaded"})
    }
    const fileBuffer= getBuffer(file)

    if(!fileBuffer || !fileBuffer.content) {
        return res.status(400).json({message: "Invalid file format"})
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    })

    const user= await User.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url
    }, {new: true})

    const token= jwt.sign({user}, process.env.JWT_SECRET as string, {expiresIn: '1d'})

    res.status(200).json({
        message: "Profile picture updated successfully",
        user,
        token
    })
    
})