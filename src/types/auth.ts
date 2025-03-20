export interface RegisterInput {
	email: string;
	username: string;
	password: string;
	gender: Gender;
	country: string;
}

export interface LoginInput {
	email: string;
	password: string;
}

enum Gender {
	MALE,
	FEMALE,
	OTHER,
}
