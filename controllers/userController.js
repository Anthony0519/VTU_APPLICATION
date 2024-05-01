import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const signUp = async (req, res) =>{
    try{
        const {
            fullname,
            email,
            phoneNumber,
            password,
            confirmPassword
    } = req.body
        const userExists = await userModel.findOne({email})

        if(userExists){
            return res.status(400).json({
                message: `User with email: ${userExists.email} already exists`
            })
        }
          
        if(password != confirmPassword){
            return res.status(400).json({
                message: `Password does not match`
            })
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        const user = await userModel.create({
            fullname,
            email:email.toLowerCase(),
            phoneNumber,
            walletId:phoneNumber.slice(1),
            password: hash,
        })
        res.status(201).json({
            message: `Welcome, ${user.fullname}. You have created an account successfully`,
            data: user
        })

    }catch(err){
        res.status(500).json({
            message: err.message 
        })
    }

}

//Create a login function for the user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the provided detail is an email or phone number
        const user = await userModel.findOne({email});

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        // Check if the provided password is correct
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid password',
            });
        }

        // Create and sign a JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                phoneNumber: user.phoneNumber,
            },
            process.env.JWT_KEY,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: `Welcome onboard, ${user.fullname}. You have successfully logged in`,
            data: user,
            token,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


export const logOut = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(404).json({
                message: 'This user does not exist',
            });
        }
        const token = req.headers.authorization.split(' ')[1];
        user.blacklist.push(token)
        await user.save()

        res.status(200).json({
            message: 'User signed out successfully',
            user
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


export const getOne = async (req, res) =>{
    try{
        const userId = req.user.userId

        const user = await userModel.findById(userId)

        if(!user){
            return res.status(404).json({
                message: `User not found`
            })
        }
        res.status(200).json({
            message: `User fetched successfully`,
            data: {
                name:user.fullname,
                email: user.email,
                wallet: user.walletId,
                Ballance:user.acctBalance
            }
        })

    }catch(err){
        res.status(500).json({
            message: err.message,
        })
    }
}

export const createPin = async (req, res) =>{
    try{
        const userId = req.user.userId
        const {pin} = req.body

        if(!pin || pin.length != 4){
            return res.status(400).json({
                message:`enter a valid 4-digit pin`
            })
        }
        // const salt = bcrypt.genSaltSync(10)
        // const hash = bcrypt.hashSync(pin, salt)
        const user = await userModel.findByIdAndUpdate(userId, {pin}, {new: true})

        if(!user){
            return res.status(404).json({
                message: `User not found`
            })
        }
        

       user.Pin = pin

        res.status(201).json({
            message: `Pin created successfully`,
            data: user
        })

    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}