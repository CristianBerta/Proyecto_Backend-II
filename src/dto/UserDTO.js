class UserDTO {
    constructor(user) {
        this.id = user._id || user.id;
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.email = user.email;
        this.age = user.age;
        if (user.cart) {
            this.cart = typeof user.cart === 'object' ? user.cart._id.toString() : user.cart.toString();
        } else {
            this.cart = null;
        }
        this.role = user.role;
    }
}

export default UserDTO;