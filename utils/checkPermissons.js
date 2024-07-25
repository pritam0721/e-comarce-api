const CustomError  =require('../errors');


const checkPermissons = (requestUser,resourceUserId)=>{
    // console.log(requestUser);
    // console.log(resourceUserId);
    // console.log(typeof requestUser);

    if(requestUser.role === 'admin') return;
    if(requestUser.userId === resourceUserId.toString()) return;
    throw new CustomError.UnauthorizedError('No authorize acess this route')
}

module.exports = checkPermissons;