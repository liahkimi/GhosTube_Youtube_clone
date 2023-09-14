const userRouter = express. Router(); 

const handleEditUser = (req, res) => res.send("Edit User");

userRouter.get('/edit', handleEditUser)