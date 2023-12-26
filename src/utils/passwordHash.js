import bcrypt from 'bcrypt'


export const createHash=(password)=>bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const validatePass=(user, password)=>bcrypt.compareSync(password, user.password)