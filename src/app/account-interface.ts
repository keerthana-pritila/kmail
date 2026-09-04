export interface AccountInterface {
    id?: string;
    name: string;
    surname: string;
    dob: string;
    gender: string;
    phone: string;
    username: string;
    password: string;
    createdAt: string; //tells us when the account was created
    profilePicture?: string;
}
